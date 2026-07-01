# FrameWalk — Strategy: the remaining roadmap

> Owner: Jason (PM). Author: product-manager agent. Date: 2026-07-01.
> Purpose: judge the ENTIRE remaining backlog against the north star, recommend a
> sequenced prototype slate, and give PRD-level briefs for the "build" set.
> **North star:** weekly *intentful walks completed* (mission opened → ≥1 keeper saved).
> This is a strategy doc only — it touches no other product doc and no code.
>
> ⛔ **This ends at a direction gate.** The slate below is a recommendation. Jason picks.

---

## 0. Where we actually are (grounded in the code)

The loop is done and loved-worthy: Today → Mission → Cull → Story → Diary, on IndexedDB,
100% AI-free, offline, $0, deployed. v1.1 "it sticks" is fully shipped (weekly reflection,
rolls Phase 1, mission favouriting, richer diary filters). The quality gate is real
(tsc + vitest + Playwright + axe, light/dark, mobile/desktop).

**One thing jumped out while reading the code that is *not* on the roadmap and matters more
than most items on it:** `settings-panel.tsx` exports a diary file but there is **no import
path**. The privacy rule is explicit that IndexedDB is evictable (esp. iOS) and Settings
"tells the truth" and "offers on-device export" — but export with no re-import means a user
who loses their diary to eviction, a browser clear, or a new device **cannot get their
walks back**. For a north star measured *weekly over time*, a silent diary wipe with no
recovery is the single most direct retention risk we have. I've added it to the slate as
**P0** even though it wasn't in the list I was handed. Restraint cuts the other way here:
this is the opposite of over-building — it's finishing the promise Settings already makes.

---

## 1. Verdict table — every remaining item

Legend — **NS fit**: how strongly it moves *weekly intentful walks* (Strong / Indirect /
Weak-polish / None). **Effort**: S/M/L grounded in the real code.

### Surfaced gap (not previously listed)

| Item | Judgment | NS fit | Effort | Gate |
|---|---|---|---|---|
| **Diary import (restore an export)** | **Build now (P0)** | **Strong** — closes a silent-wipe retention hole; a lost diary ends the weekly habit | **S–M** | No schema change; reads the same `version:2` payload Settings already writes. Privacy-safe (local file → IndexedDB, no network). Merge/replace semantics need a design call. |

### A. Polish / v1.x tier (ROADMAP "Later")

| Item | Judgment | NS fit | Effort | Gate |
|---|---|---|---|---|
| **Real iOS device pass** | **Build now (P0, but it's Jason's task)** | **Strong (verification)** | S (manual) | Needs Jason's device. iOS PWA is the highest-risk runtime for eviction + camera-roll import; nothing else is trustworthy until this passes. No code. |
| **Landing page (Ma voice)** | **Build soon (P1)** | **Indirect** — doesn't change a returning user's walk, but it's the front door for *any* new intentful walker; growth is gated on it | M | Uses `design-taste-frontend` (marketing only, per PRD §9). Static route, $0. No new data path. |
| **Desktop treatment** | **Build soon (P1)** | **Weak-polish** — the app is mobile-first *by design* ("one thumb throughout"); the walk happens on a phone. Diary *review* on desktop is the one real desktop moment | S–M | Layout is a single `max-w-xl` column in `layout.tsx`; widening diary review is contained. Tokens-only. |
| **Diary thumbnail mat** | **Build soon (P1, bundle w/ desktop)** | **Weak-polish** | S | Pure CSS/token work in `diary-list.tsx`. Ma taste polish. |
| **APG arrow-key nav for radiogroups** | **Build later** | **Weak-polish** | S | AA is *already met* via Tab (roadmap says so). This is AAA-flavored nicety; do it when touching the radiogroup anyway, not as its own push. |
| **Small public beta** | **Build later (sequenced last)** | **Strong-but-gated** | S (process) | Must follow: import shipped + iOS pass green + landing live. Beta before recovery/restore exists would burn first users. |

### B. Rolls Phase 2 (SPEC-rolls §7)

