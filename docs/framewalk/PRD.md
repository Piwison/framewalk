# FrameWalk — Product Requirements Document (v1)

> 街拍日課 · A photo-walk companion that beats creative block and the fear of strangers.
> Owner: Jason (PM) · Status: Draft for build · Last updated: 2026-06-21
> Companion doc: `DESIGN-THINKING.md`. Acceptance criteria use EARS phrasing for Spec Kit.

---

## 1. Summary
FrameWalk is a mobile-first PWA that gives hobbyist street / daily-life photographers a
small, contextual **reason to go shoot** (missions), gentle **approach coaching** to lower
the fear of photographing strangers, a fast **cull**, and a private **story diary** that
makes growth feel real. It coaches the human eye — it never generates or edits the photo.

> **MVP is 100% AI-free.** Missions come from a hand-authored library; culling and stories
> are entirely user-driven. All AI ideas are deferred and tracked in `BACKLOG.md`.

## 2. Problem
Capable hobbyists plateau because of the blank page (no intention), fear of shooting people,
and a backlog that means keepers are never seen again. The 2026 shift toward human, imperfect
work makes a *coaching* tool (not another AI editor) timely. See `DESIGN-THINKING.md §1`.

## 3. Goals & non-goals
**Goals**
- G1 — Get the user out shooting *with intent* more often, and have it feel like play.
- G2 — Reduce the social fear of photographing strangers, ethically.
- G3 — Make culling so light it actually happens (< 5 min/session).
- G4 — Preserve the *story* of keepers so growth is visible over time.
- G5 — Ship at ~$0 run cost and private-by-default.

**Non-goals (v1)**
- N1 — No AI image generation or auto-editing. Ever, as a principle.
- N2 — No social feed, followers, or public leaderboards.
- N3 — No pro/client workflow (invoicing, galleries, contracts).
- N4 — No cloud photo storage in v1 (photos stay on device).
- N5 — Not a camera-replacement; you shoot with whatever you already use.

## 4. Target users & platform
Primary: "Plateau Pete" (street/daily hobbyist). Secondary: "Travel-record Rin." See personas
in `DESIGN-THINKING.md §1`. Platform: installable PWA, **mobile-first** (iOS/Android via
browser), responsive up to desktop for diary review. Offline-capable for missions.

## 5. Key product decisions (assumptions — flag to change)
- **D1 — On-device first.** Photos never leave the device by default; culling thumbnails and
  EXIF processed locally. This is the privacy ethic *and* the $0-inference story.
- **D2 — Missions: curated library only (no AI in MVP).** Ship a hand-authored **mission
  library** (~60 cards) filtered by context (time-of-day, location-type, difficulty). The
  MVP has **no AI/LLM features at all**. LLM-based mission enrichment is deferred → `BACKLOG.md`.
- **D3 — Deploy on Vercel** (Hobby tier) — matches the imported Vercel skills; static + a thin
  serverless route for optional mission enrichment. Effectively free at launch.
- **D4 — No accounts in v1.** Local storage (IndexedDB). Optional encrypted export/import for
  device migration. (Accounts/sync = later.)
- **D5 — Stack:** Next.js (App Router) + React + TypeScript (strict) + Tailwind v4; PWA via
  service worker; IndexedDB (Dexie) for diary; `next/image` off (photos are local blobs).

## 6. Scope

### MVP (v1.0) — "the loop works"
1. **Mission of the day** from the local library, filtered by time-of-day + chosen
   location-type (street / nature / home / travel) + difficulty.
2. **Approach cards** — ethics spine + 6–8 short scripts for shooting people.
3. **Session cull** — import from camera roll, fast keep/let-go, mark keepers.
4. **Story capture** — one prompt → one line per keeper.
5. **Diary** — reverse-chronological keepers with their stories + the mission they came from.
6. **Calm shell** — install as PWA, works offline, no account.

### v1.1 — "it sticks" (still no AI)
- Gentle **weekly reflection computed from the user's own tags** ("you practiced 'light' 3×
  this month") — simple local aggregation, no AI.
