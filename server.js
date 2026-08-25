const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { checkAllProjects, readProjectConfig, updateProject } = require("./update-manager");

function loadLocalEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, "");
  }
}

loadLocalEnv(path.join(__dirname, ".env"));

const port = Number(process.env.PORT || 4173);
const host = process.env.HOST || "127.0.0.1";
const root = __dirname;
const adminToken = String(process.env.SERVICEPORTAL_ADMIN_TOKEN || "");
const projectConfig = readProjectConfig(path.join(root, "projects.config.json"));
const publicFiles = new Set(["index.html", "styles.css", "updates.css", "app.js", "favicon.svg"]);
const sessions = new Map();
const loginAttempts = new Map();
const sessionLifetimeMs = 12 * 60 * 60 * 1000;
let updateCache = { expiresAt: 0, items: [] };

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function securityHeaders() {
  return {
    "Content-Security-Policy": "default-src 'self'; style-src 'self' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

function sendJson(response, statusCode, body, extraHeaders = {}) {
  response.writeHead(statusCode, { ...securityHeaders(), ...extraHeaders, "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 16_384) request.destroy();
    });
    request.on("end", () => {
      try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error("请求数据格式无效")); }
    });
    request.on("error", reject);
  });
}

function parseCookies(request) {
  return Object.fromEntries(String(request.headers.cookie || "").split(";").map((part) => part.trim().split("=")).filter(([key, value]) => key && value).map(([key, value]) => [key, decodeURIComponent(value)]));
}

function isAuthenticated(request) {
  const sessionId = parseCookies(request).serviceportal_session;
  const expiresAt = sessions.get(sessionId);
  if (!sessionId || !expiresAt || expiresAt < Date.now()) {
    if (sessionId) sessions.delete(sessionId);
    return false;
  }
  return true;
}

function tokenMatches(candidate) {
  if (!adminToken || !candidate) return false;
  const expected = Buffer.from(adminToken);
  const supplied = Buffer.from(String(candidate));
  return expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied);
}

function requestIp(request) {
  return String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
}

function loginAllowed(ip) {
  const now = Date.now();
  const attempts = (loginAttempts.get(ip) || []).filter((time) => now - time < 10 * 60_000);
  loginAttempts.set(ip, attempts);
  return attempts.length < 5;
}

function recordFailedLogin(ip) {
  const attempts = loginAttempts.get(ip) || [];
  attempts.push(Date.now());
  loginAttempts.set(ip, attempts);
}

function hasValidOrigin(request) {
  const origin = request.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === request.headers.host; } catch { return false; }
}

async function handleApi(request, response, url) {
  if (!hasValidOrigin(request)) {
    sendJson(response, 403, { error: "请求来源无效" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/auth/status") {
    sendJson(response, 200, { authenticated: isAuthenticated(request), configured: Boolean(adminToken) });
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/login") {
    if (!adminToken) {
      sendJson(response, 503, { error: "服务器尚未设置 SERVICEPORTAL_ADMIN_TOKEN" });
      return;
    }
    const ip = requestIp(request);
    if (!loginAllowed(ip)) {
      sendJson(response, 429, { error: "登录尝试次数过多，请稍后重试" });
      return;
    }
    try {
      const body = await readJson(request);
      if (String(body.username || "") !== "admin") {
        recordFailedLogin(ip);
        sendJson(response, 401, { error: "账号或管理员令牌不正确" });
        return;
      }
      if (!tokenMatches(body.token)) {
        recordFailedLogin(ip);
        sendJson(response, 401, { error: "账号或管理员令牌不正确" });
        return;
      }
      loginAttempts.delete(ip);
      const sessionId = crypto.randomBytes(32).toString("base64url");
      sessions.set(sessionId, Date.now() + sessionLifetimeMs);
      const secure = request.headers["x-forwarded-proto"] === "https" ? "; Secure" : "";
      sendJson(response, 200, { ok: true }, { "Set-Cookie": `serviceportal_session=${sessionId}; HttpOnly; SameSite=Strict; Path=/; Max-Age=43200${secure}` });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/auth/logout") {
    const sessionId = parseCookies(request).serviceportal_session;
    if (sessionId) sessions.delete(sessionId);
    sendJson(response, 200, { ok: true }, { "Set-Cookie": "serviceportal_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0" });
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/updates") {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "请先登录 ServicePortal", requiresAuth: true });
      return;
    }
    try {
      const refresh = url.searchParams.get("refresh") === "1";
      if (refresh || updateCache.expiresAt < Date.now()) updateCache = { items: await checkAllProjects(projectConfig), expiresAt: Date.now() + 60_000 };
      sendJson(response, 200, { items: updateCache.items, checkedAt: new Date().toISOString() });
    } catch (error) {
      sendJson(response, 502, { error: `检查更新失败：${error.message}` });
    }
    return;
  }

  const updateMatch = url.pathname.match(/^\/api\/projects\/([a-z0-9-]+)\/update$/);
  if (request.method === "POST" && updateMatch) {
    if (!isAuthenticated(request)) {
      sendJson(response, 401, { error: "请先验证管理员身份", requiresAuth: true });
      return;
    }
    const project = projectConfig.find((item) => item.id === updateMatch[1]);
    if (!project) {
      sendJson(response, 404, { error: "项目不在更新白名单中" });
      return;
    }
    try {
      const result = await updateProject(project);
      updateCache.expiresAt = 0;
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 409, { error: error.message.slice(0, 500) });
    }
    return;
  }

  sendJson(response, 404, { error: "API 不存在" });
}

function serveStatic(request, response, url) {
  const requestPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.resolve(root, `.${decodeURIComponent(requestPath)}`);
  const relative = path.relative(root, filePath);
  const publicPath = relative.split(path.sep).join("/");
  if (relative.startsWith("..") || path.isAbsolute(relative) || (!publicFiles.has(publicPath) && !publicPath.startsWith("assets/"))) {
    response.writeHead(403, securityHeaders()).end("Forbidden");
    return;
  }
  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(error.code === "ENOENT" ? 404 : 500, securityHeaders()).end("Not found");
      return;
    }
    response.writeHead(200, { ...securityHeaders(), "Cache-Control": "no-cache, must-revalidate", "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream" });
    response.end(request.method === "HEAD" ? undefined : content);
  });
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname.startsWith("/api/")) await handleApi(request, response, url);
  else if (request.method === "GET" || request.method === "HEAD") serveStatic(request, response, url);
  else response.writeHead(405, securityHeaders()).end("Method not allowed");
});

server.listen(port, host, () => {
  console.log(`ServicePortal is running at http://${host}:${port}`);
  if (!adminToken) console.warn("Update actions are locked: SERVICEPORTAL_ADMIN_TOKEN is not configured.");
});
