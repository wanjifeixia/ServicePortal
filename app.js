const initialProjects = [
  { id: "serviceportal", name: "ServicePortal", description: "统一服务门户管理中心", url: "https://portal.pptqq.com/", repo: "https://github.com/wanjifeixia/ServicePortal", category: "tools", categoryName: "工具服务", icon: "SP", status: "active", statusText: "可访问", favorite: true },
  { id: "sub2api", name: "Sub2API", description: "统一的 AI API 订阅与账号服务", url: "https://pptqq.com", repo: "https://github.com/Wei-Shaw/sub2api", category: "ai", categoryName: "AI & API", icon: "S2", status: "active", statusText: "可访问", favorite: true },
  { id: "inboxops", name: "InboxOps", description: "Outlook 邮箱池与自动化管理", url: "https://inbox.pptqq.com", repo: "https://github.com/genz27/InboxOps", category: "mail", categoryName: "邮箱服务", icon: "IO", status: "active", statusText: "可访问", favorite: true },
  { id: "gpt-outlook-register", name: "GPT Outlook Register", description: "ChatGPT Outlook 注册与辅助工具", url: "https://gpt-outlook-register.pptqq.com/", repo: "https://github.com/Regert888/gpt-auto-register", category: "tools", categoryName: "工具服务", icon: "GR", status: "active", statusText: "可访问", favorite: false },
  { id: "chatgpt2api", name: "ChatGPT2API", description: "ChatGPT 网页能力 API 反代服务", url: "https://chatgpt2api.pptqq.com/", repo: "https://github.com/basketikun/chatgpt2api", category: "ai", categoryName: "AI & API", icon: "C2", status: "active", statusText: "可访问", favorite: true },
  { id: "icloud-privacy-mail", name: "iCloud Privacy Mail", description: "iCloud 隐私邮箱服务", url: "https://icloud-privacy-mail.pptqq.com/", repo: "https://github.com/q1953258942/iCloud-Privacy-Mail", category: "mail", categoryName: "邮箱服务", icon: "IP", status: "active", statusText: "可访问", favorite: false },
  { id: "cloudflare-temp-email", name: "Cloudflare Temp Email", description: "Cloudflare 临时邮箱服务", url: "https://mail.pptqq.com/", repo: "https://github.com/dreamhunter2333/cloudflare_temp_email", category: "mail", categoryName: "邮箱服务", icon: "CF", status: "active", statusText: "可访问", favorite: false },
  { id: "pay153", name: "PAY.153 Checkout Link", description: "多支付通道提链控制台", url: "https://pay153.pptqq.com/", repo: "https://github.com/1537271403/pay153-checkout-link", category: "tools", categoryName: "工具服务", icon: "P153", status: "active", statusText: "可访问", favorite: false },
  { id: "kiro-rs", name: "Kiro.rs", description: "Kiro API 管理控制台", url: "https://kirors.pptqq.com/admin", repo: "https://github.com/hank9999/kiro.rs", category: "ai", categoryName: "AI & API", icon: "KR", status: "active", statusText: "可访问", favorite: false },
];

const removedProjectIds = new Set(["paypal-agreement-protocol"]);
const CATEGORY_LABELS = { all: "全部项目", ai: "AI & API", mail: "邮箱服务", tools: "工具服务" };

const ICONS = {
  star: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  more: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`,
  external: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
  github: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>`,
  refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
  check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrowUp: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`,
  alert: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  circle: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/></svg>`,
  info: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

const state = {
  projects: loadProjects(),
  activities: loadActivities(),
  showAllActivity: false,
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
    if (!savedProjects) return initialProjects.map((project) => ({ ...project }));
    const parsedProjects = JSON.parse(savedProjects);
    if (!Array.isArray(parsedProjects)) return initialProjects.map((project) => ({ ...project }));
    const projects = parsedProjects.filter((project) => project && !removedProjectIds.has(project.id));
    // Preserve user customizations while adding newly shipped built-in projects.
    initialProjects.forEach((project) => {
      const existing = projects.find((saved) => saved && saved.id === project.id);
      if (!existing) {
        projects.push({ ...project });
      } else if (project.id === "gpt-outlook-register") {
        existing.repo = project.repo;
      }
    });
    localStorage.setItem("serviceportal.projects", JSON.stringify(projects));
    return projects;
  } catch {
    return initialProjects.map((project) => ({ ...project }));
  }
}