- Smarter library filtering, mission favoriting, richer diary themes/filters.

### Later / deferred
See **`BACKLOG.md`** for the full deferred list, including all **AI features** (LLM mission
enrichment, on-device keeper suggestions, PoseCue) and non-AI items (encrypted sync,
print/zine export, opt-in group walks). AI is revisited only after the core loop is loved.

## 7. Functional requirements (EARS acceptance criteria)

**Missions**
- FR-1 — When the user opens the app, the system shall present one mission appropriate to the
  current local time-of-day and the user's selected location-type.
- FR-2 — When the user requests another mission, the system shall offer a different mission
  without repeating any mission served in the last 7 days until the pool is exhausted.
- FR-3 — While the device is offline, the system shall still serve missions from the local
  library.
- FR-4 — *(Deferred — not in MVP.)* LLM-based mission enrichment is out of scope for the MVP
  and specified in `BACKLOG.md`. The MVP serves missions from the curated library only.

**Approach coaching**
- FR-5 — When the user opens a mission that involves photographing people, the system shall
  make approach cards and the ethics guidance one tap away.

**Cull**
- FR-6 — When the user starts a session cull and selects photos, the system shall present them
  one-at-a-time (or in a fast grid) for a keep/let-go decision, processing entirely on-device.
- FR-7 — When the user finishes a cull, the system shall retain only references to kept photos
  and the user's marks; it shall not upload, copy, or transmit any image.

**Story & diary**
- FR-8 — When a photo is kept, the system shall prompt for a one-line story and shall allow
  saving the keeper without a story (story is encouraged, never forced).
- FR-9 — When the user opens the diary, the system shall show keepers in reverse-chronological
  order with story, date, and originating mission.
- FR-10 — When the user requests an export, the system shall produce a local file (JSON +
  references / optional embedded thumbnails) with no network call.

**Privacy & platform**
- FR-11 — The system shall function with all online features disabled (full offline mode).
- FR-12 — Where any feature would send data off-device, the system shall require explicit
  opt-in and state what is sent before the first use.
- FR-13 — The system shall be installable as a PWA and launch to the mission in < 2s on a
  mid-range 2023 phone (warm load).

## 8. UX / Information architecture

### Screens
1. **Today** (home) — the mission, location-type chip, "another," and a calm "I'm going" CTA.
2. **Mission detail** — the why + the how + approach cards (if people).
3. **Cull** — import sheet → fast keep/let-go → keepers summary.
4. **Story** — per-keeper one-line prompt.
5. **Diary** — timeline of keepers; filter by theme/mission.
6. **Settings** — location-type defaults, online enrichment toggle, on-device cull toggle,
   export/import, "what we send" transparency page.

### Primary flow
Open → Today (mission) → go shoot → return → Cull → Story → Diary. One thumb throughout.

### Tone & content (apply `writing-guidelines`)
Warm, brief, second-person, never preachy. Missions are invitations ("See if you can find…"),
not orders. No streak guilt; absence is met with "welcome back," not "you broke your streak."

## 9. Design system & taste

> Use `web-design-guidelines` + `vercel-composition-patterns` for the **app interior**
> (multi-step product UI). Use **`design-taste-frontend`** for the **marketing landing page**
> only — that skill explicitly excludes multi-step product UI. `design-reviewer` enforces that
> all values derive from tokens; `a11y-checker` enforces WCAG 2.1 AA.

**Vibe:** calm, editorial, photographic. The app is a quiet frame around the user's work —
the photos are the color; the UI is near-monochrome so images never fight the chrome.

**Design tokens (single source of truth → `src/styles/tokens.css`)**
- Color: near-black ink `#16150F` on warm paper `#FAF8F2`; one restrained accent (film-amber
  `#C8743C`) used sparingly for the primary action; neutral grays for structure. Full dark mode.
- Type: one humanist serif for mission prose (editorial warmth) + one clean sans for UI;
  modular scale (1.25). Generous line-height for the reflective tone.
