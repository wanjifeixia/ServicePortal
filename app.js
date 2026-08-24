const initialProjects = [
  { id: "serviceportal", name: "ServicePortal", description: "统一服务门户管理中心", url: "https://portal.pptqq.com/", repo: "https://github.com/wanjifeixia/ServicePortal", category: "tools", categoryName: "工具服务", icon: "SP", status: "active", statusText: "可访问", favorite: true },
  { id: "sub2api", name: "Sub2API", description: "统一的 AI API 订阅与账号服务", url: "https://pptqq.com", repo: "https://github.com/Wei-Shaw/sub2api", category: "ai", categoryName: "AI & API", icon: "S2", status: "active", statusText: "可访问", favorite: true },
  { id: "inboxops", name: "InboxOps", description: "Outlook 邮箱池与自动化管理", url: "https://inbox.pptqq.com", repo: "https://github.com/genz27/InboxOps", category: "mail", categoryName: "邮箱服务", icon: "IO", status: "active", statusText: "可访问", favorite: true },
  { id: "gpt-outlook-register", name: "GPT Outlook Register", description: "ChatGPT Outlook 注册与辅助工具", url: "https://gpt-outlook-register.pptqq.com/", repo: "https://github.com/Regert888/gpt-outlook-register", category: "tools", categoryName: "工具服务", icon: "GR", status: "active", statusText: "可访问", favorite: false },
  { id: "chatgpt2api", name: "ChatGPT2API", description: "ChatGPT 网页能力 API 反代服务", url: "https://chatgpt2api.pptqq.com/", repo: "https://github.com/basketikun/chatgpt2api", category: "ai", categoryName: "AI & API", icon: "C2", status: "active", statusText: "可访问", favorite: true },
  { id: "icloud-privacy-mail", name: "iCloud Privacy Mail", description: "iCloud 隐私邮箱服务", url: "https://icloud-privacy-mail.pptqq.com/", repo: "https://github.com/q1953258942/iCloud-Privacy-Mail", category: "mail", categoryName: "邮箱服务", icon: "IP", status: "active", statusText: "可访问", favorite: false },
  { id: "cloudflare-temp-email", name: "Cloudflare Temp Email", description: "Cloudflare 临时邮箱服务", url: "https://mail.pptqq.com/", repo: "https://github.com/dreamhunter2333/cloudflare_temp_email", category: "mail", categoryName: "邮箱服务", icon: "CF", status: "active", statusText: "可访问", favorite: false },
];

const state = {
  projects: loadProjects(),
  category: "all",
  view: "overview",
  layout: "grid",
  query: "",
  updates: {},
  checkingUpdates: false,
  authenticated: false,
  authConfigured: null,
  pendingUpdate: null,
};

const projectGrid = document.querySelector("#projectGrid");
const activityList = document.querySelector("#activityList");
const toast = document.querySelector("#toast");

function loadProjects() {
  try {
    const savedProjects = localStorage.getItem("serviceportal.projects") || localStorage.getItem("servicehub.projects");
    if (!savedProjects) return initialProjects;
    const projects = JSON.parse(savedProjects);
    if (!Array.isArray(projects)) return initialProjects;
    // Preserve user customizations while adding newly shipped built-in projects.
    initialProjects.forEach((project) => {
      if (!projects.some((saved) => saved && saved.id === project.id)) projects.push(project);
    });
    localStorage.setItem("serviceportal.projects", JSON.stringify(projects));
    return projects;
  } catch { return initialProjects; }
}

function saveProjects() { localStorage.setItem("serviceportal.projects", JSON.stringify(state.projects)); }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]); }
function safeUrl(value) { try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) ? url.href : "#"; } catch { return "#"; } }
function categoryIcon(project) { return `<div class="service-icon icon-${escapeHtml(project.category)}">${escapeHtml(project.icon)}</div>`; }

function visibleProjects() {
  return state.projects.filter((project) => {
    const matchesCategory = state.category === "all" || project.category === state.category;
    const q = state.query.toLowerCase().trim();
    const matchesQuery = !q || [project.name, project.description, project.url, project.categoryName].some((value) => String(value || "").toLowerCase().includes(q));
    const matchesView = state.view !== "favorites" || project.favorite;
    return matchesCategory && matchesQuery && matchesView;
  });
}