function saveProjects() {
  localStorage.setItem("serviceportal.projects", JSON.stringify(state.projects));
}

function loadActivities() {
  try {
    const saved = JSON.parse(localStorage.getItem("serviceportal.activity") || "[]");
    if (Array.isArray(saved) && saved.length) return saved.slice(0, 20);
  } catch {
    // Fall through to default entries.
  }
  const now = Date.now();
  return [
    { type: "check", title: "Portal 服务目录已就绪", detail: "已加载本地服务入口配置", ts: now - 3 * 60_000 },
    { type: "visit", title: "ServicePortal 管理门户已启动", detail: "安全会话模式已启用", ts: now - 45 * 60_000 },
  ];
}

function recordActivity(type, title, detail) {
  state.activities.unshift({ type, title, detail, ts: Date.now() });
  state.activities = state.activities.slice(0, 20);
  try {
    localStorage.setItem("serviceportal.activity", JSON.stringify(state.activities));
  } catch {
    // Ignore storage quota errors.
  }
  renderActivity();
}

function formatRelativeTime(ts) {
  const diffMin = Math.max(0, Math.floor((Date.now() - Number(ts || 0)) / 60_000));
  if (diffMin < 1) return "刚刚";
  if (diffMin < 60) return `${diffMin} 分钟前`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} 小时前`;
  return `${Math.floor(diffHour / 24)} 天前`;
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "#";
  } catch {
    return "#";
  }
}

function formatHost(value) {
  try {
    const url = new URL(value);
    return url.pathname && url.pathname !== "/" ? `${url.host}${url.pathname.replace(/\/$/, "")}` : url.host;
  } catch {
    return "";
  }
}

function categoryIcon(project) {
  return `<div class="service-icon icon-${escapeHtml(project.category)}">${escapeHtml(project.icon)}</div>`;
}

function initTheme() {
  const saved = localStorage.getItem("serviceportal.theme");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved === "dark" || saved === "light" ? saved : prefersDark ? "dark" : "light";
  document.documentElement.dataset.theme = theme;
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = next;
  localStorage.setItem("serviceportal.theme", next);
}

function renderDateEyebrow() {
  const target = document.querySelector("#currentDate");
  if (!target) return;
  try {
    target.textContent = new Intl.DateTimeFormat("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    }).format(new Date());
  } catch {
    target.textContent = "WORKSPACE OVERVIEW";
  }
}

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
  if (!update) {
    return `<div class="update-info"><span class="update-icon">${ICONS.circle}</span><small>等待检查 GitHub 版本</small></div>`;
  }
  const messages = {
    checking: ["checking", ICONS.refresh, "正在检查 GitHub 版本…"],
    available: ["available", ICONS.arrowUp, `发现新版本 ${update.latestSha || ""} · ${update.latestMessage || "可更新"}`],
    current: ["current", ICONS.check, update.message || `已是最新版本 ${update.localSha || update.latestSha || ""}`],
    unconfigured: ["unconfigured", ICONS.info, update.message || "尚未配置服务器部署目录"],
    blocked: ["blocked", ICONS.alert, update.message || "更新已被安全策略阻止"],
    error: ["error", ICONS.alert, update.message || "版本检查失败"],
    updating: ["updating", ICONS.refresh, "正在拉取代码并更新服务…"],
    updated: ["current", ICONS.check, update.message || "更新完成"],
  };
  const [className, icon, message] = messages[update.state] || messages.error;
  return `<div class="update-info ${className}" title="${escapeHtml(message)}"><span class="update-icon">${icon}</span><small>${escapeHtml(message)}</small></div>`;
}

function updateActionMarkup(project) {
  const update = state.updates[project.id];
  if (update?.state === "available") return `<button class="update-button" data-action="update">立即更新</button>`;
  if (update?.state === "updating") return `<button class="update-button" disabled>更新中…</button>`;
  return "";
}

function renderProjects() {
  const projects = visibleProjects();
  projectGrid.classList.toggle("list-layout", state.layout === "list");
  projectGrid.innerHTML = projects.length
    ? projects
        .map((project) => {
          const host = formatHost(project.url);
          return `
    <article class="project-card" data-id="${escapeHtml(project.id)}">
      <div class="card-main">
        <div class="card-top">
          ${categoryIcon(project)}
          <div class="card-heading">
            <h3 class="card-title">${escapeHtml(project.name)}</h3>
            <span class="card-host">${escapeHtml(host)}</span>
          </div>
          <div class="card-top-actions">
            <button class="favorite ${project.favorite ? "active" : ""}" data-action="favorite" title="${project.favorite ? "取消常用" : "加入常用"}" aria-label="收藏项目">${ICONS.star}</button>
            <button class="card-menu" data-action="menu" title="配置说明" aria-label="项目菜单">${ICONS.more}</button>
          </div>
        </div>
        <p class="card-description">${escapeHtml(project.description)}</p>
      </div>
      <div class="card-status-group">
        <div class="card-meta">
          <i class="status-dot ${project.status === "warning" ? "warning" : ""}"></i>
          <span class="status-text">${escapeHtml(project.statusText)}</span>
          <span class="category-pill">${escapeHtml(project.categoryName)}</span>
        </div>
        ${updateInfoMarkup(project)}
      </div>
      <div class="card-actions">
        <a class="action-primary" href="${safeUrl(project.url)}" target="_blank" rel="noreferrer" data-action="visit">打开服务 ${ICONS.external}</a>
        <a class="action-secondary" href="${safeUrl(project.repo)}" target="_blank" rel="noreferrer">${ICONS.github} GitHub</a>
        ${updateActionMarkup(project)}
      </div>
    </article>`;
        })
        .join("")
    : `<div class="empty-state">没有找到匹配的服务项目。<br /><button class="text-button" data-action="clearSearch">清除筛选条件</button></div>`;
  document.querySelector("#visibleCount").textContent = `${projects.length} 个服务`;
}

function renderStats() {
  const total = state.projects.length;
  const healthy = state.projects.filter((project) => project.status === "active").length;
  const favorites = state.projects.filter((project) => project.favorite).length;
  const pendingUpdates = Object.values(state.updates).filter((update) => update.state === "available").length;

  document.querySelector("#statProjects").textContent = total;
  document.querySelector("#statHealthy").textContent = healthy;
  document.querySelector("#healthyPercent").textContent = `${total ? Math.round((healthy / total) * 100) : 0}%`;
  document.querySelector("#statUpdates").textContent = pendingUpdates;
  document.querySelector("#statUpdatesCard")?.classList.toggle("has-updates", pendingUpdates > 0);
  document.querySelector("#statFavorites").textContent = favorites;
  document.querySelector("#navOverviewCount").textContent = total;
  document.querySelector("#allCount").textContent = total;
  ["ai", "mail", "tools"].forEach((category) => {
    document.querySelector(`#${category}Count`).textContent = state.projects.filter((project) => project.category === category).length;
  });
}

