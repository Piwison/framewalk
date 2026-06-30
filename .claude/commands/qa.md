---
description: Author + run tests and drive the running app to verify a feature.
argument-hint: <feature>
---

Delegate to the `qa-engineer` subagent for: **$ARGUMENTS**

Have it:
1. Author/extend tests at the right altitude — Vitest unit (`src/lib/**`), Vitest + Testing
   Library for components (roles, labels, focus, `aria-live`, branch logic), and Playwright
   E2E + axe in `e2e/` for critical flows.
2. Run the full gate and report honestly: `npx tsc --noEmit`, `npx vitest run`, `npm run build`,
   and the e2e suite.
3. Do a black-box app drive: `npm install` if `node_modules` is missing, start `next dev`, and
   drive the pre-installed Chromium (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) via a
   Playwright `executablePath` script. Capture screenshots; confirm the privacy promise (no
   image bytes on the network; CSP intact).

Report pass/fail with evidence. Nothing is "done" until tsc + vitest + e2e + axe are green.