- Space: 4px base, 8-pt rhythm. Roomy. Whitespace is a feature, not a bug.
- Motion: restrained; `view-transitions` (Vercel skill) for Today→Mission and cull steps. No
  bouncy gamification. Respect `prefers-reduced-motion`.
- Components: own primitives in `components/ui/` (optionally shadcn/ui via MCP) — button,
  chip, sheet, card, prompt field. No magic values in components.

**Anti-slop guardrails:** no stock-y gradients, no generic SaaS hero, no emoji-confetti
rewards. If it could be any AI app, it's wrong.

## 10. Success metrics
- **North star:** weekly *intentful walks completed* (mission opened → ≥1 keeper saved).
- **Activation:** % of new users who complete one full loop (mission → cull → 1 keeper+story)
  within 48h. Target ≥ 40%.
- **Habit:** W4 retention of ≥ 25%; median ≥ 1 walk/week among retained.
- **Fear reduction (survey):** ≥ 50% report taking a people-shot they'd normally skip.
- **Story rate:** ≥ 60% of keepers have a story line.
- **Cost guardrail:** infra ≤ ~$0/mo at < 5k MAU (Vercel Hobby + fully on-device; no AI services).
- **Quality gate (from Test phase):** ship to wider audience only after the pilot signals in
  `DESIGN-THINKING.md §5` are met.

## 11. Technical architecture (free-stack)
- **Frontend/app:** Next.js App Router, mostly Server Components for shell, client components
  for camera-roll import, cull, and IndexedDB. TS strict, Tailwind v4.
- **Storage:** IndexedDB via Dexie (diary entries, story text, photo references/thumbnails).
  No backend DB in v1.
- **AI:** **none in the MVP** — no LLM calls, no serverless AI route, no model downloads.
  Deferred AI features (mission enrichment, on-device keeper suggestions) are specified in
  `BACKLOG.md` and would only ever be opt-in with a guaranteed non-AI fallback.
- **Hosting:** Vercel Hobby (uses imported `deploy-to-vercel` / `vercel-cli-with-tokens`).
- **PWA:** service worker for offline missions + app shell; installable manifest.
- **Quality harness:** repo hooks run prettier→eslint→tsc on write; Stop hook runs tsc +
  vitest; Playwright E2E for the core loop; axe-core in CI. Nothing ships red.

## 12. Risks & mitigations
- **R1 — Missions feel gimmicky / wear off.** → Hand-author a strong, varied library; validate
  pull in the concierge pilot *before* heavy build. (LLM tuning is a deferred option in
  `BACKLOG.md`, not part of MVP.)
- **R2 — Ethics of photographing strangers.** → Lead with consent-and-respect guidance; never
  encourage covert/creepy behavior; localize etiquette norms later.
- **R3 — Culling friction.** → MVP cull is fully manual and on-device. AI keeper-suggestions
  are deferred (`BACKLOG.md`) so they can never block or complicate the core loop.
- **R4 — "Why not just use Lightroom/IG?"** → We own the *reason-to-shoot* + *story* loop, not
  storage or editing; stay in that lane.
- **R5 — Privacy trust.** → Default offline, explicit opt-in, a plain-language "what we send"
  page; never transmit images.

## 13. Milestones
- **M0 — Validate (1–2 wk):** concierge pilot with manual missions (no build). Gate on §5 signals.
- **M1 — MVP loop (build):** Today + library missions + manual cull + story + diary, offline PWA.
- **M2 — Stick:** non-AI weekly reflection (from tags) + library/diary refinements.
- **M3 — Landing + launch:** marketing page (design-taste-frontend), then a small public beta.
- **M4 — (Deferred) AI exploration:** revisit `BACKLOG.md` AI items only after the core loop
  is validated and loved.

## 14. Open questions
- Camera-roll import friction on iOS PWA — how smooth can it be without native? (spike)
- Localize approach-card etiquette per region/market? (later)
- *(Deferred)* Best lightweight on-device "likely keeper" signal — only if we pursue the AI
  items in `BACKLOG.md`.
