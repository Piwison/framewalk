# Reusable Workflow — AI Product Builder + Engineering Harness
### Version: June 2026 (Claude Opus 4.8 / Sonnet 4.6 / Haiku 4.5 era)

> **Purpose.** A self-contained, copy-pasteable recipe to recreate the setup we built:
> a senior **AI Product Builder agent** + a **2026-H2 engineering harness** for a
> Next.js + React + TypeScript + Tailwind v4 web app, then a **design-thinking → PRD →
> build** pipeline. Paste **Part A** into a fresh chat to reproduce everything; **Part B**
> is the harness sample to drop in verbatim; **Part C** is the standing operating rhythm.
>
> ⚠️ **Version note (June 2026).** Versions below are the baseline as of 2026-06. Claude Code
> ships almost daily — before installing skills/MCPs, confirm current versions against
> `code.claude.com/docs/changelog`. Do **not** assume the `fable` model (Fable 5 / Mythos 5)
> is available; access was suspended 2026-06-12. Models in play: **Opus 4.8** (`claude-opus-4-8`),
> **Sonnet 4.6** (`claude-sonnet-4-6`, default), **Haiku 4.5**.

---

## Part A — Paste this into a new chat to reproduce the setup

> Copy everything in this box into a new Cowork/Claude Code session. Fill the two blanks.

```
You are acting as a senior, opinionated AI Product Builder + harness operator (June 2026
baseline: Opus 4.8 / Sonnet 4.6 / Haiku 4.5; do NOT assume `fable` is available).

CONTEXT
- Product type: a long-lived web app (not a throwaway prototype).
- Stack: Next.js (App Router) + React + TypeScript (strict) + Tailwind v4.
- Owner: me (the PM). I own frontend/harness/architecture; deep backend/DB/deploy is
  engineer scope.
- My domain / interests: __________________________
- Constraint for the first idea: __________________  (e.g. "$0 to develop AND deploy").

DO THIS, IN ORDER
1. Set up a task list and (for anything underspecified) ask me 1 round of multiple-choice
   clarifying questions BEFORE building.
2. Stand up the harness exactly as in the "HARNESS SAMPLE" I will paste next: AGENTS.md +
   CLAUDE.md (@AGENTS.md import + error log), .claude/agents/{ai-product-builder,
   component-architect, design-reviewer, a11y-checker, code-reviewer}.md, .claude/hooks/
   {guard-write,post-write}.mjs, .claude/settings.json, .mcp.json. Validate all JSON + hooks.
3. Find and recommend a *product-taste* skill (anti-slop) + first-party frontend skills;
   pin versions; DO NOT install anything until I approve each source+version.
4. Set up a weekly scheduled task that researches the latest AI/model/tooling news and
   prepends a dated digest to .claude/memory/ai-weekly-digest.md.
5. Propose 5 specific, design-thinking-grounded product ideas (one specific user each; no
   generic SaaS; idea #1 must satisfy my constraint above). Save to docs/PRODUCT-IDEAS.md.

DISCIPLINE (always)
- Read-only inventory → compare to baseline → gap report → STOP for my approval → fix in
  P0/P1/P2 batches. Confirm destructive changes first. Never print secrets.
- Don't let one agent both write and approve code — code-reviewer runs in its own context.
- Nothing is "done" until the Stop hook (tsc + vitest) is green.
- Evidence over vibes; calibrate severity honestly; cite file/line or source.

Then I'll paste the HARNESS SAMPLE (Part B) for you to write to disk.
```

When you want to go from a chosen idea to a build, paste this follow-up:

```
We're building <IDEA>. Produce, in order:
1) A complete design-thinking workup (Empathize personas + empathy map → Define POV/HMW/JTBD
   → Ideate w/ rejected concepts → Prototype plan → Test plan with riskiest assumptions).
2) A build-ready PRD: goals/non-goals, scope (MVP / v1.1 / Later), functional requirements
   in EARS phrasing, IA + screens, design tokens (single source of truth), metrics, risks,
   milestones (M0 = validate cheaply BEFORE coding). Keep a BACKLOG.md for deferred items.
Save under docs/<idea>/. Then stop and let me review before any scaffolding.
```

---

## Part B — Harness sample (drop-in files)

