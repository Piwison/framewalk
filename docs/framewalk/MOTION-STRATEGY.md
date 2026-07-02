# FrameWalk — Motion & interaction strategy (research + recommendation)

> Owner: Jason (PM). Date: 2026-07-01. Prompted by: "make the app modern, interactive, responsive."
> Design language: 間 Ma — 清亮無負擔. North star: weekly intentful walks completed.

## 0. The finding that decides everything
The 2026 industry consensus on motion is **restraint**, not spectacle: "calm interfaces… the
end of visual theatrics," "purposeful motion that guides attention, not chaotic effects,"
"design maturity is measured not by how much movement an interface contains, but by how
intentional it is." That is *already* FrameWalk's thesis. So "modern/interactive/responsive"
here does **not** mean adding animation — it means adopting **platform-native, purposeful
motion** that adds *continuity* and *feedback*, and cutting anything decorative. Modern = calm,
fast, and continuous. We lean into what we are, not away from it.

**Three rules any motion must pass:**
1. **It answers a question** — "what just happened?" (feedback) or "where did this come from?"
   (continuity). If it answers neither, it's decoration → cut it.
2. **It collapses under `prefers-reduced-motion`** — every duration reads a token that is `0ms`
   in reduced-motion (already wired in `tokens.css`). Reduced-motion is a first-class path, not
   an afterthought (WCAG 2.3.3).
3. **It costs ~0 and ships $0** — prefer platform primitives over a JS animation library
   (matches the repo's hand-rolled, dependency-light ethos). No new runtime dep without PM
   sign-off.

## 1. Where we already are (good foundation)
`tokens.css` already tokenizes motion (`--motion-fast: 140ms`, `--motion-base: 260ms`, `--ease`)
and collapses both to `0ms` under `prefers-reduced-motion`. Components consume the tokens
(chip/CTA color transitions, favourite fill, import status cross-fade). This is exactly the
"centralize motion in custom properties" best practice — we extend it, we don't replace it.

## 2. The plan — three platform layers, progressively enhanced

### Layer A — View Transitions API (the hero, biggest "modern" win, ~0 cost)
Same-document View Transitions are supported in Chromium + Safari 18+ (~78–85% of users, mid-2026;
Firefox behind a flag) and **degrade gracefully** to an instant swap where unsupported — which is
also the reduced-motion baseline, so there is no separate fallback to maintain. Next.js App Router
integrates via `experimental.viewTransition` + React's `<ViewTransition>`, and route navigations
trigger transitions automatically.

Use it for **continuity at the two moments the eye should follow a single object**, via
`view-transition-name` shared-element morphs:
- **Mission → Mission detail** — the mission title/card persists across the navigation.
- **Diary cover → expanded roll grid** — the cover photo morphs into its place in the grid
  (and back). This is the signature "the frames belong together" moment from Rolls.
- **Cull keeper → Diary** and **"Another"** — a quiet cross-fade of the card, not a slide.

This is the single highest-impact, most on-brand upgrade: the app stops *cutting* between states
and starts *flowing* — the literal meaning of 間 (the space *between*). Cross-fades only; **no
slides, zooms, or parallax** (the large-movement effects WCAG 2.3.3 flags first).

### Layer B — CSS micro-interactions (extend what we do, no JS)
Keep everything as tokenized CSS `transition`s. Tasteful additions, all ≤ `--motion-fast`:
- Confirm feedback that "settles" (import count, favourite mark, cover set) — opacity/color only.
- `@media (hover: hover)` / `(pointer: fine)` guards so hover affordances don't misfire on touch
  (part of "responsive" = adapts to input, not just viewport).
- Focus-visible already tokenized; keep it crisp.

### Layer C — CSS scroll-driven animations (landing page only)
The landing page (slate item 3) is the *one* surface where a little life is on-brand. Use pure CSS
`animation-timeline: view()` to fade/rise the three beats as they enter — **no JS, no library**.
~85% support mid-2026; unsupported browsers (and reduced-motion) simply show the static page, which
is the intended baseline. Do **not** use scroll-driven motion anywhere in the app shell (walk
screens stay still and calm).

### Layer D — JS animation library: **defer** (YAGNI)
No spring/gesture library is needed for the current slate — CSS + View Transitions cover it. If a
future interaction genuinely needs physical drag/gesture (e.g. a swipe-cull, or Rolls reorder — both
currently parked), reach for **Motion's granular imports** (`useAnimate` mini ~2.3kb, or
`LazyMotion` + `domAnimation` ~15kb) rather than the full bundle (~34–46kb) or React Spring (~18kb) —
and only behind PM sign-off (it's a dependency + a privacy-surface review). Not now.

## 3. Applied to the approved slate (1–5)
- **Diary import** — status line cross-fade (already designed); the restored count "settles" in.
  No spinner (a text state degrades cleanly). ✅ CSS only.
- **Rolls pick-cover** — the amber `Cover` chip/ring cross-fade (already designed) + a **View
  Transition** so the chosen frame morphs to the collapsed card's cover. ✅ Layer A + B.
- **Landing page** — Layer C scroll-driven beats, fully reduced-motion-gated. ✅
- **Desktop + mat** — none (pure layout). ✅
- **iOS pass** — verify motion feels right on a real device; confirm reduced-motion + Low Power
  behave. (Manual.)

## 4. Guardrails & a11y
- Every new motion reads a token that is `0ms` under reduced-motion; any JS-driven motion uses
  `matchMedia('(prefers-reduced-motion: reduce)')` (or Motion's `useReducedMotion`) to stay in sync.
- View Transitions: wrap `::view-transition-*` cross-fades so they honor reduced-motion; verify no
  layout jump / CLS; test against the theme init script + hydration (a known past footgun).
- Keep interactions ≤ ~140ms so perceived responsiveness *improves* (shorter animations settle
  faster — better INP). "Responsive" is as much *speed of feedback* as it is layout.
- The quality gate is unchanged: tsc + vitest + Playwright + axe, light/dark, mobile/desktop.

## 5. Tokens to add (proposed, sign-off)
- `--motion-emphasis` (~320–400ms, for the View-Transition cross-fade only) + reuse `--ease`.
  Collapses to `0ms` under reduced-motion like the others. This is the only motion-token change.

## 6. Rollout (fold into the slate, don't stop it)
1. **Motion foundation PR** — enable `experimental.viewTransition`, add `--motion-emphasis`,
   add shared-element `view-transition-name`s for mission→detail and diary-cover→roll-grid, all
   reduced-motion-gated. Small, self-contained, high-impact.
2. Bake the per-item motion (above) into each slate build as it happens — pick-cover morph with
   the pick-cover feature, scroll-driven beats with the landing page.
3. Verify on the **iOS device pass** that it feels right on real hardware.

**Recommendation:** platform-first (View Transitions + CSS), no JS animation dependency now, and
motion strictly in service of continuity + feedback. It makes the app feel modern and alive *because*
it's restrained — which is both the 2026 consensus and the Ma thesis.
