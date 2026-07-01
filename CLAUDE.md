@AGENTS.md

# CLAUDE.md — Claude-specific notes

`@AGENTS.md` above is the canonical shared guide. This file adds Claude-Code-specific
context and a **self-growing error log**. Keep total length modest (< ~300 lines).

## Baseline of record
`HARNESS-AUDIT-AND-SETUP-BRIEF.md` (PART I) is the only ruler for what counts as "latest"
in 2026 H2 — do not trust training-data priors about versions. Models: Opus 4.8 /
Sonnet 4.6 (default) / Haiku 4.5. `fable` is **not** assumed available.

## How to drive a session
- For "what should I build?" → invoke the `ai-product-builder` agent; it reads
  `.claude/memory/ai-weekly-digest.md`, applies design thinking, and updates
  `docs/PRODUCT-IDEAS.md`.
- For building UI → `component-architect` plans, you implement, `design-reviewer` +
  `a11y-checker` review, `code-reviewer` signs off (independent context). Don't let one
  agent both write and approve.
- Audit/remediation → follow the brief's discipline: inventory → gap report → STOP for
  PM → P0/P1/P2 fixes. Confirm destructive changes.

## Skills / MCP
Install only first-party, version-pinned skills (see `docs/SKILLS-TO-IMPORT.md`). Treat
third-party skills/MCPs as untrusted code. `design-taste-frontend` is the anti-slop taste
skill; `frontend-design` is the official production-UI skill.

---

# Error log (compounding engineering)

> After each non-trivial fix, append: date · symptom · root cause · the guardrail added.
> This is how the harness gets smarter, not just bigger.

- _2026-06-21 · Harness scaffolded._ Set up the four reviewer subagents, PostToolUse
  format/lint/typecheck hook, Stop hook (tsc + vitest), PreCompact goal-restate hook, and
  the weekly AI digest. Guardrail: nothing ships until the Stop hook is green.
- _2026-06-22 · M1 MVP scaffolded under grill+ponytail discipline._ Ran an
  independent-context subagent as a pre-code grill gate; it caught an unenforced privacy
  promise (→ CSP in `next.config.ts`), evictable IndexedDB data-loss (→ `storage.persist()`
  + honest Settings copy), and an a11y/offline test gap (→ labeled keep/let-go buttons,
  `aria-live`, focus advance, `capture`-free file input + smoke test). Guardrail: privacy
  is now structural (CSP), not aspirational; verification gate runs before code, in a
  separate context (never self-approve). Pure mission logic verified green; full
  tsc+vitest+next build to be run on `npm install` (Next install exceeds sandbox budget).
- _2026-06-22 · Engineering harness materialised._ The `.claude/` harness described in the
  docs did not exist in the repo; created it to spec (PART B of the workflow reference):
  4 reviewer subagents + `ai-product-builder`, `guard-write`/`post-write` hooks, Stop hook
  (tsc + vitest), PreCompact goal-restate, `settings.json`, `.mcp.json`, and the weekly
  digest seed. Guardrail: guard-write blocks `.env`/secrets/`.git` (functionally tested);
  hooks activate after `npm install` + a Claude Code reload. Note: `post-write` runs
  `npx tsc --noEmit` on the whole project per write — it will block until deps are installed.
- _2026-06-23 · Tailwind v4 "Failed to load native binding" on Windows dev._ Root cause:
  earlier `npm install` attempts were run inside the Linux sandbox against the connected
  Windows folder, leaking a Linux `node_modules` + `package-lock.json` into the repo; on
  Windows the `@tailwindcss/oxide-win32-x64-msvc` native binary was therefore absent and
  PostCSS threw (surfaced via `next/font`). Fix: delete `node_modules` + `package-lock.json`
  and reinstall on the native OS. Guardrail: NEVER run `npm install` from the Linux sandbox
  into the user's connected folder — install/build deps only on the user's own machine.
  Verification of pure logic in-sandbox uses an isolated /tmp project, never the repo.
- _2026-06-23 · Hydration mismatch from the theme init script._ Live browser test showed a
  dev-only React hydration error on `<html>`: the `beforeInteractive` theme script sets
  `data-theme` before hydration, which the server-rendered markup lacks. Fix: added
  `suppressHydrationWarning` to `<html>` in `layout.tsx` (the documented pattern for theme
  scripts). Note: requires a `npm run dev` restart to take effect — editing files through
  the sandbox mount does not reliably trip Next's Windows file-watcher (HMR stays stale),
  so a manual route reload or dev restart is needed to see sandbox-made changes.
- _2026-06-23 · CTA + a11y hardening, CI/E2E added._ Consolidated every primary/quiet CTA
  into `components/ui/action.ts` (Button + all link/label CTAs route through it — no drift);
  Today location filter is now a real radiogroup (`role=radiogroup` + chip `role=radio` +
  `aria-checked`, no `aria-pressed`). Added GitHub Actions CI (tsc → vitest → build, then a
  gated e2e job) + Playwright E2E for the loop + axe-core (serious/critical, light+dark,
  across /, /settings, /diary, /mission, /cull). Independent code+a11y review: APPROVE WITH
  NITS (applied the two test-robustness nits). Guardrail: a dev-server **restart** is needed
  after agent edits — Next's Windows file-watcher doesn't see mount writes, so SSR can serve
  a stale module while the client HMRs the new one (shows as a transient hydration warning);
  production builds are unaffected (one bundle).
