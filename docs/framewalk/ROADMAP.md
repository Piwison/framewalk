# FrameWalk — Roadmap (Now / Next / Later)

> Owner: Jason (PM) · Driver: ai-product-builder · Updated 2026-06-22
> North star: weekly *intentful walks completed* (mission opened → ≥1 keeper saved).

## Design direction (locked): 間 Ma — "清亮無負擔"
Bright, unburdened, type-led. The chrome is washi-pale and quiet so the photos are the
only colour; negative space and a single hairline do the structuring; the film-amber accent
shrinks to a *mark* (an underline, a dot, the active chip) rather than a loud button. The
primary action is a calm ink-filled pill, not an amber blob. Dark mode is a warm dim, not a
darkroom. This is the opposite of AI-slop: no gradients, no glass, no shadow-heavy cards.

## Now (this session)
1. **Design tokens → Ma.** Rewrite `src/styles/tokens.css` (palette, type, space, radius,
   motion) as the single source of truth; every screen re-skins from it. WCAG AA preserved.
2. **Re-skin primitives + screens.** Button (ink-fill primary), Card (hairline, no heavy
   shadow), Chip; refine Today / layout / Mission for negative-space rhythm and serif display.
3. **Render for review.** Faithful visual of Today, Mission, Cull, Diary in the new system.
   → **PM review gate here.**

## Next (after PM sign-off on the look)
4. **Make it real on device.** `npm install`, `npm run dev`; walk the loop on a real iOS
   PWA (install → airplane mode → import). Run the Stop hook green (`tsc` + `vitest`).
5. **Rendered-screen review by the harness.** `design-reviewer` (token compliance, anti-slop,
   light/dark, mobile/desktop) + `a11y-checker` (WCAG AA, keyboard, reduced-motion) on the
   running app; `code-reviewer` signs off in an independent context.
6. **Playwright visual baseline + E2E** for the core loop; axe-core in CI.
7. **Deploy preview** to Vercel Hobby; validate $0 cost + offline.

## Later
8. **v1.1 "it sticks" (still no AI):** weekly reflection computed from the user's own tags,
   richer diary filters, mission favouriting.
9. **Landing page** in the Ma voice (`design-taste-frontend` for the marketing page only),
   then a small public beta.
10. **Deferred AI items** (`BACKLOG.md`) revisited only after the core loop is loved.

## Acceptance bar (every step)
TS `strict`, tokens are the only source of design values, AA contrast, reduced-motion
honoured, and nothing is "done" until `tsc` + `vitest` pass. The writer of code never
approves it — `code-reviewer` runs independently.
