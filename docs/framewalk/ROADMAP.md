# FrameWalk — Roadmap

> Owner: Jason (PM) · Driver: ai-product-builder · Updated 2026-06-23
> North star: weekly *intentful walks completed* (mission opened → ≥1 keeper saved).
> Design direction (locked): 間 Ma — "清亮無負擔" (bright, unburdened, type-led).

## ✅ Done
- **M1 MVP scaffold** — Next.js App Router, React 19, TS strict, Tailwind v4, PWA. AI-free.
- **Core loop** — Today → Mission (approach/ethics cards) → Cull → Story → Diary, on
  IndexedDB; Settings with privacy + on-device export.
- **Engineering harness** — `.claude/` (4 reviewer subagents + ai-product-builder, hooks,
  weekly digest).
- **Ma UI redesign** — tokens rebuilt; light + warm-dim dark; WCAG AA on every pair.
- **Theme toggle** — System / Light / Dark, no-flash init, radiogroup semantics.
- **CTA consolidation** — one shared source (`components/ui/action.ts`); Button + every
  link/label CTA route through it (no drift).
- **A11y** — active nav state, location filter is a real radiogroup, cull focus advance,
  scoped aria-live, hydration fix (`suppressHydrationWarning`).
- **Quality gate institutionalised** — GitHub Actions CI (tsc → vitest → build → gated
  e2e); Playwright E2E for the loop; axe-core (serious/critical, light + dark, across
  /, /settings, /diary, /mission, /cull).
- **Verification** — pure logic strict typecheck + behaviour assertions green; independent
  grill + design/a11y + code reviews (verdict: approve with nits — applied); live browser
  walkthrough of the full loop in light + dark.

## ▶ Now — remaining (needs your machine / a decision)
1. **Restart `npm run dev` after agent edits** — Next's Windows file-watcher doesn't see
   sandbox/mount writes, so SSR can serve a stale module (transient hydration warning).
   Production builds are unaffected. (Process note, not a code fix.)
2. **Run the full gate locally / in CI** — `npm install` then `npm run typecheck && npm test
   && npm run build && npm run e2e`. (The sandbox can't run the Next build; CI will.)

## ⏭ Next
3. **Real iOS device pass** — install to home screen → airplane mode → Today + a mission +
   diary load; photo import works from the installed icon. *(Needs a physical device — you.)*
4. **Deploy** — Vercel Hobby preview; verify $0 + offline. *(Needs your Vercel connection +
   an explicit go — deploying publishes the app.)*
5. **PM decision** — approve (or not) the **ponytail** skill install; confirm any new
   skills/MCPs (untrusted-by-default).

## 🗓 Later (v1.1 "it sticks" — still no AI)
6. Weekly reflection from your own tags; richer diary filters; mission favouriting.
7. Desktop treatment (wide screens currently center a mobile column).
8. Small refinements: APG-grade arrow-key nav for the radiogroup (AA already met via Tab),
   diary thumbnail mat; landing page in the Ma voice; then a small public beta.

## 🧊 Deferred — see `BACKLOG.md`
All AI features + encrypted sync / zine export / group walks. Only after the loop is loved.

## Acceptance bar (every step)
TS strict, tokens are the only source of design values, AA contrast, reduced-motion honored,
nothing is "done" until `tsc` + `vitest` (and now e2e + axe) pass. The writer of code never
approves it — review runs in an independent context.
