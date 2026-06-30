# FrameWalk — Spec: Rolls (multi-image entries)

> Status: **Phase 1 SHIPPED** (2026-06-30) · originally proposed 2026-06-23 · v1.1+
> Owner: Jason (PM). Companion: `PRD.md`, `DESIGN-THINKING.md`.
> Phase 1 landed: `Keeper.images[]`/`coverIndex` + Dexie v2 migration (`src/lib/db.ts`),
> Compose step in the cull (`src/components/cull-flow.tsx`), roll Diary card
> (`src/components/diary-list.tsx`), `images[]` export (`settings-panel.tsx`), and the
> reflection "frames" tally (`src/lib/reflection.ts`). Phase 2 (§7) remains open.

## 1. Problem (design-thinking)
A themed mission ("the colour of the day — red", "three frames") is a **study**: one walk
yields several frames that mean something *together*. Today each kept photo is a separate
one-photo / one-line keeper, which fragments the series and clutters the Diary. The story
belongs to the *set*, not each frame.

**JTBD:** "When I finish a themed walk, let me keep the frames that belong together as one
entry with one story — without making the simple single-photo case any harder."

## 2. Goals / non-goals
- G1 Let a walk's kept frames be saved as **one roll** with **one shared story**.
- G2 Keep the single-photo path exactly one tap (rolls are opt-in; default = singles).
- G3 Stay on-device, thumbnail-only, no upload (unchanged privacy model).
- N1 No reordering / cover-picking / cross-walk rolls in v1 (Phase 2).
- N2 No AI grouping or auto-tagging.

## 3. The flow (group during the cull)
Review (keep/let-go, one at a time) is unchanged — kept frames accumulate in a tray.
After the last frame:
- **0 kept** → done ("a good edit too"), as today.
- **1 kept** → straight to the single Story step → saved as a roll of 1 (== today's card).
- **≥2 kept** → a new **Compose** step:
  - the kept frames shown as a calm thumbnail grid;
  - one clear choice: **Save as one roll** (primary) · **Save each on its own** (quiet);
  - "one roll" → one Story step for the whole roll → save;
  - "each on its own" → the existing per-frame Story loop (each saved as a roll of 1).

Focus advances to the Compose heading; `aria-live` announces the choice; keep/let-go a11y
unchanged.

## 4. Data model (IndexedDB — needs PM sign-off: it's a schema migration)
`Keeper` becomes a multi-image entry:
```
interface Keeper {
  id; missionId; missionTitle; story; createdAt;   // unchanged
  images: readonly Blob[];   // 1..N thumbnails  (was: thumbnail: Blob)
  coverIndex: number;        // default 0
}
```
**Dexie v2 upgrade** (non-destructive, reversible-in-spirit): map each existing row's
`thumbnail` → `images: [thumbnail]`, `coverIndex: 0`, drop `thumbnail`. Existing diaries keep
working, displayed as rolls of 1.

## 5. Surfaces touched
- **Cull** — add the Compose step + roll-aware save (`addKeeper` takes `images[]`).
- **Diary** — a roll (>1) renders as a cover + a small count badge ("4"); tap expands to an
  inline grid of all frames above the story. A single (==1) renders exactly as today.
- **Reflection** — an entry still counts as one keeper/walk; add a "frames" tally
  ("12 frames across 5 walks"). Themes/people unchanged (still per originating mission).
- **Export** — entries serialize `images[]` (array of data URLs) instead of one thumbnail.

## 6. Acceptance criteria (EARS)
- FR-R1 — When the user keeps ≥2 frames in a cull, the system shall offer "one roll" or
  "each on its own" before writing any story.
- FR-R2 — When the user chooses one roll, the system shall store all kept frames under a
  single entry with one story and `coverIndex = 0`.
- FR-R3 — When exactly one frame is kept, the flow shall present no extra step.
- FR-R4 — When the Diary shows a roll, it shall display a cover, a frame count, and a way to
  view every frame; a single shall render unchanged.
- FR-R5 — The system shall migrate existing single-image keepers to rolls of 1 with no data
  loss, and shall never upload or copy any image.

## 7. Phasing
- **Phase 1 (this spec):** model + migration, Compose step (all-or-singles), roll Diary card,
  one story per entry, export update, reflection "frames" tally.
- **Phase 2 (later):** pick cover / reorder, multiple rolls per walk (partial grouping),
  add-frames-to-an-existing-roll from the Diary.

## 8. Risks
- R1 Migration on a populated diary — gate behind `navigator.storage.persist()` already in
  place; test the v1→v2 upgrade on seeded data before shipping.
- R2 Scope creep into a full gallery/editor — hold the line at Phase 1; rolls are *saved as a
  set*, not edited.
