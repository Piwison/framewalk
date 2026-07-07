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
- _2026-07-06 · Monograph restyle: two review-caught P1s._ (1) `package-lock.json` was out
  of sync with `package.json` (devDep bumps without a lock regen) — `npm ci` failed locally
  and would break CI; re-synced via `npm install`. Guardrail: after any dependency edit, run
  `npm install` and commit the lockfile in the same change. (2) The `--text-*` type-scale
  tokens in `tokens.css` were never mapped in `globals.css` `@theme inline`, so every
  `text-*` utility silently used Tailwind's default scale, not ours — invisible until the
  Monograph scale diverged. Fixed by mapping them; independent code review caught it, plus
  light `--ink-faint` failing AA (3.5:1 → now #6b6c64, 4.9:1). Guardrail: when adding a
  token family, wire it into `@theme` in the same commit and verify one computed style in
  the live browser (getComputedStyle), not just class names — and beware measuring against
  a stale server: a second `next start` on a busy port dies with EADDRINUSE while the old
  build keeps serving. Spacing utilities still ride Tailwind's default scale (numerically
  identical to `--space-*`); structural wiring is an open P2.
- _2026-07-06 · Darkroom cull surface + spacing wiring (the two follow-ups)._ Closed the
  spacing P2 by mapping `--spacing: var(--space-1)` in `@theme inline`, so every
  padding/margin/gap compiles to `calc(var(--space-1) * n)` (verified in the built CSS);
  zero visual change since `--space-1` already equals Tailwind's 0.25rem base. Gotcha: the
  explaining comment first contained `p-*/m-*`, whose `*/` **closed the CSS comment early**
  and broke the Tailwind build with a cryptic "Unknown word utility" — never write `*/`
  inside a CSS comment (spell out "padding/margin/gap" in words). Then borrowed Direction A
  for the evening cull: a `.darkroom` token scope in `tokens.css` that overrides BOTH themes
  (a committed single surface) — warm near-black, silver-gelatin ink, one safelight amber —
  so the cull components need no darkroom-specific colours; plus a grease-pencil keep gesture
  (an amber SVG ellipse that draws itself via `stroke-dashoffset`, collapsing to the finished
  state under reduced motion through `--motion-slow`). Review-catch-equivalent found by the
  axe e2e: the full-bleed dark section bled through the fixed nav's `bg-paper/90`, dropping
  the light-theme inactive nav labels to 3.94:1. Fix: the nav joins the darkroom on `/cull`
  (pathname-scoped `.darkroom` class), which fixed the contrast AND removed the light-bar
  seam. Guardrail: a full-bleed surface under a translucent fixed bar changes that bar's
  effective bg — re-check its contrast, don't just check the surface's own text.
- _2026-07-06 · Darkroom follow-up: independent review → three real fixes._ The reviewer
  (separate context) REQUESTED CHANGES on the darkroom commit and was right on all three:
  (1) the full-bleed section cancelled `<main>`'s `pt-6` but not its `pb-28`, so an ambient
  (non-darkroom) strip sat below the surface — the same seam class we'd just fixed on the
  nav, recurring on the opposite edge; fixed with `-mb-28` + the section owning its own
  `pb-28` clearance. (2) The unmount cleanup ran `shots.forEach(revoke)` from an `[]`-deps
  effect, so it closed over the INITIAL empty array and leaked every un-culled blob URL;
  fixed with a `shotsRef` mirror read in cleanup (this bug pre-dated the restyle — latent).
  (3) A hardcoded `620` ms delay violated tokens.css's "no component may hardcode a motion
  value"; replaced by reading `--motion-slow` at runtime (`getComputedStyle`), which also
  collapses to 0ms under reduced motion for free. Also extended the axe e2e to upload a
  frame and scan the review + story phases (they'd only ever been contrast-checked by hand).
  Guardrail: an axe route-scan only sees the FIRST screen of a multi-phase flow — drive the
  later phases in before asserting, or their contrast is never actually tested.
