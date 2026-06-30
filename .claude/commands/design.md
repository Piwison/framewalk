---
description: Produce a Ma-voice UX/UI design spec for a feature, then STOP for design sign-off.
argument-hint: <feature>
---

Delegate to the `product-designer` subagent for: **$ARGUMENTS**

Have it produce a design spec at `docs/framewalk/design/<feature>.md` covering flow & IA,
layout & hierarchy, interaction & motion (honoring `prefers-reduced-motion`), voice & microcopy
in the Ma language (清亮無負擔), the token groups consumed (all values from
`src/styles/tokens.css`), and the accessibility intent.

Anti-slop bar applies. Reuse `src/components/ui/` primitives before inventing new ones.

**STOP and present the design direction for Jason's sign-off** — this is gate 2. Do not hand to
`component-architect` until the direction is approved.
