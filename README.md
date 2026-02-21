<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZhwVXu_oVueTmZzJOb_DfzPxecReJzkf

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Create a `.env` file from the example and add your API key:
   ```bash
   cp .env.example .env
   # edit .env and set API_KEY
   ```
3. Start the backend proxy (optional but recommended for real Gemini calls):
   ```bash
   # default port is 4000; to change port set BACKEND_PORT
   npm run server
   ```
   - If you don't have an API key set, the proxy will return mock previews so the UI still renders.

4. Start the front-end dev server:
   ```bash
   npm run dev
   ```

Notes
- Do NOT commit real API keys to the repository. Keep them in `.env` which should be listed in `.gitignore`.
- For production, host the backend (e.g., on a small Node host) and keep the `API_KEY` only on the server.