```
<repo>/
  AGENTS.md                 # canonical shared guide, < 150 lines; imported by CLAUDE.md
  CLAUDE.md                 # first line `@AGENTS.md` + Claude notes + self-growing error log
  HARNESS-AUDIT-AND-SETUP-BRIEF.md   # your version baseline + audit/remediation discipline
  .claude/
    settings.json           # hooks (format/lint/typecheck/test), permissions, subagent model
    settings.local.json     # personal: which .mcp servers are enabled
    agents/
      ai-product-builder.md # the senior product mind + harness operator (model: opus)
      component-architect.md# plans component trees/props/composition (sonnet)
      design-reviewer.md    # Playwright visual review, enforces tokens (sonnet)
      a11y-checker.md       # WCAG 2.1 AA (haiku)
      code-reviewer.md      # READ-ONLY, independent context, adversarial sign-off (sonnet)
    hooks/
      guard-write.mjs       # PreToolUse: block .env/secrets/.git writes
      post-write.mjs        # PostToolUse: prettier -> eslint --fix -> tsc on touched file
    memory/
      ai-weekly-digest.md   # compounding AI knowledge, refreshed weekly
  .mcp.json                 # playwright, chrome-devtools, shadcn (optional figma)
  docs/                     # PRODUCT-IDEAS.md, SKILLS-TO-IMPORT.md, <idea>/{DESIGN-THINKING,PRD,BACKLOG}.md
  specs/                    # Spec Kit output (EARS acceptance criteria)
  src/
    app/                    # routes (Server Components by default)
    components/ui/          # own primitives
    styles/tokens.css       # design tokens — single source of truth
  .storybook/
```

### `.claude/settings.json` (hooks + guardrails)
```json
{
  "model": "sonnet",
  "env": { "CLAUDE_CODE_SUBAGENT_MODEL": "sonnet" },
  "permissions": {
    "deny": ["Read(./.env)", "Read(./.env.*)", "Read(./**/*.pem)", "Read(./**/secrets/**)"],
    "ask":  ["Bash(rm -rf:*)", "Bash(git push:*)"]
  },
  "hooks": {
    "PreToolUse":  [{ "matcher": "Write|Edit|MultiEdit",
      "hooks": [{ "type": "command", "command": "node .claude/hooks/guard-write.mjs", "timeout": 30 }] }],
    "PostToolUse": [{ "matcher": "Write|Edit|MultiEdit",
      "hooks": [{ "type": "command", "command": "node .claude/hooks/post-write.mjs", "timeout": 300 }] }],
    "Stop": [{ "hooks": [{ "type": "command",
      "command": "npx tsc --noEmit && npx vitest run --passWithNoTests", "timeout": 600 }] }],
    "PreCompact": [{ "hooks": [{ "type": "prompt",
      "prompt": "Before compacting: restate the goal, any do-not-touch files, the task list, and the quality bar (TS strict, tokens are the single source of truth, nothing is done until tsc + vitest pass)." }] }]
  }
}
```

### `.claude/agents/ai-product-builder.md` (frontmatter is the key part)
```markdown
---
name: ai-product-builder
description: Senior AI product builder. Suggests what to build, pressure-tests ideas with
  design thinking, and runs the harness end-to-end. Stays current via a weekly digest.
tools: Read, Glob, Grep, Edit, Write, Bash, WebSearch, WebFetch, TodoWrite, Task
model: opus
permissionMode: default
maxTurns: 80
skills: [design-taste-frontend, frontend-design]
isolation: worktree
memory: true
---
# (body) Operating beliefs: taste is the moat; context engineering; counter the 3 failure
# modes (laziness/self-bias/goal-drift); ship to a standard not to "done".
# What you do: (1) suggest what to build via design thinking; (2) stay current from
# .claude/memory/ai-weekly-digest.md; (3) run the harness with read-only-inventory →
# gap-report → STOP-for-PM → P0/P1/P2 fixes; (4) keep quality production-grade.
```

### The four reviewer subagents (frontmatter summary)
```
component-architect  model: sonnet  tools: Read,Glob,Grep,Write          — plans structure only
design-reviewer      model: sonnet  tools: Read,Bash,Glob,Grep + Playwright — looks at the screen
a11y-checker         model: haiku   tools: Read,Bash,Glob,Grep           — axe-core + WCAG AA
code-reviewer        model: sonnet  tools: Read,Glob,Grep  permissionMode: read-only — adversarial
```
> Rule that makes this work: the agent that **writes** code is never the one that **approves**
> it. `code-reviewer` runs read-only in its own context to defeat self-preferential bias.

### `.claude/hooks/guard-write.mjs` (PreToolUse — block secret writes)
```js
#!/usr/bin/env node
import { readFileSync } from "node:fs";
let p = {}; try { p = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const path = p?.tool_input?.file_path || p?.tool_input?.path || "";
const BLOCKED = [/(^|\/)\.env($|\.)/, /\.pem$/, /(^|\/)secrets?\//i, /(^|\/)\.git\//];
if (BLOCKED.some(re => re.test(path))) { console.error(`Blocked write to protected path: ${path}`); process.exit(2); }
process.exit(0);
```

