---
description: Design-token discipline for all UI code.
paths: ["src/**"]
---

# Tokens are the single source of design values

- Every color, type-scale, spacing, radius, and motion value comes from
  `src/styles/tokens.css`. **No magic values** (no raw hex, px, or font names) in components.
- The look is 間 Ma — "清亮無負擔" (bright, unburdened, type-led): editorial serif for prose,
  generous whitespace, **one** accent used sparingly, light + warm-dim dark, no streak guilt.
- Reuse the primitives in `src/components/ui/` (`Button`, `Chip`, `Card`, the shared
  `action.ts` CTA source) before inventing new ones. Route every CTA through the shared source
  so styles can't drift.
- Motion honors `prefers-reduced-motion`. One accent; restraint over decoration; anti-slop
  (no stock gradients, generic hero, glassmorphism cliché, emoji confetti).
