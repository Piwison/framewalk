# AGENTS.md — shared agent guide

Canonical, tool-agnostic guide for any agent working in this repo. Claude Code reads
`CLAUDE.md`, which imports this file on its first line (`@AGENTS.md`). Keep this < 150 lines.

## What this is
A standalone, long-lived **web app** (not a throwaway prototype), owned by the PM (Jason).
Frontend, harness, architecture decisions, and contracts are the PM's domain; deep
backend / DB / deployment is **[engineer scope]**.

## Team & workflow
A full agent team, gated by slash-commands (Command → Agent → Skill). Jason (PM/owner) is
consulted **only at 3 direction gates**; the team runs everything between.

| Role | Agent / who | Command | Gate |
|------|-------------|---------|------|
| Product Manager | `product-manager` | `/pm` | ⛔ 1 — picks priorities (PRD/roadmap) |
| Product Designer | `product-designer` | `/design` | ⛔ 2 — design direction sign-off |
| Architect | `component-architect` | `/architect` | — |
| Developer | **main thread (you)** | `/build` | — |
| QA | `qa-engineer` | `/qa` | — |
| Reviewers | `code-reviewer` + `design-reviewer` + `a11y-checker` | `/review` | — (writer never self-approves) |
| Ship | tech-lead `ai-product-builder` | `/ship` | ⛔ 3 — ship/merge |

`/feature <idea>` chains all stages, pausing at the 3 gates. Domain rules in `.claude/rules/`
auto-load by file path. Models: PM + designer `opus`; architect/qa/reviewers `sonnet`; a11y
`haiku`.

## Stack
Next.js (App Router) · React · TypeScript (`strict`) · Tailwind v4.
Server Components by default; `'use client'` only at justified boundaries.

## Always do
- Server Components by default; add `'use client'` only when interactivity requires it.
- TypeScript `strict`, no `any`. Type API boundaries with `interface` / Zod.
- All color / type-scale / spacing values derive from `src/styles/tokens.css` — the
  single source of truth. No magic values in components.
- Match existing patterns in `src/components/` before inventing new ones.
- Run through the hooks: format → lint → `tsc --noEmit` → related tests on every write.
- Nothing is "done" until the Stop hook's full `tsc` + `vitest run` passes.
- Write component stories in Storybook as you build (docs + visual baseline).

## Ask the PM first
- Adding a dependency, skill, or MCP server.
- Any destructive change (deletes, schema/data migrations, history rewrites).
- Changing architecture, public contracts, or the design-token system.
- Anything that crosses into **[engineer scope]** backend/DB/deploy internals.

## Never do
- Never print or commit secret values; `.env*` is off-limits (enforced by guard hook).
- Never hardcode design values that belong in tokens.
- Never let an agent review its own code for sign-off — use `code-reviewer` (independent).
- Never assume the `fable` model is available (Fable 5 / Mythos 5 access is suspended).

## Directory map
```
AGENTS.md            # this file (canonical shared layer)
CLAUDE.md            # @AGENTS.md import + Claude-specific notes + error log
HARNESS-AUDIT-AND-SETUP-BRIEF.md  # the 2026-H2 baseline + audit/remediation discipline
.claude/
  agents/            # product-manager/product-designer/qa-engineer + component-architect
                     #   /design-reviewer/a11y-checker/code-reviewer + ai-product-builder (tech-lead)
  commands/          # /pm /design /architect /build /qa /review /ship /feature (workflow gates)
  rules/             # auto-load by paths: tokens-and-design, privacy-and-storage, testing
  hooks/             # guard-write.mjs, post-write.mjs
  memory/            # ai-weekly-digest.md (compounding AI knowledge)
  settings.json      # hooks, permissions, subagent model
.mcp.json            # playwright, chrome-devtools, shadcn (optional: figma)
docs/                # PRODUCT-IDEAS.md, SKILLS-TO-IMPORT.md
specs/               # Spec Kit output (EARS acceptance criteria)
src/
  app/               # routes (Server Components by default)
  components/ui/      # own primitives
  styles/tokens.css   # design tokens — single source of truth
.storybook/
```

## Testing
- Unit/component: Vitest. Critical flows: Playwright E2E. Visual regression: optional.
- Accessibility: axe-core + jsx-a11y in CI, plus one human keyboard/screen-reader pass.

## Parallelism
- Subagents for per-turn delegation; `isolation: worktree` when several agents touch the
  same files. Dynamic Workflows (`ultracode`) only for occasional large parallel sweeps.

## Audit discipline (from the brief)
Read-only inventory → compare to PART I baseline → gap report → **STOP, PM chooses** →
remediate in P0/P1/P2 batches, small reversible commits. Confirm destructive changes first.
