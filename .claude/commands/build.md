---
description: Implement a feature on the main thread, per the approved architecture and rules.
argument-hint: <feature>
---

Implement **$ARGUMENTS** yourself (main thread = developer). Do NOT delegate this to a subagent.

Work to the architecture plan (and the design spec at `docs/framewalk/design/<feature>.md`).
Checklist:
- Server Components by default; `'use client'` only at a justified interactivity boundary.
- TypeScript `strict`, no `any`; type API/data boundaries with `interface`/Zod.
- Every color/type/spacing value from `src/styles/tokens.css` — no magic values.
- Reuse existing primitives in `src/components/ui/` before adding new ones.
- Any new dependency or schema/data migration needs Jason's sign-off first.
- After each write, let the hooks run (format → lint → `tsc --noEmit` → related tests). Keep
  commits small and reversible.

When the slice compiles and the related tests pass, hand to `/qa`.