function renderActivity() {
  const entries = state.showAllActivity ? state.activities : state.activities.slice(0, 4);
  const symbolMap = {
    visit: ICONS.external,
    check: ICONS.refresh,
    update: ICONS.check,
    add: ICONS.arrowUp,
  };
  activityList.innerHTML = entries
    .map(
      (entry) => `
      <div class="activity-item">
        <span class="activity-symbol">${symbolMap[entry.type] || ICONS.info}</span>
        <div class="activity-copy">
          <strong>${escapeHtml(entry.title)}</strong>
          <small>${escapeHtml(entry.detail)}</small>
        </div>
        <span class="activity-time">${escapeHtml(formatRelativeTime(entry.ts))}</span>
      </div>`
    )
    .join("");
  const toggleBtn = document.querySelector("#viewAllActivity");
  if (toggleBtn) {
    toggleBtn.textContent = state.showAllActivity ? "收起记录 ↑" : "查看全部 →";
  }
}

function updateView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((item) => item.classList.toggle("active", item.dataset.view === view));
  const title = view === "favorites" ? "我的常用" : view === "operations" ? "运行状态" : "总览";
  document.querySelector("#breadcrumbCurrent").textContent = title;
  document.querySelector("#pageTitle").innerHTML = view === "overview" ? '欢迎回来，管理员 <span class="spark" aria-hidden="true">✦</span>' : title;
  document.querySelector("#pageDescription").textContent =
    view === "operations"
      ? "查看服务可用性与 GitHub 远端版本检测状态。"
      : view === "favorites"
        ? "快速访问你已收藏的常用服务入口。"
        : "所有服务都在这里，选择一个项目开始工作。";
  document.querySelector("#sectionTitle").textContent =
    view === "favorites" ? "我的常用" : view === "operations" ? "服务状态" : CATEGORY_LABELS[state.category] || "全部项目";
  renderProjects();
}