- _2026-06-23 · E2E toolchain leaked into the app gate._ Adding `e2e/*.spec.ts` +
  `playwright.config.ts` made `tsc --noEmit`, `next build`, and `vitest` try to compile/run
  them — failing because Playwright deps aren't part of the app and shouldn't be. (The app
  itself was clean: all 9 tsc errors were in the Playwright files; 13 unit/component tests
  passed.) Fix: exclude `e2e` + `playwright.config.ts` from the app `tsconfig`, scope vitest
  `include` to `src/**`, and give e2e its own `e2e/tsconfig.json`. Guardrail: keep the
  Playwright lane separate from the app build — `npm run e2e` is the only thing that needs
  `@playwright/test` (+ `npx playwright install chromium`).
- _2026-06-23 · Vercel blocked deploy: vulnerable Next.js._ First `vercel` deploy created the
  project + linked GitHub (Piwison/framewalk) but errored "Vulnerable version of Next.js
  detected" — the pinned `next@15.3.5` carries known CVEs (the same critical/high `npm audit`
  flags). Fix: bumped `next` + `eslint-config-next` to `15.5.19` (latest patched 15.x; avoided
  the 16.x major to keep the tested surface). Re-run `npm install` + the full gate, then
  redeploy. Guardrail: pin to the latest patch of the supported minor; check the Vercel build
  log / `npm audit` after dependency bumps before calling a deploy done.
- _2026-06-23 · v1.1 weekly reflection shipped (no AI)._ Added `themes[]` to missions + a pure
  `lib/reflection.ts` (week/month walks, keepers, story rate, top themes, difficulty mix,
  people count) with vitest coverage; rendered a calm `ReflectionCard` above the Diary
  (gentle copy, no streak guilt, hidden until ≥1 keeper). PM approved the **ponytail** skill
  (install via desktop UI — agents can't install plugins from a session). Guardrail: adding a
  required field to `Mission` (`themes`) means every Mission-builder in tests needs it —
  updated the `mission-select.test.ts` helper so `tsc`/`vitest` stay green.
- _2026-06-30 · Rolls Phase 1 shipped (no AI)._ Multi-image diary entries grouped during the
  cull (`SPEC-rolls.md`). `Keeper.thumbnail: Blob` → `images: readonly Blob[]` + `coverIndex`
  (`types.ts`); **Dexie v2** non-destructive `.upgrade()` maps each v1 row → roll of 1. Added a
  Compose step to `cull-flow.tsx` (keep ≥2 → "one roll" vs "each on its own"; 1 keeper = no
  extra step), a roll-aware `diary-list.tsx` card (cover + count badge + expandable grid),
  `images[]` export (payload `version:2`), and a reflection `totalFrames` "frames" tally.
  Gate GREEN: tsc + 24 vitest (incl. Compose branching + migration) + eslint + `next build`;
  live Chromium pass (single keeper, 3-frame roll, expand). Two guardrails learned: (1) a fresh
  web container has **no `node_modules`** — the post-write/Stop hooks spew "Cannot find module"
  until you `npm install`; this remote container is ephemeral/isolated, so installing here is
  correct (unlike the old Windows-mount guardrail). (2) Dexie `modify` mutates rows in place, so
  the upgrade transform needs a **mutable** row type (not the `readonly` `Keeper`); extracted it
  to a pure exported `migrateKeeperV1ToV2()` so the migration is unit-testable without
  fake-indexeddb. (3) The two browser MCPs default to a `chrome`/`stable` channel that isn't
  installed — drive the pre-installed Chromium at `/opt/pw-browsers/chromium-1194/...` via a
  Playwright `executablePath` script instead.
- _2026-07-01 · Full agent team built + first feature shipped through it._ Added the missing
  product roles (`product-manager`, `product-designer`, `qa-engineer`), reframed
  `ai-product-builder` as tech-lead/orchestrator, and wired a slash-command workflow
  (`/pm /design /architect /build /qa /review /ship /feature`) + auto-loading `.claude/rules/`.
  Then drove **mission favouriting** (P0, `localStorage`-backed — `lib/favourites.ts`,
  `ui/favourite-toggle.tsx`, `favouriteIds` preference in `mission-select.ts`) through the whole
  team: PM (gate 1) → design (Ma bookmark) → build → QA → 3-way review (unanimous approve).
  Gate GREEN: tsc + vitest 36/36 + `next build` + Playwright/axe 72/72. Guardrails learned:
  (1) toggling a favourite must NOT reshuffle the current card — feed favourites into selection
  via a **ref** (not effect deps), set synchronously before `ready` flips so the initial pick
  sees them with no race. (2) Reviewers verify; QA authors tests — keep the boundary (QA flags
  drift, doesn't fix it; reviewer approves, doesn't write). (3) A favourite is UI preference, not
  diary content → `localStorage`, not Dexie: no migration, no sign-off gate, no export change.
