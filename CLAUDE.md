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