function setSidebarOpen(open) {
  document.querySelector("#sidebar").classList.toggle("open", open);
  document.querySelector("#sidebarBackdrop").hidden = !open;
}

function showToast(message, duration = 2800) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), duration);
}

function openModal() {
  document.querySelector("#modalBackdrop").hidden = false;
  document.querySelector("#projectForm input").focus();
}

function closeModal() {
  document.querySelector("#modalBackdrop").hidden = true;
  document.querySelector("#projectForm").reset();
}

function showLoginScreen(message = "") {
  document.querySelector("#loginScreen").hidden = false;
  document.querySelector("#loginError").textContent = message;
  document.querySelector("#loginForm input[name=token]").focus();
}

function hideLoginScreen() {
  document.querySelector("#loginScreen").hidden = true;
  document.querySelector("#loginError").textContent = "";
}

async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || `请求失败（HTTP ${response.status}）`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function loadAuthStatus() {
  try {
    const result = await apiFetch("/api/auth/status");
    state.authenticated = result.authenticated;
    state.authConfigured = result.configured;
    if (!result.authenticated) showLoginScreen(result.configured ? "" : "服务器尚未配置管理员令牌");
    else hideLoginScreen();
  } catch {
    state.authenticated = false;
    showLoginScreen("无法连接 Portal 服务，请检查后端是否已启动");
  }
}

async function checkUpdates(force = false) {
  if (state.checkingUpdates) return;
  state.checkingUpdates = true;
  const button = document.querySelector("#checkUpdates");
  button.disabled = true;
  button.classList.add("checking");
  button.querySelector("span").textContent = "正在检查";
  state.projects.forEach((project) => {
    state.updates[project.id] = { ...(state.updates[project.id] || {}), state: "checking" };
  });
  renderProjects();
  try {
    const result = await apiFetch(`/api/updates${force ? "?refresh=1" : ""}`);
    state.updates = Object.fromEntries(result.items.map((item) => [item.id, item]));
    const count = result.items.filter((item) => item.state === "available").length;
    document.querySelector(".sync-status").innerHTML = "<i></i>版本已同步";
    showToast(count ? `检测到 ${count} 个项目有新版本` : "版本检查完成");
    if (force) {
      recordActivity("check", "执行版本检查", count ? `发现 ${count} 个可更新项目` : "所有项目均已是最新状态");
    }
  } catch (error) {
    state.projects.forEach((project) => {
      state.updates[project.id] = { state: "error", message: error.message };
    });
    showToast(error.message, 4500);
  } finally {
    state.checkingUpdates = false;
    button.disabled = false;
    button.classList.remove("checking");
    button.querySelector("span").textContent = "检查更新";
    renderProjects();
    renderStats();
  }
}

async function requestProjectUpdate(projectId) {
  state.pendingUpdate = projectId;
  if (!state.authenticated) {
    showLoginScreen();
    return;
  }
  await performProjectUpdate(projectId);
}

