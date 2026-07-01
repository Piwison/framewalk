# FrameWalk — Spec: Richer diary filters

> Status: approved for build (Jason, gate 1) · 2026-07-01 · v1.1 "it sticks"
> Owner: Jason (PM). Companion: `PRD.md`, `DESIGN-THINKING.md`, `reflection.ts`.
> Scope: **P0 — Theme + With-people single-select chips**, client-only (no schema change).

## 1. Problem (design-thinking)
"Travel-record Rin," weeks in with 20–40 keepers, opens the diary in *look-back* mode:
"show me the frames from that colour walk" / "where are the ones with people?" Today the diary
is one reverse-chronological pile with no way to narrow it. This is the **look-back reward**
surface that (softly, indirectly) brings people back.

**JTBD:** "When I open my diary to relive or find a particular kind of walk, help me narrow to
just those frames so I can re-feel the thread of my practice without scrolling the whole pile."

**North-star honesty:** the link is second-order (better retrieval → more re-feeling of progress
→ more likely to open a mission again), softer than favouriting. So this is a *retention polish
on an already-loved surface* — which argues for restraint, not a query builder.

## 2. Goals / non-goals
- G1 Let the user narrow the diary to one lens at a time: a theme, or "with people".
- G2 Reuse the existing `Chip` + `role="radiogroup"` pattern (the Today location filter) — zero
  new interaction vocabulary.
- G3 Stay calm and client-only: no schema change, no Dexie, no export change, no network.
- N1 No free-text search, no date-range picker, no specific-mission filter (backlog).
- N2 No multi-select / AND logic — one active lens at a time.
- N3 No persisted filter state — the view resets on reload (deliberate; flag if wanted later).
- N4 Filters never alter `ReflectionCard`'s whole-diary tallies.

## 3. Data (reuse, no new storage)
Pure client filtering over `allKeepers()` joined to `MISSIONS` by `missionId` — the exact join
`reflection.ts` already does (`byId` map; a free-walk keeper with no matching mission falls
through the `!m` guard). A `Keeper` carries `missionId`; its `Mission` carries `themes` and
`involvesPeople`. New pure module `src/lib/diary-filter.ts` (theme derivation, threshold, filter).

## 4. Surfaces touched
- **Diary** (`src/components/diary-list.tsx`) — add a filter bar above the list (below
  `ReflectionCard`); apply the selected filter to the rendered rows. Rolls unaffected (filtering
  is per keeper/roll, not per frame).
- **New** `src/lib/diary-filter.ts` — `availableThemes`, `shouldShowFilterBar`, `filterKeepers`.

## 5. Acceptance criteria (EARS)
- FR-DF1 — While the diary has fewer than 6 keepers OR fewer than 2 distinct themes present, the
  system shall render no filter bar (the diary behaves exactly as today).
- FR-DF2 — While the threshold is met, the system shall render a single `role="radiogroup"` of
  chips: "All" (default-selected) + one chip per theme present in the user's keepers + a "With
  people" chip.
- FR-DF3 — When a theme chip is selected, the system shall show only keepers whose joined mission
  includes that theme, in reverse-chronological order.
- FR-DF4 — When "With people" is selected, the system shall show only keepers whose joined
  mission has `involvesPeople === true`.
- FR-DF5 — When a keeper has no matching mission (free walk), the system shall exclude it from
  every filter except "All" (mirrors `reflection.ts`'s `!m` guard — no crash, no phantom).
- FR-DF6 — When "All" is selected, the system shall show every keeper (identical to today).
- FR-DF7 — When a filter yields zero keepers, the system shall show a calm Ma-voice empty line
  and keep the filter bar visible so the user can return to "All".
- FR-DF8 — While a filter is active, the system shall leave `ReflectionCard`'s tallies unchanged.
- FR-DF9 — The filter selection shall be view-only, client-side, and non-persistent (resets on
  reload) — no localStorage, no schema, no export change.
- FR-DF10 — The chip filter shall be keyboard-operable and expose radio semantics (WCAG 2.1 AA),
  matching the Today location radiogroup.

## 6. Phasing
- **Phase 1 (this spec):** theme + with-people single-select chips, threshold-gated, derived
  theme options, Ma empty-state, tests.
- **Later:** tappable Reflection `topThemes` that apply the filter (retention tie-in); has-story
  + difficulty chips; free-text search; date range; persisted state.

## 7. Risks
- R1 Filter bar as clutter for new users — mitigated by FR-DF1 (threshold-gated visibility).
- R2 Empty results confusing the user — mitigated by derived theme chips (can't be empty) +
  FR-DF7 (calm empty line, bar stays so "All" is reachable).
