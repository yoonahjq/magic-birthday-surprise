<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1GgVALkZqwCWzFPMSErLqkaA3MEkalbIt

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. （可选）将生日快乐歌 `birthday.mp3` 放入 `public/` 文件夹，背景音乐可本地播放更可靠
4. Run the app:
   `npm run dev`

## 部署到互联网（分享给别人）

用 **Render** 部署后即可获得可分享的链接和二维码。详细步骤见 **[DEPLOY-RENDER.md](DEPLOY-RENDER.md)**。