### `.claude/hooks/post-write.mjs` (PostToolUse — format/lint/typecheck the touched file)
```js
#!/usr/bin/env node
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
let p = {}; try { p = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { process.exit(0); }
const f = p?.tool_input?.file_path || p?.tool_input?.path || "";
if (!/\.(ts|tsx|js|jsx|mjs|cjs|css)$/.test(f)) process.exit(0);
const run = c => { try { execSync(c, { stdio: "pipe" }); return null; }
  catch (e) { return (e.stdout?.toString()||"") + (e.stderr?.toString()||""); } };
run(`npx prettier --write "${f}"`);
const lint = run(`npx eslint --fix "${f}"`);
let tsc = null; if (/\.(ts|tsx)$/.test(f)) tsc = run("npx tsc --noEmit");
if (lint || tsc) { console.error([lint&&`ESLint:\n${lint}`, tsc&&`tsc:\n${tsc}`].filter(Boolean).join("\n")); process.exit(2); }
process.exit(0);
```

### `.mcp.json`
```json
{
  "mcpServers": {
    "playwright":      { "command": "npx", "args": ["-y", "@playwright/mcp@latest"] },
    "chrome-devtools": { "command": "npx", "args": ["-y", "chrome-devtools-mcp@latest"] },
    "shadcn":          { "command": "npx", "args": ["-y", "shadcn@latest", "mcp"] }
  }
}
```

### `CLAUDE.md` (first lines)
```markdown
@AGENTS.md

# CLAUDE.md — Claude-specific notes
Baseline of record: HARNESS-AUDIT-AND-SETUP-BRIEF.md PART I (only ruler for "latest"; June 2026).
Models: Opus 4.8 / Sonnet 4.6 (default) / Haiku 4.5. `fable` not assumed available.

# Error log (compounding engineering)
> After each non-trivial fix: date · symptom · root cause · guardrail added.
- _YYYY-MM-DD · <what changed> · <guardrail>._
```

### Skills to install (first-party, pin versions; approve each before installing)
```
# product TASTE (anti-slop) — the "good taste" requirement
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
# frontend quality (Vercel agent-skills): react-best-practices, composition-patterns,
#   web-design-guidelines, optimize, view-transitions, (+ deploy-to-vercel)
npx skills add vercel-labs/agent-skills
# official production-UI skill: frontend-design (Anthropic skills marketplace)
# spec-driven dev: GitHub Spec Kit — use `--integration claude` (v0.10+), NOT old `--ai`
```
> Taste-skill scope caveat: `design-taste-frontend` targets landing pages / portfolios, **not**
> multi-step product UI. For app interiors use `web-design-guidelines` + `vercel-composition-patterns`.
> Supply-chain: treat third-party skills/MCPs as untrusted code; pin versions; prefer first-party.

---

## Part C — Operating rhythm (how to actually run sessions)

1. **"What should I build?"** → invoke `ai-product-builder`. It reads the weekly digest,
   applies design thinking, and writes/updates `docs/PRODUCT-IDEAS.md`. Anchor every idea on
   one specific user; kill thin model-wrappers.
2. **Idea → spec.** Produce `DESIGN-THINKING.md` then `PRD.md` (EARS acceptance criteria),
   with a `BACKLOG.md` for anything deferred. **M0 is always "validate cheaply before coding."**
3. **Build UI.** `component-architect` plans → you implement → `design-reviewer` + `a11y-checker`
   review the *rendered* screen → `code-reviewer` signs off in an independent context.
4. **Guardrails do the nagging.** PostToolUse formats/lints/typechecks each write; the Stop
   hook blocks "done" until `tsc` + `vitest` pass; PreCompact restates the goal.
5. **Audit/remediation.** Read-only inventory → gap report → **STOP for PM** → P0/P1/P2 fixes,
   small reversible commits. Confirm destructive changes. Never read out secret values.
6. **Compounding engineering.** After each non-trivial fix, append a line to the CLAUDE.md
   error log. The harness should get smarter, not just bigger.
7. **Weekly.** The scheduled digest keeps the agent current; when a new capability changes
   what's cheap/feasible, revisit the idea shortlist.

---

## Changelog of this reference
- **2026-06-21** — v1 (June 2026 baseline). Captures the agent + 4 reviewer subagents,
  format/lint/typecheck + Stop + PreCompact hooks, secret-guard, weekly digest, taste-skill
  + Vercel skills, and the design-thinking → PRD → build pipeline. Verify versions before reuse.
