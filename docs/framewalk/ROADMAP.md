# FrameWalk — Roadmap

> Owner: Jason (PM) · Driver: ai-product-builder · Updated 2026-06-23
> North star: weekly *intentful walks completed* (mission opened → ≥1 keeper saved).
> Design direction (locked): 間 Ma — "清亮無負擔" (bright, unburdened, type-led).

## ✅ M1 — SHIPPED (the loop works, to product-quality)
- **Core loop** — Today → Mission (approach/ethics cards) → Cull → Story → Diary, on
  IndexedDB; Settings with privacy + on-device export. 100% AI-free.
- **Stack/harness** — Next.js App Router + React 19 + TS strict + Tailwind v4, PWA;
  `.claude/` harness (4 reviewer subagents + hooks + weekly digest).
- **Ma UI** — tokens single-source; light + warm-dim dark; System/Light/Dark toggle;
  WCAG AA on every pair; one shared CTA source; location filter is a real radiogroup.
- **Quality gate — GREEN** (verified on the machine 2026-06-23):
  `tsc --noEmit` clean · `vitest` 13/13 · `next build` compiles · **Playwright 28/28**
  (core loop + axe serious/critical = 0, light + dark, mobile + desktop, across
  /, /settings, /diary, /mission, /cull). CI runs all of it on every push.
- **Reviews** — pre-code grill gate; independent design/a11y + code reviews (approve with
  nits — applied); live browser walkthrough in light + dark.

## ✅ Also done (2026-06-23)
- **Deployed live** — https://framewalk-psi.vercel.app (Vercel Hobby, $0). Built on patched
  **Next 15.5.19** after Vercel blocked the vulnerable 15.3.5. GitHub repo linked
  (Piwison/framewalk) for auto-deploys.
- **Dependency hygiene** — `npm audit` triaged: all 6 flags were dev/test/build tooling, none
  in the shipped bundle. Bumped vitest → 3.2.6, @playwright/test → 1.61.1, added a
  `postcss ^8.5.10` override. (Run `npm install` + `npm audit fix` to confirm clean.)

## ▶ Now — remaining
1. **Real iOS device pass** — install to home screen → airplane mode → Today + a mission +
   diary load; photo import works from the installed icon. *(Needs your device.)*
2. ✅ **ponytail APPROVED** (2026-06-23) — install via the desktop plugin UI (agents can't
   install plugins from a session). See `SKILLS-TO-IMPORT.md`.

## 🗓 Later (v1.1 "it sticks" — still no AI)
5. ✅ **Weekly reflection** shipped — `lib/reflection.ts` + `ReflectionCard` on Diary (no AI,
   on-device, vitest-covered).
   - ✅ **Mission favouriting** shipped (2026-07-01) — a quiet bookmark toggle on Today;
     favourites gently steer `missionOfTheDay` + "Another" (fallback ladder intact).
     `localStorage`-backed (`lib/favourites.ts`, no schema change), on-device.
     `SPEC-mission-favouriting.md` FR-F1..F8. Built via the full agent team (PM → design →
     build → QA → 3-way review, unanimous approve). Gate green: tsc + vitest 36/36 +
     Playwright/axe 72/72.
   - ▶ **Richer diary filters** — in build (P0: Theme + With-people single-select chips,
     client-only, threshold-gated; gate 1 approved 2026-07-01, `SPEC-diary-filters.md`).
5b. ✅ **Rolls (Phase 1)** shipped — multi-image diary entries grouped during the cull
   (`SPEC-rolls.md`, FR-R1..R5). Dexie v2 non-destructive migration (existing keepers → rolls
   of 1), Compose step (one-roll vs each-on-its-own), roll Diary card (cover + count badge +
   expandable grid), `images[]` export, reflection "frames" tally. tsc + 24 vitest + build
   green; live browser pass (single + 3-frame roll). **Phase 2 still open**: pick cover /
   reorder, multiple rolls per walk, add-frames-to-existing-roll from the Diary.
6. Desktop treatment (wide screens currently center a mobile column).
7. Small refinements: APG-grade arrow-key nav for the radiogroup (AA already met via Tab),
   diary thumbnail mat; landing page in the Ma voice; then a small public beta.

## 🧊 Deferred — see `BACKLOG.md`
All AI features + encrypted sync / zine export / group walks. Only after the loop is loved.

## Acceptance bar (every step)
TS strict, tokens are the only source of design values, AA contrast, reduced-motion honored,
nothing is "done" until `tsc` + `vitest` + `e2e` + `axe` pass. The writer of code never
approves it — review runs in an independent context.
