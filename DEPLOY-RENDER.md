# 用 Render 部署到互联网（可分享链接）

按下面步骤即可把「魔法生日惊喜」部署到 Render，获得一个可分享的网址。

---

## 一、把代码推到 GitHub

1. **初始化 Git（如果还没有）**
   ```bash
   cd "e:\Cursor Projects\magic-birthday-surprise"
   git init
   ```

2. **创建 GitHub 仓库**
   - 打开 https://github.com/new
   - 仓库名随便起（如 `magic-birthday-surprise`）
   - 选 Public，不勾选 “Add a README”
   - 点 Create repository

3. **本地关联并推送**
   ```bash
   git add .
   git commit -m "Initial: 魔法生日惊喜"
   git branch -M main
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```

---

## 二、在 Render 创建静态站点

1. **注册 / 登录**
   - 打开 https://render.com ，用 GitHub 登录。

2. **新建 Static Site**
   - 控制台里点 **New +** → **Static Site**。

3. **连接仓库**
   - 选 **Connect a repository**
   - 选你刚推送的 `magic-birthday-surprise` 仓库（若未显示，先点 **Configure account** 授权 GitHub）。

4. **填写构建配置**
   - **Name**：随便起，如 `magic-birthday-surprise`
   - **Branch**：`main`
   - **Build Command**：`npm install && npm run build`
   - **Publish Directory**：`dist`

5. **SPA 回退（微信 / 直接打开链接必做）**
   - 在 **Redirects/Rewrites** 里添加一条 **Rewrite** 规则，否则 `/surprise?xxx` 会 404，微信里打不开：
   - **Source Path**：`/*`
   - **Destination Path**：`/index.html`
   - **Action**：选 **Rewrite**（不是 Redirect）
   - 这样任意路径都会返回 `index.html`，前端再根据路径显示贺卡。

6. **（可选）用自己的域名，让生成的链接/二维码都是你的域名**
   - 在 **Environment** 里添加变量：
   - **Key**：`VITE_SHARE_BASE_URL`
   - **Value**：你的访问地址，例如 `https://birthday.yoona.ltd`（不要末尾斜杠）
   - 保存后 **重新部署**（Deploy → Clear build cache & deploy 或 重新 push 代码触发部署）。之后在站内「封存」生成的链接和二维码都会用这个域名，而不是 onrender.com。

7. **创建站点**
   - 点 **Create Static Site**。
   - 等几分钟，构建完成后会给你一个地址，例如：  
     `https://magic-birthday-surprise.onrender.com`
   - 若已绑定自定义域名（如 birthday.yoona.ltd），也可用该域名访问。

---

## 三、分享给别人

- **链接**：用你的域名或 Render 地址发出去即可，例如：  
  `https://birthday.yoona.ltd` 或 `https://你的站点名.onrender.com`
- **二维码**：在「定制页」生成链接后，用页面上的「保存二维码」下载图片。若已配置 `VITE_SHARE_BASE_URL` 为你的域名，生成的链接和二维码都会是你的域名。

---

## 常见问题

| 问题 | 处理 |
|------|------|
| 构建失败 | 看 Render 的 **Logs**，确认 `Build Command` 是 `npm install && npm run build`，**Publish Directory** 是 `dist`。 |
| 打开页面空白 | 确认 **Publish Directory** 填的是 `dist`，不要多写路径。 |
| 微信里打开是空白 / 404 | 检查是否在 **Redirects/Rewrites** 里添加了 `/*` → `/index.html` 的 **Rewrite** 规则。 |
| 免费额度用完 | Render 免费静态站点一段时间不访问会“休眠”，再次打开时会自动唤醒，稍等几秒即可。 |

---

部署完成后，你只需要把 Render 的网址（或二维码）发给对方，对方就能在浏览器里打开贺卡。
