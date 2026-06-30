---
description: Plan the component structure (tree, props, boundaries) for a feature before code.
argument-hint: <feature>
---

Delegate to the `component-architect` subagent for: **$ARGUMENTS**

Have it produce a tight structure plan: the component tree (Server Components by default —
justify every `'use client'`), props/types at each boundary (interface/Zod, no `any`), which
`src/components/ui/` primitives to reuse, where state lives and how data flows (Dexie reads are
client-side only), and the token groups each component consumes.

Reference the approved design spec at `docs/framewalk/design/<feature>.md` if one exists. Stop
at the plan — implementation is the developer's (main thread) job via `/build`.
