# FrameWalk — M1 build notes (2026-06-22)

Scaffolded the M1 MVP loop (Today → Mission → Cull → Story → Diary → Settings) as a
mobile-first PWA: Next.js App Router, React 19, TypeScript `strict`
(+`noUncheckedIndexedAccess`), Tailwind v4 with all values from `src/styles/tokens.css`,
IndexedDB via Dexie, hand-written offline service worker. 100% AI-free per the PRD.

## Verification gate — grill-me (independent-context subagent)

Before any screen code, an adversarial subagent grilled the plan under both grill-me and
ponytail discipline. It caught three real holes and several over-builds. What changed as a
result:

- **Privacy promise made enforceable (was aspirational).** Added a strict CSP in
  `next.config.ts` (`connect-src 'self'`, `img-src 'self' blob: data:`) so the app
  *cannot* exfiltrate image data even by accident. Zero analytics in M1.
- **Data-loss guard (IndexedDB is evictable, esp. iOS).** `src/lib/storage.ts` calls
  `navigator.storage.persist()` and Settings tells the truth about local-only storage +
  offers on-device export (`FR-10`).
- **Keeper storage model decided.** Thumbnail-only (≤1080px JPEG, on-device) — there is no
  durable handle to the original after the OS picker closes, so the thumbnail *is* the
  saved keeper, by design. Documented in `src/lib/types.ts`.
- **Cull a11y closed the test gap.** Keep/let-go are labeled `<button>`s with `aria-live`
  feedback, focus advance to the next card, and a reduced-motion-aware motion token. A
  smoke test (`cull-flow.test.tsx`) asserts the labels, focus, and that the file input does
  **not** set `capture` (which would force the camera and break camera-roll import).

### ponytail (YAGNI) calls applied
Native `<input type="file">` import (no library) · native `<textarea>` instead of a
PromptField primitive · approach/ethics cards inlined on Mission detail instead of a custom
Sheet · 12 hand-authored missions over 60 filler cards · one hand-written SW instead of a
framework. Nothing that touches validation, security, or a11y was cut.

## Design honesty note (caught in verification)
"Mission of the day" is stable on reload **within a time-of-day window**, but intentionally
changes morning→evening (FR-1 wants a mission suited to *now*). The initial "stable all day"
claim/test was wrong and was corrected.

## Verification status
- ✅ Pure domain logic (`mission-select.ts`) — typechecks under `strict` +
  `noUncheckedIndexedAccess`, and all behavioural assertions pass (12 missions, all 24h
  covered, no-repeat window, graceful-fallback, another≠current).
- ⏳ Full `tsc --noEmit` + `vitest run` + `next build` — not run here (the Next/Tailwind
  install exceeds the sandbox's time budget). Run locally:

```bash
npm install
npm run typecheck   # tsc --noEmit (strict)
npm test            # vitest run  (mission-select + cull a11y smoke)
npm run dev         # http://localhost:3000
npm run build       # production + PWA
```

## Manual checklist before "done" (promises tests can't prove)
1. Install to home screen on a real iOS device → airplane mode → Today, a Mission, and
   Diary all load; photo import still works from the **installed** icon.
2. Keyboard-only pass through the cull (Tab/Enter only) — Keep/Let-go reachable, focus
   advances, decisions announced.
3. Confirm no network requests carry image data (DevTools → Network, with CSP active).

## Production upgrade path
Replace the hand-written `public/sw.js` with `@serwist/next` for Workbox-grade precaching of
hashed Next assets before public beta (M3). See `docs/SKILLS-TO-IMPORT.md`.
