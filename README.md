# AI Product Builder

A senior, opinionated **AI product-builder agent** plus the **2026-H2 engineering harness**
it operates, set up per `HARNESS-AUDIT-AND-SETUP-BRIEF.md`. Built for a long-lived
Next.js + React + TypeScript + Tailwind v4 web app, owned by the PM.

## What's here

```
AGENTS.md                 # canonical shared agent guide (< 150 lines)
CLAUDE.md                 # @AGENTS.md import + Claude notes + self-growing error log
HARNESS-AUDIT-AND-SETUP-BRIEF.md   # the baseline + audit/remediation discipline (your file)
.claude/
  agents/
    ai-product-builder.md   # ⭐ the senior product mind + harness operator
    component-architect.md  # plans component trees, props, composition
    design-reviewer.md      # Playwright visual review, anti-slop, enforces tokens
    a11y-checker.md         # WCAG 2.1 AA
    code-reviewer.md        # read-only, independent context, adversarial sign-off
  hooks/
    guard-write.mjs         # PreToolUse: blocks .env / secrets / .git writes
    post-write.mjs          # PostToolUse: prettier -> eslint --fix -> tsc on touched file
  memory/
    ai-weekly-digest.md     # compounding AI knowledge, refreshed weekly
  settings.json             # hooks, permissions, default subagent model
  settings.local.json       # personal: enabled .mcp servers
.mcp.json                   # playwright, chrome-devtools, shadcn MCP servers
.agents/skills/             # installed skills (taste + Vercel agent-skills); skills-lock.json
docs/
  HARNESS-WORKFLOW-REFERENCE-2026-06.md  # ⭐ reproduce this whole setup in a new chat
  SKILLS-TO-IMPORT.md       # vetted, version-pinned skills (incl. the taste skill)
  framewalk/                # ⭐ the chosen product
    DESIGN-THINKING.md      #   full design-thinking workup
    PRD.md                  #   build-ready PRD (MVP is AI-free)
    BACKLOG.md              #   deferred items (all AI features parked here)
```

## The agent

Invoke **`ai-product-builder`** when you want to decide *what* to build or drive a build
session. It: suggests specific, design-thinking-grounded products (not generic SaaS);
stays current via the weekly digest; and runs the harness with the brief's discipline
(read-only inventory → gap report → **stop for your approval** → fix in P0/P1/P2 batches).
It delegates structure, visual review, a11y, and adversarial code review to the four
reviewer subagents — and never lets an agent sign off on its own code.

## Knowledge stays fresh

A weekly scheduled task (`ai-product-builder-weekly-digest`) researches the latest AI
models, pricing, free-inference options, and agent tooling, then prepends a dated section
to `.claude/memory/ai-weekly-digest.md`. The agent reads it before any planning work.

## Current product: FrameWalk (街拍日課)

A photo-walk companion that beats creative block and the fear of strangers, for plateauing
street / daily-life photographers. **MVP is 100% AI-free** (curated mission library, manual
cull, user-written stories); all AI ideas are parked in `docs/framewalk/BACKLOG.md`.
See `docs/framewalk/PRD.md`.

## First moves (you choose — nothing auto-installs)

1. **Validate first (M0).** Run the concierge pilot in `DESIGN-THINKING.md §5` — hand-authored
   missions to a few photographers — before writing app code.
2. **Skills are installed** (taste + Vercel agent-skills in `.agents/skills/`, enabled via
   `.claude/settings.local.json`). New skills: confirm source + version first.
3. **Scaffold the app** (`create-next-app`, App Router, TS, Tailwind v4), wire up the
   Stop/PostToolUse hooks, then let `component-architect` plan the Today → Cull → Diary screens.

> The hooks reference `npx prettier/eslint/tsc/vitest` — they no-op cleanly until the
> Next.js app and those dev-deps exist, so they're safe to keep from day one.
>
> To reproduce this entire agent + harness setup in a fresh chat, paste
> `docs/HARNESS-WORKFLOW-REFERENCE-2026-06.md`.