function updateInfoMarkup(project) {
  const update = state.updates[project.id];
  if (!update) return `<div class="update-info"><span class="update-icon">○</span><small>等待检查 GitHub 版本</small></div>`;
  const messages = {
    checking: ["checking", "↻", "正在检查 GitHub 版本…"],
    available: ["available", "↑", `发现新版本 ${update.latestSha || ""} · ${update.latestMessage || "可更新"}`],
    current: ["current", "✓", update.message || `已是最新版本 ${update.localSha || update.latestSha || ""}`],
    unconfigured: ["unconfigured", "◇", update.message || "尚未配置服务器部署目录"],
    blocked: ["blocked", "!", update.message || "更新已被安全策略阻止"],
    error: ["error", "!", update.message || "版本检查失败"],
    updating: ["updating", "↻", "正在拉取代码并重建容器…"],
    updated: ["current", "✓", update.message || "更新完成"],
  };
  const [className, icon, message] = messages[update.state] || messages.error;
  return `<div class="update-info ${className}" title="${escapeHtml(message)}"><span class="update-icon">${icon}</span><small>${escapeHtml(message)}</small></div>`;
}

function updateActionMarkup(project) {
  const update = state.updates[project.id];
  if (update?.state === "available") return `<button class="update-button" data-action="update">更新项目</button>`;
  if (update?.state === "updating") return `<button class="update-button" disabled>更新中…</button>`;
  return "";
}

function renderProjects() {
  const projects = visibleProjects();
  projectGrid.classList.toggle("list-layout", state.layout === "list");
  projectGrid.innerHTML = projects.length ? projects.map((project) => `
    <article class="project-card" data-id="${escapeHtml(project.id)}">
      <div class="card-top">${categoryIcon(project)}<button class="card-menu" data-action="menu" aria-label="项目菜单">···</button></div>
      <button class="favorite ${project.favorite ? "active" : ""}" data-action="favorite" aria-label="收藏项目">★</button>
      <h3 class="card-title">${escapeHtml(project.name)}</h3><p class="card-description">${escapeHtml(project.description)}</p>
      <div class="card-meta"><i class="status-dot ${project.status === "warning" ? "warning" : ""}"></i><span class="status-text">${escapeHtml(project.statusText)}</span><span class="category-pill">${escapeHtml(project.categoryName)}</span></div>
      ${updateInfoMarkup(project)}
      <div class="card-actions"><a href="${safeUrl(project.url)}" target="_blank" rel="noreferrer" data-action="visit">打开服务 ↗</a><span>·</span><a href="${safeUrl(project.repo)}" target="_blank" rel="noreferrer">GitHub ↗</a>${updateActionMarkup(project)}</div>
    </article>`).join("") : `<div class="empty-state">没有找到匹配的项目。<br /><button class="text-button" data-action="clearSearch">清除筛选</button></div>`;
  document.querySelector("#visibleCount").textContent = `${projects.length} 个服务`;
}

function renderStats() {
  document.querySelector("#statProjects").textContent = state.projects.length;
  document.querySelector("#statHealthy").textContent = state.projects.filter((project) => project.status === "active").length;
  document.querySelector("#statUpdates").textContent = Object.values(state.updates).filter((update) => update.state === "available").length;
  document.querySelector("#allCount").textContent = state.projects.length;
  ["ai", "mail", "tools"].forEach((category) => { document.querySelector(`#${category}Count`).textContent = state.projects.filter((project) => project.category === category).length; });
}

function renderActivity() {
  const entries = state.projects.slice(0, 4).map((project, index) => ({ icon: index === 0 ? "↗" : index === 1 ? "✓" : "◌", title: index === 0 ? `访问了 ${project.name}` : index === 1 ? `${project.name} 状态检查通过` : `${project.name} 已加入服务目录`, time: index === 0 ? "刚刚" : `${index + 1} 小时前` }));
  activityList.innerHTML = entries.map((entry) => `<div class="activity-item"><span class="activity-symbol">${entry.icon}</span><div class="activity-copy"><strong>${escapeHtml(entry.title)}</strong><small>ServicePortal 活动记录</small></div><span class="activity-time">${entry.time}</span></div>`).join("");
}

