# FrameWalk — Product Ideas

> Owned by `product-manager`. The running list of *what we might build* and why, anchored on
> the north star: **weekly intentful walks completed** (mission opened → ≥1 keeper saved).
> Each idea names one specific user and the smallest valuable slice. Thin model-wrappers and
> feature-for-feature's-sake get killed here, not shipped. AI stays deferred (see `BACKLOG.md`)
> until the core loop is loved.

## How to use this file
- The PM adds candidates with a JTBD frame, the user, the slice, and how it moves the north
  star. Jason picks priorities (gate 1); chosen items graduate to `ROADMAP.md` + a `SPEC-*.md`.
- Status tags: 🌱 idea · 🔎 researching · ✅ promoted to roadmap · 🧊 parked to backlog.

## Candidates

### ✅ Mission favouriting — promoted (2026-07-01, gate 1)
- **User / JTBD:** "Plateau Pete" wants to head out on a mission that already worked — "When a
  mission lands for me, let me mark it so it comes back, so I'm more likely to head out again."
- **Slice (P0):** a calm favourite toggle on the mission + `missionOfTheDay`/"Another" gently
  prefer eligible favourites. **`localStorage`-backed** (no Dexie migration, no sign-off).
- **North star:** smooths the *re-entry moment* → drives repeat intentful walks.
- **Spec:** `docs/framewalk/SPEC-mission-favouriting.md` (FR-F1..F8). Extensions parked:
  favourites view (A2), Dexie-backed + exportable (A3, needs sign-off).

### 🌱 Richer diary filters
- **User / JTBD:** A walker with a growing diary wants to revisit a thread — "let me filter my
  diary by mission, theme, with-people, or date, so the reward of looking back stays easy."
- **Slice:** client-only filters over existing keepers (join to `MISSIONS` by `missionId`).
- **North star:** strengthens the reward loop that brings people back.

> Add new ideas above this line. Keep each to a few lines; the depth lives in the eventual
> `SPEC-<feature>.md`.