async function performProjectUpdate(projectId) {
  const project = state.projects.find((item) => item.id === projectId);
  if (!project || !window.confirm(`确定更新 ${project.name}？\n\n系统将拉取 GitHub 最新代码并重启/重建该项目的服务。`)) return;
  const previous = state.updates[projectId] || {};
  state.updates[projectId] = { ...previous, state: "updating" };
  renderProjects();
  showToast(`${project.name} 正在更新，请勿重复操作`, 5000);
  try {
    const result = await apiFetch(`/api/projects/${encodeURIComponent(projectId)}/update`, { method: "POST", body: "{}" });
    state.updates[projectId] = { ...previous, state: "updated", message: result.message };
    showToast(`${project.name}：${result.message}`, 5000);
    recordActivity("update", `更新了 ${project.name}`, result.message);
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
    if (target.dataset.action === "favorite" && card) {
      const project = state.projects.find((item) => item.id === card.dataset.id);
      if (project) {
        project.favorite = !project.favorite;
        saveProjects();
        renderProjects();
        renderStats();
        showToast(project.favorite ? "已加入常用项目" : "已移出常用项目");
      }
    }
    if (target.dataset.action === "visit" && card) {
      const project = state.projects.find((item) => item.id === card.dataset.id);
      if (project) {
        showToast(`正在打开 ${project.name}`);
        recordActivity("visit", `访问了 ${project.name}`, formatHost(project.url) || project.url);
      }
    }
    if (target.dataset.action === "update" && card) requestProjectUpdate(card.dataset.id);
    if (target.dataset.action === "menu") showToast("项目更新配置位于服务器端 projects.config.json");
    if (target.dataset.action === "clearSearch") {
      state.query = "";
      document.querySelector("#searchInput").value = "";
      renderProjects();
    }
    if (target.dataset.action === "settings") showToast("更新白名单由服务器端 projects.config.json 管理");
  }

  const nav = event.target.closest(".nav-item");
  if (nav) {
    updateView(nav.dataset.view);
    setSidebarOpen(false);
  }

  const group = event.target.closest(".group-item");
  if (group) {
    state.category = group.dataset.category;
    document.querySelectorAll(".group-item").forEach((item) => item.classList.toggle("active", item === group));
    updateView(state.view);
    setSidebarOpen(false);
  }

  const layout = event.target.closest("[data-layout]");
  if (layout) {
    state.layout = layout.dataset.layout;
    document.querySelectorAll("[data-layout]").forEach((item) => item.classList.toggle("active", item === layout));
    renderProjects();
  }
});

document.querySelector("#searchInput").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProjects();
});

document.querySelector("#checkUpdates").addEventListener("click", () => checkUpdates(true));
document.querySelector("#addProject").addEventListener("click", openModal);
document.querySelector("#closeModal").addEventListener("click", closeModal);
document.querySelector("#cancelModal").addEventListener("click", closeModal);
document.querySelector("#modalBackdrop").addEventListener("click", (event) => {
  if (event.target.id === "modalBackdrop") closeModal();
});
document.querySelector("#themeToggle").addEventListener("click", toggleTheme);
document.querySelector("#viewAllActivity").addEventListener("click", () => {
  state.showAllActivity = !state.showAllActivity;
  renderActivity();
});
document.querySelector("#logoutButton").addEventListener("click", async () => {
  try {
    await apiFetch("/api/auth/logout", { method: "POST", body: "{}" });
  } catch {
    // Ignore network errors while logging out locally.
  }
  state.authenticated = false;
  showLoginScreen();
  showToast("已退出管理员登录");
});

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
    else setTimeout(() => checkUpdates(false), 150);
  } catch (error) {
    document.querySelector("#loginError").textContent = error.message;
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "登录";
    document.querySelector("#loginForm input[name=token]").value = "";
  }
});

document.querySelector("#projectForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.target);
  const name = data.get("name").trim();
  const url = data.get("url").trim();
  const id = `custom-${Date.now()}`;
  state.projects.push({
    id,
    name,
    description: "自定义服务项目",
    url,
    repo: data.get("repo").trim() || "#",
    category: data.get("category"),
    categoryName: CATEGORY_LABELS[data.get("category")] || "工具服务",
    icon: name.slice(0, 2).toUpperCase(),
    status: "active",
    statusText: "已配置",
    favorite: false,
  });
  saveProjects();
  state.updates[id] = { state: "unconfigured", message: "自定义项目尚未加入服务器更新白名单" };
  renderStats();
  renderProjects();
  closeModal();
  recordActivity("add", `添加了 ${name}`, formatHost(url) || url);
  showToast("项目已添加到 Portal");
});

document.querySelector("#mobileMenu").addEventListener("click", () => {
  setSidebarOpen(!document.querySelector("#sidebar").classList.contains("open"));
});
document.querySelector("#sidebarBackdrop").addEventListener("click", () => setSidebarOpen(false));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!document.querySelector("#modalBackdrop").hidden) closeModal();
    if (document.querySelector("#sidebar").classList.contains("open")) setSidebarOpen(false);
  }
  if (event.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName) && document.querySelector("#loginScreen").hidden && document.querySelector("#modalBackdrop").hidden) {
    event.preventDefault();
    document.querySelector("#searchInput").focus();
  }
});

initTheme();
renderDateEyebrow();
renderStats();
renderProjects();
renderActivity();
loadAuthStatus().then(() => {
  if (state.authenticated) setTimeout(() => checkUpdates(false), 300);
});