function updateView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const title = view === "favorites" ? "我的常用" : view === "operations" ? "运行状态" : "总览";
  document.querySelector("#breadcrumbCurrent").textContent = title;
  document.querySelector("#pageTitle").innerHTML = view === "overview" ? "欢迎回来，管理员 <span>✦</span>" : title;
  document.querySelector("#pageDescription").textContent = view === "operations" ? "查看服务可用性与待处理的更新任务。" : view === "favorites" ? "快速访问你最常用的服务。" : "所有服务都在这里，选择一个项目开始工作。";
  document.querySelector("#sectionTitle").textContent = view === "favorites" ? "我的常用" : view === "operations" ? "服务状态" : state.category === "all" ? "全部项目" : document.querySelector(`[data-category="${state.category}"]`).textContent.trim();
  renderProjects();
}

function showToast(message, duration = 2800) { toast.textContent = message; toast.classList.add("show"); clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove("show"), duration); }
function openModal() { document.querySelector("#modalBackdrop").hidden = false; document.querySelector("#projectForm input").focus(); }
function closeModal() { document.querySelector("#modalBackdrop").hidden = true; document.querySelector("#projectForm").reset(); }
function showLoginScreen(message = "") { document.querySelector("#loginScreen").hidden = false; document.querySelector("#loginError").textContent = message; document.querySelector("#loginForm input[name=token]").focus(); }
function hideLoginScreen() { document.querySelector("#loginScreen").hidden = true; document.querySelector("#loginError").textContent = ""; }

