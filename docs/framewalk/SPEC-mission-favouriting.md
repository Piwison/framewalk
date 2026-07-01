# FrameWalk — Spec: Mission favouriting

> Status: approved for build (Jason, gate 1) · 2026-07-01 · v1.1 "it sticks"
> Owner: Jason (PM). Companion: `PRD.md`, `DESIGN-THINKING.md`, `PRODUCT-IDEAS.md`.
> Scope: **P0 recommended slice, `localStorage`-backed** (no Dexie migration, no sign-off gate).

## 1. Problem (design-thinking)
"Plateau Pete," three weeks in: a themed mission clicked once and he came back proud. The next
Saturday he wants *that feeling again*, taps "Another" fishing for it, doesn't find it, and
closes the app — a lost intentful walk, the exact thing the north star counts. Everything
shipped so far optimises the *first* walk and the *look-back* reward; nothing addresses the
**re-entry moment**.

**JTBD:** "When a mission lands for me and I want to head out again, help me mark it and get it
back easily, so I can start the walk I already know I'll enjoy instead of gambling on the
shuffle." Moves the north star (weekly intentful walks completed) by smoothing *repeat* entry.

## 2. Goals / non-goals
- G1 Let the user mark/unmark a mission as a favourite, persisted on-device.
- G2 Let Today gently **prefer** an eligible favourite for "mission of the day" and "Another".
- G3 Stay calm (a quiet bookmark — no count, badge, streak, or celebration) and fully on-device.
- N1 No dedicated favourites list/screen in this slice (extension A2).
- N2 No favourites in export / no Dexie table in this slice (extension A3 — would need sign-off).
- N3 No reordering, no AI.

## 3. Storage decision
A favourite is a small set of mission ids — a UI preference, not diary content the user would
mourn. Persist to **`localStorage`** under `framewalk.favourites` → `string[]` of mission ids.
No Dexie migration, no export change, no schema sign-off. No image bytes are ever involved.

## 4. Surfaces touched
- **Selection** (`src/lib/mission-select.ts`) — favourite-weighting slots in via the existing
  `SelectionContext` seam (optional `favouriteIds`), with the current fallback ladder intact.
- **Today** (`src/components/today-mission.tsx`, already a client component) — a calm favourite
  toggle on the mission, and it reads favourites into the selection context.
- **Favourites store** (new pure module, e.g. `src/lib/favourites.ts`) — read/toggle/has over
  `localStorage`, SSR-safe (guards `window`), corruption-safe (bad JSON → empty).

## 5. Acceptance criteria (EARS)
- FR-F1 — When the user activates the favourite control on a mission, the system shall persist
  that mission's id on-device (no network call) and reflect the marked state immediately.
- FR-F2 — When the user activates the control on an already-favourited mission, the system shall
  remove it and update the control state immediately.
- FR-F3 — While one or more favourited missions are eligible for the current time-of-day and
  selected location, the system shall prefer a favourite for the mission of the day and "Another".
- FR-F4 — While no favourited mission is eligible for the current context, the system shall fall
  back to the existing selection behaviour, never presenting an empty Today screen.
- FR-F5 — While the device is offline, the system shall still read, set, and apply favourites.
- FR-F6 — The favourite control shall expose an accessible name and pressed state to assistive
  tech, be keyboard-operable (WCAG 2.1 AA), and honour `prefers-reduced-motion`.
- FR-F7 — The system shall not transmit, upload, or copy off-device any favourite data or image.
- FR-F8 — When favourites data is absent or unreadable (first run / private mode), the system
  shall behave exactly as today with no error surfaced.

## 6. Phasing
- **Phase 1 (this spec):** favourites store, Today toggle, gentle selection preference, tests.
- **Later:** favourites view (A2, pairs with richer diary filters); Dexie-backed + exportable
  favourites (A3 — requires the schema-migration sign-off).

## 7. Risks
- R1 Selection could trap the user on a stale favourite — mitigated by FR-F4 (favourites are a
  *preference within* the eligible pool; the fallback ladder is never bypassed).
- R2 `localStorage` unavailable (private mode) — mitigated by FR-F8 (graceful no-op → today's
  behaviour).
