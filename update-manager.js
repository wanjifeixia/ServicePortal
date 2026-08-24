const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const runningUpdates = new Set();
const maxOutputLength = 12_000;

function readProjectConfig(configPath) {
  const items = JSON.parse(fs.readFileSync(configPath, "utf8"));
  if (!Array.isArray(items)) throw new Error("projects.config.json 必须是数组");
  return items.map((item) => validateProject(item));
}

function validateProject(item) {
  const id = String(item.id || "").trim();
  const repository = String(item.repository || "").trim();
  const serviceName = String(item.serviceName || "").trim();
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`项目 ${id || "unknown"} 的 id 无效`);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) throw new Error(`项目 ${item.id || "unknown"} 的 repository 无效`);
  if (!/^[A-Za-z0-9._/-]+$/.test(String(item.branch || ""))) throw new Error(`项目 ${item.id || "unknown"} 的 branch 无效`);
  if (serviceName && !/^[A-Za-z0-9_.@-]+$/.test(serviceName)) throw new Error(`项目 ${item.id || "unknown"} 的 serviceName 无效`);
  return {
    id,
    repository,
    branch: String(item.branch || "main").trim(),
    deployPath: String(item.deployPath || "").trim(),
    composeFile: String(item.composeFile || "docker-compose.yml").trim(),
    serviceName,
    updateEnabled: item.updateEnabled === true,
    skipUpdateCheck: item.skipUpdateCheck === true,
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: options.cwd, shell: false, env: process.env, windowsHide: true });
    let stdout = "";
    let stderr = "";
    const timer = setTimeout(() => child.kill(), options.timeoutMs || 120_000);
    child.stdout.on("data", (chunk) => { stdout = (stdout + chunk).slice(-maxOutputLength); });
    child.stderr.on("data", (chunk) => { stderr = (stderr + chunk).slice(-maxOutputLength); });
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      else reject(new Error((stderr || stdout || `${command} 执行失败，退出码 ${code}`).trim()));
    });
  });
}

function repositoryFromRemote(value) {
  const normalized = String(value || "").trim().replace(/\.git$/, "");
  const match = normalized.match(/github\.com[/:]([^/]+\/[^/]+)$/i);
  return match ? match[1].toLowerCase() : "";
}

async function getGitHubCommit(project) {
  try {
    const headers = { Accept: "application/vnd.github+json", "User-Agent": "ServicePortal" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const url = `https://api.github.com/repos/${project.repository}/commits/${encodeURIComponent(project.branch)}`;
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15_000) });
    if (!response.ok) throw new Error(`GitHub 返回 HTTP ${response.status}`);
    const data = await response.json();
    return {
      sha: String(data.sha || ""),
      message: String(data.commit?.message || "").split("\n")[0].slice(0, 120),
      publishedAt: data.commit?.committer?.date || data.commit?.author?.date || null,
      url: data.html_url || `https://github.com/${project.repository}`,
    };
  } catch (apiError) {
    try {
      const remoteUrl = `https://github.com/${project.repository}.git`;
      const { stdout } = await run("git", ["ls-remote", remoteUrl, `refs/heads/${project.branch}`], { timeoutMs: 30_000 });
      const sha = stdout.split(/\s+/)[0];
      if (!/^[a-f0-9]{40}$/i.test(sha)) throw new Error("没有找到远端分支");
      return { sha, message: `GitHub ${project.branch} 分支最新提交`, publishedAt: null, url: `https://github.com/${project.repository}/commit/${sha}` };
    } catch {
      throw apiError;
    }
  }
}

function publicBase(project) {
  return { id: project.id, repository: project.repository, branch: project.branch, updateEnabled: project.updateEnabled, skipUpdateCheck: project.skipUpdateCheck };
}