async function apiFetch(url, options = {}) {
  const response = await fetch(url, { credentials: "same-origin", ...options, headers: { "Content-Type": "application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const error = new Error(data.error || `请求失败（HTTP ${response.status}）`); error.status = response.status; error.data = data; throw error; }
  return data;
}

async function loadAuthStatus() {
  try {
    const result = await apiFetch("/api/auth/status");
    state.authenticated = result.authenticated;
    state.authConfigured = result.configured;
    if (!result.authenticated) showLoginScreen(result.configured ? "" : "服务器尚未配置管理员令牌");
    else hideLoginScreen();
  } catch { state.authenticated = false; showLoginScreen("无法连接 ServicePortal 服务，请检查后端是否已启动"); }
}

async function checkUpdates(force = false) {
  if (state.checkingUpdates) return;
  state.checkingUpdates = true;
  const button = document.querySelector("#checkUpdates");
  button.disabled = true;
  button.classList.add("checking");
  button.innerHTML = "<span>↻</span>正在检查";
  state.projects.forEach((project) => { state.updates[project.id] = { ...(state.updates[project.id] || {}), state: "checking" }; });
  renderProjects();
  try {
    const result = await apiFetch(`/api/updates${force ? "?refresh=1" : ""}`);
    state.updates = Object.fromEntries(result.items.map((item) => [item.id, item]));
    const count = result.items.filter((item) => item.state === "available").length;
    document.querySelector(".sync-status").innerHTML = "<i></i>版本已同步";
    showToast(count ? `检测到 ${count} 个项目有新版本` : "版本检查完成");
  } catch (error) {
    state.projects.forEach((project) => { state.updates[project.id] = { state: "error", message: error.message }; });
    showToast(error.message, 4500);
  } finally {
    state.checkingUpdates = false;
    button.disabled = false;
    button.classList.remove("checking");
    button.innerHTML = "<span>↻</span>检查更新";
    renderProjects();
    renderStats();
  }
}

async function requestProjectUpdate(projectId) {
  state.pendingUpdate = projectId;
  if (!state.authenticated) { showLoginScreen(); return; }
  await performProjectUpdate(projectId);
}

async function performProjectUpdate(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || !window.confirm(`确定更新 ${project.name}？\n\n系统将拉取 GitHub 最新代码并重新构建该项目的 Docker Compose 服务。`)) return;
  const previous = state.updates[projectId] || {};
  state.updates[projectId] = { ...previous, state: "updating" };
  renderProjects();
  showToast(`${project.name} 正在更新，请勿重复操作`, 5000);
  try {
    const result = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/update`, { method: "POST", body: "{}" });
    state.updates[projectId] = { ...previous, state: "updated", message: result.message };
    showToast(`${project.name}：${result.message}`, 5000);
    await checkUpdates(true);
  } catch (error) {
    if (error.status === 401) {
      state.authenticated = false;
      state.updates[projectId] = previous;
      showLoginScreen("登录会话已失效，请重新登录");
    } else {
      state.updates[projectId] = { ...previous, state: "error", message: error.message };
      showToast(`更新失败：${error.message}`, 6000);
    }
    renderProjects();
    renderStats();
  }
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (target) {
    const card = target.closest(".project-card");
    if (target.dataset.action === "favorite" && card) { const project = state.projects.find((item) => item.id === card.dataset.id); project.favorite = !project.favorite; saveProjects(); renderProjects(); showToast(project.favorite ? "已加入常用项目" : "已移出常用项目"); }
    if (target.dataset.action === "visit" && card) { const project = state.projects.find((item) => item.id === card.dataset.id); showToast(`正在打开 ${project.name}`); }
    if (target.dataset.action === "update" && card) requestProjectUpdate(card.dataset.id);
    if (target.dataset.action === "menu") showToast("项目更新配置位于 projects.config.json");
    if (target.dataset.action === "clearSearch") { state.query = ""; document.querySelector("#searchInput").value = ""; renderProjects(); }
    if (target.dataset.action === "settings") showToast("更新白名单由服务器端 projects.config.json 管理");
  }
  const nav = event.target.closest(".nav-item"); if (nav) updateView(nav.dataset.view);
  const group = event.target.closest(".group-item"); if (group) { state.category = group.dataset.category; document.querySelectorAll(".group-item").forEach((item) => item.classList.toggle("active", item === group)); updateView(state.view); }
  const layout = event.target.closest("[data-layout]"); if (layout) { state.layout = layout.dataset.layout; document.querySelectorAll("[data-layout]").forEach((item) => item.classList.toggle("active", item === layout)); renderProjects(); }
});

document.querySelector("#searchInput").addEventListener("input", (event) => { state.query = event.target.value; renderProjects(); });
document.querySelector("#checkUpdates").addEventListener("click", () => checkUpdates(true));
document.querySelector("#addProject").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#cancelModal").addEventListener("click", closeModal);
document.querySelector("#modalBackdrop").addEventListener("click", (event) => { if (event.target.id === "modalBackdrop") closeModal(); });
document.querySelector("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const submitButton = event.target.querySelector("button[type=submit]");
  const data = new FormData(event.target);
  const username = data.get("username");
  const token = data.get("token");
  submitButton.disabled = true;
  submitButton.textContent = "正在登录…";
  try {
    await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ username, token }) });
    state.authenticated = true;
    hideLoginScreen();
    const projectId = state.pendingUpdate;
    state.pendingUpdate = null;
    if (projectId) await performProjectUpdate(projectId);
  } catch (error) { document.querySelector("#loginError").textContent = error.message; }
  finally { submitButton.disabled = false; submitButton.textContent = "登录"; document.querySelector("#loginForm input[name=token]").value = ""; }
});
document.querySelector("#projectForm").addEventListener("submit", (event) => { event.preventDefault(); const data = new FormData(event.target); const name = data.get("name").trim(); const id = `custom-${Date.now()}`; state.projects.push({ id, name, description: "自定义服务项目", url: data.get("url").trim(), repo: data.get("repo").trim() || "#", category: data.get("category"), categoryName: { ai: "AI & API", mail: "邮箱服务", tools: "工具服务" }[data.get("category")], icon: name.slice(0, 2).toUpperCase(), status: "active", statusText: "已配置", favorite: false }); saveProjects(); state.updates[id] = { state: "unconfigured", message: "自定义项目尚未加入服务器更新白名单" }; renderStats(); renderProjects(); closeModal(); showToast("项目已添加到 ServicePortal"); });
document.querySelector("#mobileMenu").addEventListener("click", () => document.querySelector("#sidebar").classList.toggle("open"));

renderStats();
renderProjects();
renderActivity();
loadAuthStatus().then(() => {
  if (state.authenticated) setTimeout(() => checkUpdates(false), 300);
});