| Item | Judgment | NS fit | Effort | Gate |
|---|---|---|---|---|
| **Pick cover / reorder frames** | **Build soon (P1)** | **Indirect** — makes a roll feel *kept well*, deepening the diary that pulls people back; the model already has `coverIndex` | S (cover) / M (reorder) | No migration — `coverIndex`/`images[]` already exist and are wired through diary + export. Cover-pick is nearly free; reorder is a small array move. |
| **Add-frames-to-an-existing-roll (from Diary)** | **Build later** | **Weak** | M | Re-opening a saved roll to append frames is a new editing surface. Low demand vs. cost; the cull is where grouping naturally happens. Park. |
| **Multiple rolls per walk (partial grouping)** | **Defer** | **Weak** | M–L | Turns the calm Compose step into a multi-select bucketing UI — real complexity against a rarely-hit need. Violates "hold the line at Phase 1" restraint. Revisit only if pilots ask. |

### C. Deferred backlog (BACKLOG.md)

| Item | Judgment | NS fit | Effort | Gate |
|---|---|---|---|---|
| **[AI] Mission enrichment (LLM)** | **Defer (gated)** | Indirect | L | The AI gate is explicit: *missions proven valuable curated first.* No signal yet. Adds a serverless route (dep + $ risk + privacy surface). Needs Jason sign-off + a proven-curated gate. Do **not** build. |
| **[AI] On-device keeper suggestions (cull assist)** | **Defer (gated)** | Indirect | L | Gate: manual cull hits <5 min without it — likely already true. Transformers.js/WebGPU is a big bundle + battery/UX cost for a solved problem. Park. |
| **[AI] PoseCue portrait module** | **Defer** | Weak (different persona) | L | Serves tertiary "Nervous-portrait Noah," not the core plateau/travel personas. Its own PRD when/if prioritized. Park. |
| **E2E-encrypted sync + multi-device** | **Defer** | Indirect | L | Accounts/keys/backend = [engineer scope] + real infra + breaks the "no accounts, $0" simplicity. **Diary import (P0) delivers ~80% of the felt benefit** (move your diary between devices) at ~5% of the cost. Sync waits. |
| **Print / zine export of a diary chapter** | **Build later** | Indirect (delight/meaning) | M | Genuinely on-thesis ("ship the story," "printed maybe 6"). But it's a reward *after* the habit, not a driver *of* it. Strong v1.3 candidate; not now. |
| **Opt-in small-group "walk together"** | **Defer** | Indirect (could be social pull) | M–L | Tempting for retention but reintroduces the comparison/coordination surface the whole product avoids. High taste-risk. Not before the solo loop is proven at scale. |
| **Localized approach-card etiquette** | **Build later** | Indirect (ethics quality) | S–M content | Content, not code — a market/localization concern. Do it when there's a non-English cohort to serve. Park. |

---

## 2. Recommended slate + build order

**Into the prototype for Jason's review (build now / soon):**

1. **Diary import** *(P0, S–M)* — closes the silent-wipe hole; the restore half of a promise
   Settings already half-makes. Highest north-star ROI on the board.
2. **Real iOS device pass** *(P0, Jason's manual task)* — gates trust in eviction + import on
   the one runtime that matters most. Can run in parallel with #1.
3. **Rolls Phase 2 — pick cover / reorder** *(P1, S/M)* — cheap given the model; makes the
   diary feel kept-well. Cover-pick first; reorder if the cover work lands easily.
4. **Landing page in the Ma voice** *(P1, M)* — the front door; growth is gated on it.
5. **Desktop treatment + diary thumbnail mat** *(P1, S–M, bundled)* — the diary-review moment
   on wide screens; honest polish, named as polish.
6. **Small public beta** *(P1, process)* — **only after 1, 2, 4 are green.**

**Explicitly parked (do not build now — restraint is the point):**
- Rolls: add-frames-to-existing-roll, multiple-rolls-per-walk.
- APG arrow-key nav (fold into any future radiogroup change; AA already met).
- All three AI items (gated on "loop loved first" — no signal yet; each needs Jason sign-off).
- E2E sync (diary import covers the real need at a fraction of the cost).
- Zine export (strong v1.3 reward, not a habit driver).
- Group walks (taste-risk; not before the solo loop is proven).
- Localized etiquette (content, driven by a real non-English cohort).

**Recommended build order:** `1 & 2 in parallel → 3 → 4 → 5 → 6`. Rationale: make the diary
*safe to keep* (1, 2) before we make it *nicer* (3, 5) or *invite new people to it* (4, 6).
Recovery before decoration before growth.

---

## 3. PRD-level briefs (the "build" set)

Each brief is designer-ready: JTBD, one specific user, smallest valuable slice, acceptance
sketch (EARS). SPEC files follow after design sign-off; anything schema/dep-touching is
flagged for Jason.

### Brief 1 — Diary import (restore) · P0

- **JTBD:** *When my diary is at risk of being lost — a browser clear, iOS eviction, a new
  phone — help me bring it back from the file I exported, so my weekly practice doesn't end
  with a wiped device.*
- **One specific user:** Rin exports her diary before wiping her phone for a trip reset. She
  reinstalls FrameWalk, opens Settings, and needs her 40 kept walks back — with their frames,
  stories, and missions intact.
- **Smallest valuable slice:** an **Import** card in Settings, directly beside Export. Pick a
  `framewalk-diary-*.json` file → validate it's a FrameWalk `version:2` payload → write the
  keepers into IndexedDB → confirm with a count ("42 entries restored"). Images arrive as the
  `data:` URLs Export already writes; convert back to Blobs on the way in. No network, ever.
- **The one design decision to resolve (Gate 2, designer):** **merge vs. replace.** Recommend
  **merge, de-duplicated by keeper `id`** (import is additive; re-importing the same file is a
  no-op) — this is the calm, non-destructive default and avoids a scary "this will overwrite"
  dialog. Replace-all can be a later power-user option; do not build it now.
- **Acceptance sketch (EARS):**
  - When the user selects a valid FrameWalk export file, the system shall write its keepers to
    the on-device diary and report how many were added.
  - When an imported keeper's `id` already exists, the system shall skip it (idempotent import;
    no duplicates, no overwrite).
  - When the file is not a valid FrameWalk `version:2` payload, the system shall decline calmly
    and change nothing ("That doesn't look like a FrameWalk diary file.").
  - While importing, the system shall make no network request and shall accept the file fully
    on-device.
  - When import finishes, the Diary shall show the restored entries in reverse-chronological
    order with their frames, stories, and missions.
