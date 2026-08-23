# ServicePortal

ServicePortal 是一个以“统一访问入口”为核心的轻量服务门户。首版已经预置了 5 个服务项目，并提供搜索、分组、收藏、GitHub/服务快捷入口和本地添加项目能力。

目前还包含受控的 GitHub 更新检测和 Docker Compose 更新功能：检测到远端新提交时才显示“更新项目”按钮。

## 本地运行

```powershell
npm start
```

然后打开 <http://localhost:4173>。

## 自动更新配置

1. 在服务器环境变量中设置管理员令牌。访问网页时使用固定账号 `admin`，密码填写此令牌；登录成功后，更新操作不再重复验证：

```bash
export SERVICEPORTAL_ADMIN_TOKEN='使用密码管理器生成的长随机值'
```

2. 按实际部署情况编辑 `projects.config.json`：

- `repository`：GitHub 的 `owner/repo`。
- `branch`：需要跟踪的分支。
- `deployPath`：服务器上的 Git 仓库绝对路径。
- `composeFile`：相对于部署目录的 Compose 文件。
- `updateEnabled`：只有明确设为 `true` 才允许更新。

3. 如果 GitHub API 限额不足，可在服务器端设置 `GITHUB_TOKEN`。该值不会返回到浏览器。

更新流程固定为：检查仓库来源与工作区状态 → `git fetch` → `git merge --ff-only` → `docker compose up -d --build`。系统不会执行网页传入的任意命令。

当前已按已知服务器信息预配置三个项目路径：

- Sub2API：`/root/sub2api-deploy`
- InboxOps：`/opt/inboxops`
- ChatGPT2API：`/opt/chatgpt2api`

另外两个项目需要确认真实部署目录后再启用。

## 设计原则

- 访问入口是首页主功能，运维能力作为后续模块扩展。
- 前端示例数据只保存项目名称、链接和仓库地址，不保存密码、API Key 或 Token。管理员令牌换取 HttpOnly 会话后即从表单清除。
- 添加的项目保存在当前浏览器的 `localStorage` 中，正式版本应替换为后端数据库。

## 下一步建议

1. 增加后端项目目录和用户权限。
2. 通过受限 Agent 读取 Docker Compose 状态，而不是把 Docker Socket 暴露给网页。
3. 增加健康检查、Git 更新检测、备份和人工确认后的更新/回滚。
