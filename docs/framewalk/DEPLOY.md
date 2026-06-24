# FrameWalk — Deploy to Vercel (preview)

Prereqs (already true): `npm run build` passes; no `vercel.json` needed — Vercel
auto-detects Next.js. Vercel account connected: team `egg0322-gmailcoms-projects`.

## Fastest path — Vercel CLI (one-time login, then a preview URL)
```bash
npm i -g vercel        # if you don't have it
cd C:\Users\egg03\Documents\framewalk
vercel                 # first run: log in (browser), link/create project, deploy
```
- Accept the defaults when prompted (framework: Next.js; build: `next build`; output: auto).
- It prints a **Preview URL** (…vercel.app). That's the deploy.
- For a production URL later: `vercel --prod`.

## Alternative — Git integration (auto-deploy on push)
1. Push the repo to GitHub.
2. On vercel.com → Add New → Project → import the repo → Deploy.
3. Every push then builds a preview; merges to `main` can deploy production.

## After it's live — verify
- Open the Preview URL on a phone; **Add to Home Screen** (installable PWA).
- Airplane mode → Today, one mission, and Diary still load (offline SW).
- DevTools → Network: confirm no request carries image data (CSP `connect-src 'self'`).
- Run Lighthouse (PWA + a11y) on the deployed URL.

## Cost
Static + client-only (no server DB, no AI). Vercel **Hobby** tier → effectively $0.