- **Effort / risk:** S–M. **No schema change** (reuses the shipped `version:2` shape and the
  `Keeper` model). No new dependency (`FileReader` + Dexie `bulkPut`/add). **Not a destructive
  migration**, but it *writes to the diary from a file*, so treat the validator + de-dup as a
  pure, unit-tested function (mirror the migration discipline). Flag for Jason: confirm the
  **merge-by-id** semantics before build (it's a data-write contract, not a migration).

### Brief 2 — Rolls Phase 2: pick cover (+ optional reorder) · P1

- **JTBD:** *When I saved a roll from a themed walk, let me choose which frame represents it
  — because the best frame of the set isn't always the first one I kept — so the diary looks
  the way the walk felt.*
- **One specific user:** Pete keeps a 5-frame "colour of the day — red" roll. Frame 3 is the
  strongest, but it saved as the cover-0 default. He wants frame 3 on the cover of the diary
  card.
- **Smallest valuable slice:** in the Diary, when a roll's frame grid is expanded, each frame
  has a quiet **"Make cover"** affordance; choosing it sets `coverIndex` and persists. That's
  it. **Reorder is a stretch, not the slice** — only add drag/position if cover-pick lands
  cleanly; ship cover-pick alone if not.
- **Acceptance sketch (EARS):**
  - When the user picks a frame as the cover of a roll, the system shall persist that choice
    (`coverIndex`) and show that frame as the roll's cover in the Diary.
  - When a roll is a single frame, the system shall show no cover control.
  - The system shall persist the cover choice on-device with no network call and no change to
    the story or frames.
  - (Stretch) When the user reorders frames within a roll, the system shall persist the new
    order and keep the chosen cover pointing at the same frame.
- **Effort / risk:** S (cover) / M (reorder). **No migration** — `coverIndex` and `images[]`
  already exist and flow through diary + export. Persisting a cover change is a `keepers.update`.
  No sign-off needed (no schema change, no new field). Design must keep the control *quiet*
  (Ma restraint) — no editor chrome.

### Brief 3 — Landing page in the Ma voice · P1

- **JTBD:** *When someone hears about FrameWalk, help me understand in ten seconds that this
  is a calm, private, no-AI reason to go shoot — and install it — so a new intentful walker
  actually starts.*
- **One specific user:** a photographer follows a link from a friend on a phone. They've never
  heard of the app. In one scroll they must get the promise (a reason to shoot + a private
  story diary, no AI, on-device) and tap "Start today."
- **Smallest valuable slice:** one static, type-led marketing route (not the app shell). The
  three beats (missions → light cull → story diary) in the Ma voice, the privacy/$0/no-AI
  promise stated plainly, a single primary CTA into the app. Installable-PWA hint. No signup,
  no email capture, no analytics.
- **Acceptance sketch (EARS):**
  - When a new visitor lands, the system shall present the product promise and a single primary
    CTA into the app within the first viewport on mobile.
  - The landing page shall make no third-party or tracking network calls and shall state the
    on-device/no-account/no-AI promise in plain language.
  - The landing page shall meet WCAG 2.1 AA and honor `prefers-reduced-motion`.
- **Effort / risk:** M. **Use `design-taste-frontend`** (marketing only, per PRD §9 — it
  explicitly excludes multi-step product UI). Static route, $0, no data path. No sign-off
  needed unless a new marketing dependency/asset pipeline is proposed (flag if so).

### Brief 4 — Desktop treatment + diary thumbnail mat · P1 (bundled)

- **JTBD:** *When I review my diary on a laptop, help the page use the space calmly instead of
  stranding a phone-width column in the middle of a wide screen — so revisiting my walks feels
  considered, not accidental.*
- **One specific user:** Pete opens `/diary` on his laptop on a Sunday to look back at the
  month. Today he gets a narrow `max-w-xl` column adrift in white space.
- **Smallest valuable slice:** widen the **diary review** experience on large screens (a
  restrained multi-column or wider reading measure for the timeline) while leaving the walk-time
  screens (Today, Mission, Cull, Story) mobile-first and centered — the walk is a phone moment
  by design. Add a subtle **mat/inset around diary thumbnails** so photos sit in the frame
  rather than bleeding to the card edge (Ma "quiet frame around the work").
- **Acceptance sketch (EARS):**
  - When the Diary is viewed on a wide screen, the system shall use a calm wider layout rather
    than a single phone-width column, without changing the walk-time screens.
  - The system shall present each diary photo within a consistent token-defined mat/inset.
  - All values shall derive from `tokens.css`; the change shall meet AA and honor
    reduced-motion.
- **Effort / risk:** S–M. Contained to `layout.tsx` width handling + `diary-list.tsx`
  presentation. **Tokens only** — any new spacing/measure value goes in `tokens.css`, not a
  component. Explicitly named as **polish**, not a north-star mover. No sign-off needed.

### Brief 5 — Real iOS device pass · P0 (Jason's manual task, no code)

- **JTBD (as verification):** *Before we invite anyone, prove the promise holds on the one
  runtime most likely to break it — iOS PWA — so we don't onboard users onto a diary that
  quietly evicts.*
- **Smallest valuable slice:** a scripted manual pass on Jason's device — install to home
  screen → airplane mode → Today + a mission + Diary load; photo import works from the
  installed icon; **export a diary, then import it back** (validates Brief 1 on real iOS); leave
  the app unused/backgrounded to sanity-check persistence behavior.
- **Acceptance sketch:** the installed PWA serves Today + a mission + the diary offline; camera-
  roll import works from the installed icon; an exported diary re-imports intact; persistence
  behaves as Settings claims. **No code output** — findings feed bugs, and gate the beta.
- **Gate:** this is the trust gate before the public beta. Its result is a precondition for the
  beta step, not a parallel nice-to-have.

---

## 4. Recommendation (crisp)

**Prototype slate, in order:**

1. **Diary import** (P0) — recovery for a habit measured over time; closes the silent-wipe hole.
2. **iOS device pass** (P0, Jason, parallel) — trust on the runtime that matters most.
3. **Rolls Phase 2 — pick cover** (P1) — cheap; makes the diary feel kept-well.
4. **Landing page, Ma voice** (P1) — the front door; growth is gated on it.
5. **Desktop + thumbnail mat** (P1, bundled) — honest diary-review polish.
6. **Small public beta** (P1) — only after 1, 2, 4 are green.

**Park (with reasons above):** rolls add-frames + multiple-rolls, APG arrow nav, all AI items,
E2E sync, zine export, group walks, localized etiquette.

**Order rationale:** make the diary *safe to keep*, then *nicer*, then *invite people to it* —
recovery before decoration before growth. The only item I added beyond the list I was handed
(diary import) is, in my judgment, the highest north-star ROI on the whole board, and it's a
finishing move, not a new surface.

⛔ **Direction gate — Jason picks.** Recommended: approve **1–5 for the prototype** and hold
**6 (beta)** until 1, 2, and 4 are green. Say the word and I'll spin up SPEC-<feature>.md for
each approved item and route it through `/design` (Gate 2).
