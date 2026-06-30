---
description: Test conventions and the quality gate.
paths: ["src/**", "e2e/**"]
---

# The quality gate

- **Nothing is "done"** until `tsc --noEmit` + `vitest run` + the Playwright **e2e** + **axe**
  pass. The Stop hook runs `tsc` + `vitest`; CI runs the full set on every push.
- **Test behaviour, not markup snapshots.** Assert roles, labels, focus moves, `aria-live`,
  and branch logic. No flaky `sleep` where a wait-for-condition works.
- **Altitude:** pure logic (`src/lib/**`) → Vitest unit incl. edge/empty/failure paths;
  components → Vitest + Testing Library; critical flows → Playwright E2E + `@axe-core/playwright`
  (serious/critical = 0, light + dark, mobile + desktop).
- **Keep the e2e lane separate** from the app build: `e2e/` has its own `e2e/tsconfig.json`; the
  app `tsconfig` and Vitest `include` exclude it, so Playwright deps never enter the app gate.
- **Browser:** the MCP browsers default to a `chrome`/`stable` channel that isn't installed —
  drive the pre-installed Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` via a
  Playwright `executablePath` script. A fresh container has no `node_modules`; `npm install`
  first (this remote container is ephemeral/isolated, so installing here is correct).