async function checkProject(project) {
  const base = publicBase(project);
  if (project.skipUpdateCheck) {
    return { ...base, state: "current", updateAvailable: false, message: "已是最新版本" };
  }
  let remote;
  try {
    remote = await getGitHubCommit(project);
  } catch (error) {
    return { ...base, state: "error", message: error.message };
  }

  if (!project.updateEnabled) {
    return { ...base, state: "unconfigured", latestSha: remote.sha.slice(0, 7), latestMessage: remote.message, latestAt: remote.publishedAt, releaseUrl: remote.url, message: "服务器更新白名单未启用" };
  }

  if (!project.deployPath) {
    return { ...base, state: "unconfigured", latestSha: remote.sha.slice(0, 7), latestMessage: remote.message, latestAt: remote.publishedAt, releaseUrl: remote.url, message: "尚未配置服务器部署目录" };
  }

  const deployPath = path.resolve(project.deployPath);
  if (!fs.existsSync(path.join(deployPath, ".git"))) {
    return { ...base, state: "unconfigured", latestSha: remote.sha.slice(0, 7), latestMessage: remote.message, latestAt: remote.publishedAt, releaseUrl: remote.url, message: "部署目录不存在或不是 Git 仓库" };
  }

  try {
    const [{ stdout: localSha }, { stdout: originUrl }] = await Promise.all([
      run("git", ["-C", deployPath, "rev-parse", "HEAD"], { timeoutMs: 10_000 }),
      run("git", ["-C", deployPath, "config", "--get", "remote.origin.url"], { timeoutMs: 10_000 }),
    ]);
    if (repositoryFromRemote(originUrl) !== project.repository.toLowerCase()) {
      return { ...base, state: "blocked", message: "部署目录的 GitHub 仓库与白名单不匹配" };
    }
    const updateAvailable = localSha.trim() !== remote.sha;
    return {
      ...base,
      state: updateAvailable ? "available" : "current",
      updateAvailable,
      localSha: localSha.trim().slice(0, 7),
      latestSha: remote.sha.slice(0, 7),
      latestMessage: remote.message,
      latestAt: remote.publishedAt,
      releaseUrl: remote.url,
      message: updateAvailable ? "检测到 GitHub 新版本" : "当前已经是最新版本",
    };
  } catch (error) {
    return { ...base, state: "error", message: error.message.slice(0, 240) };
  }
}

async function checkAllProjects(projects) {
  return Promise.all(projects.map((project) => checkProject(project)));
}

async function updateProject(project) {
  if (!project || !project.updateEnabled || !project.deployPath) throw new Error("该项目未启用服务器更新");
  if (runningUpdates.has(project.id)) throw new Error("该项目正在更新中");

  const unresolvedDeployPath = path.resolve(project.deployPath);
  if (!fs.existsSync(unresolvedDeployPath)) throw new Error("部署目录不存在或不是 Git 仓库");
  const deployPath = fs.realpathSync(unresolvedDeployPath);
  let composePath = "";
  if (!project.serviceName) {
    const unresolvedComposePath = path.resolve(deployPath, project.composeFile);
    if (!fs.existsSync(unresolvedComposePath)) throw new Error("找不到项目的 Docker Compose 文件");
    composePath = fs.realpathSync(unresolvedComposePath);
    if (!composePath.startsWith(`${deployPath}${path.sep}`)) throw new Error("Compose 文件路径不在部署目录中");
  }
  if (!fs.existsSync(path.join(deployPath, ".git"))) throw new Error("部署目录不存在或不是 Git 仓库");

  runningUpdates.add(project.id);
  try {
    const { stdout: originUrl } = await run("git", ["-C", deployPath, "config", "--get", "remote.origin.url"], { timeoutMs: 10_000 });
    if (repositoryFromRemote(originUrl) !== project.repository.toLowerCase()) throw new Error("部署目录的 GitHub 仓库与白名单不匹配");

    const { stdout: changes } = await run("git", ["-C", deployPath, "status", "--porcelain", "--untracked-files=no"], { timeoutMs: 10_000 });
    if (changes) throw new Error("项目存在未提交的已跟踪文件修改，请先处理后再更新");

    const { stdout: previousSha } = await run("git", ["-C", deployPath, "rev-parse", "HEAD"], { timeoutMs: 10_000 });
    await run("git", ["-C", deployPath, "fetch", "--prune", "origin", project.branch], { timeoutMs: 180_000 });
    const { stdout: remoteSha } = await run("git", ["-C", deployPath, "rev-parse", `origin/${project.branch}`], { timeoutMs: 10_000 });
    if (previousSha.trim() === remoteSha.trim()) {
      return { ok: true, changed: false, version: previousSha.trim().slice(0, 7), message: "当前已经是最新版本" };
    }

    await run("git", ["-C", deployPath, "merge", "--ff-only", `origin/${project.branch}`], { timeoutMs: 60_000 });
    if (project.serviceName) {
      await run("sudo", ["-n", "systemctl", "restart", project.serviceName], { timeoutMs: 60_000 });
    } else {
      await run("docker", ["compose", "-f", composePath, "up", "-d", "--build"], { cwd: deployPath, timeoutMs: 15 * 60_000 });
    }
    return { ok: true, changed: true, previousVersion: previousSha.trim().slice(0, 7), version: remoteSha.trim().slice(0, 7), message: project.serviceName ? "代码已更新并重启 systemd 服务" : "代码与 Docker Compose 服务已更新" };
  } finally {
    runningUpdates.delete(project.id);
  }
}

module.exports = { checkAllProjects, checkProject, readProjectConfig, repositoryFromRemote, updateProject };
