# Design spec — Richer diary filters (P0)

> Feature: FR-DF1..DF10 · Spec: `docs/framewalk/SPEC-diary-filters.md`
> Designer: Product Designer (間 Ma) · 2026-07-01 · Status: **awaiting design-direction sign-off (gate 2)**
> Downstream: `component-architect` (structure) → developer (`/build`) → `design-reviewer` + `a11y-checker`.

This is a *look-back polish*, not a query builder. The whole design brief is one word: **restraint.**
We add one calm row of chips and nothing else — same chips, same radiogroup, same vocabulary as the
Today location filter. Nobody should notice a "new feature"; they should just find their colour walks.

---

## 1. Flow & IA

### Where it lives
`src/app/diary/page.tsx` order is unchanged in the vertical rhythm:

```
h1  "Diary"            (font-serif text-3xl, mb-6)
ReflectionCard        (whole-diary tallies — NEVER touched by the filter)   [mb-8]
▸ Filter bar          ← NEW: sits here, below Reflection, above the list
DiaryList             (the rows, now filtered)
```

The filter bar is owned by the Diary list surface (it lives inside `diary-list.tsx`, which already
holds `rows`), so selecting a chip re-derives the rendered rows without any prop-drilling and without
re-rendering `ReflectionCard`. **FR-DF8 is structural:** `ReflectionCard` reads `allKeepers()`
independently and is a sibling above the filter — the filter state simply cannot reach it.

### States
- **Below threshold (FR-DF1):** no bar at all. Diary === today. (See §3.)
- **Loading:** the bar does **not** appear until `rows !== null`. The existing "Opening your diary…"
  line stands alone; we don't flash an empty chip row over a spinner.
- **Happy path:** bar renders with "All" selected; the full pile shows exactly as today (FR-DF6).
  User taps a theme chip → list narrows in place, reverse-chronological (FR-DF3/DF4).
- **Empty result (FR-DF7):** a filter yields zero → the bar **stays**, one Ma-voice line replaces the
  list. "All" is one tap away. (See §4.)
- **Empty diary:** unreachable — below threshold, so the existing "Your diary is empty — for now."
  card is untouched.

---

## 2. Layout & hierarchy

### Placement & spacing
A single flex-wrap row directly above `<ul>` of rows. It is quiet chrome — it must **recede** below
the Reflection card and never compete with the photos.

```
container spacing:  mb-8   between the chip row and the first keeper card   (--space-8, matches
                           the Today filter's `mb-8` and Reflection's `mb-8` — one rhythm)
row:                flex flex-wrap gap-2                                    (--space-2 between chips)
```

This is the **exact** container recipe from `today-mission.tsx` (`mb-8 flex flex-wrap gap-2`,
`role="radiogroup"`). Copy it verbatim — do not derive a new spacing.

### Wrapping on mobile (mobile-first)
`flex-wrap gap-2` wraps chips to a second/third line naturally on narrow screens; each chip is
`rounded-full px-3 py-1` (Chip default) so wrapped rows keep an even `--space-2` gutter both ways.
No horizontal scroll, no truncation, no "more" affordance — a walker with 6–40 keepers has a small,
finite set of themes (the mission catalogue has ~13 theme tags total; a user's own set is a subset),
so 3–7 chips is the realistic ceiling. Two calm lines on a phone is fine and on-brand.

### Wide-screen treatment
The Diary column is already prose-width-constrained by the page layout; the chip row inherits that
width and simply sits on one line. No special desktop layout — the same wrap rule covers both. We do
**not** right-align, add a "Filter:" label, or box the row; whitespace + the hairline of the cards
below is the only structure Ma allows.

### Hierarchy read
Ink weight, top → bottom: Reflection (serif, `text-ink`) → **chips (small, `text-sm`, muted until
selected)** → keeper photos (the only colour on the page). The selected chip is the single darkest
mark in the row (`bg-ink text-paper`), which is enough to say "you are looking at X" without a label.

---

## 3. Threshold behaviour (FR-DF1) — recommendation

**Recommendation: the bar is simply absent below threshold. No disabled state. Confirmed calm choice.**

- A disabled/greyed chip row would advertise a feature the user can't use yet and add visual noise to
  the exact moment (few keepers) when the diary should feel most spacious. That is the opposite of
  清亮無負擔.
- Absence is honest: with <6 keepers or <2 distinct themes there is nothing meaningful to narrow. The
  diary "grows up" into the filter quietly the first time it's useful — a small, unannounced reward.
- No empty-state, no tooltip, no "unlock" language. It just appears one day. That surprise-that-feels-
  inevitable is the Ma way.

Threshold logic (`shouldShowFilterBar`, ≥6 keepers **and** ≥2 distinct themes) lives in
`src/lib/diary-filter.ts` per the spec — design only asserts the *rendering* consequence: render
nothing.

---

## 4. Empty-state (FR-DF7)

When the active filter matches zero keepers, keep the bar, replace the list region with one calm line.
Reuse the existing empty container style from `diary-list.tsx` (the "diary is empty" card:
`rounded-lg border border-line bg-paper-raised p-8 text-center`) so the empty result reads as a
known, kind surface — not an error.

Copy (an invitation, never a dead-end — the recovery is implied, not commanded):

- **With people, none yet:**
  > *No frames with people yet — they'll gather here when you walk toward them.*
- **A theme with none in view** (rare, since theme chips are derived from present keepers, but possible
  after a `Remove`), generic fallback:
  > *Nothing under this thread just now.*

Single serif line (`font-serif text-lg text-ink`), optionally a muted second line only for the
people case. **No** "Clear filter" button, **no** "Back to All" link — the "All" chip is right there,
selected-state visible, one tap away. Adding a reset CTA would be redundant chrome. The bar staying
put *is* the recovery affordance (FR-DF7 satisfied by presence, not by a new control).

---

## 5. The chip set — labels, order, voice

### Composition (FR-DF2)
`[ All ]  [ theme… ]  [ theme… ]  …  [ With people ]`

- **"All"** — always first, default-selected. Not "Everything" / "Show all" — just **All** (matches
  the terse register of the Today chips: "Anywhere", "Street"). It is the calm home the user returns to.
- **Theme chips** — one per distinct theme present in the user's own keepers (derived, so never empty).
- **"With people"** — always last.

### Labelling derived themes (recommendation)
Raw theme tags are lowercase single tokens (`light`, `colour`, `people`, `composition`, `stillness`,
`shadow`, `night`, `texture`, `detail`, `line`, `portrait`, `hands`, `home`, `everyday`, `reflection`).

- **Capitalize the first letter for display** — `light → Light`, `colour → Colour` — matching the
  Title-case of every other chip in the app ("Street", "All", "With people"). Do this at the display
  layer only; the stored/compared value stays the raw lowercase token (so the join to `MISSIONS.themes`
  is untouched). British spellings (`colour`) are the author's catalogue voice — **keep them as
  authored**, do not normalise to US spelling.
- If a theme is multi-word in future, Title-case each word; today all tags are single tokens.

### Ordering (recommendation)
- **"All" pinned first, "With people" pinned last.** Non-negotiable anchors.
- **Themes between them, ordered by descending count** (how many of the user's keepers carry that
  theme), ties broken **alphabetically** for stability. This puts the walker's strongest thread
  nearest "All" — the first thing they'd reach for in look-back mode — and keeps order deterministic
  across renders (no reshuffle on selection). This mirrors the intent of Reflection's `topThemes`
  without showing any number.
- Do **not** order by recency (jittery) or by catalogue order (meaningless to the user).

### "With people" — separator? (recommendation)
**Reads fine inline. No separator.** "With people" is grammatically and visually a peer of the theme
chips — same shape, same radiogroup, one active lens at a time. A divider or a second row would imply
a second axis / AND-logic, which is explicitly a non-goal (N2). Pinning it **last** is enough
signalling that it's a different *kind* of lens; the single accent budget is spent on the mission
underline, not on decorating a filter. Keep the row homogeneous.

### Counts? (recommendation)
**No counts. Recommend against, firmly.** No `Light (7)`, no result tally, no "12 of 34". Per Ma
restraint and the "no streak guilt" rule, numbers turn a gentle look-back into a scoreboard and invite
comparison ("only 2 with people?"). The photos are the reward; the chip is just a doorway. The one
number that belongs on this page already lives in Reflection, framed kindly. Keep the chips wordless
of quantity.

---

## 6. Interaction & motion

### Interaction — reuse verbatim
Identical to the Today location filter, zero new vocabulary:
- Parent `<div role="radiogroup" aria-label="Filter diary">` wrapping `Chip`s.
- Each `Chip` gets `selected` + `onClick` → it renders as `role="radio" aria-checked`.
- Single-select: tapping a chip sets the one active lens; "All" clears back to the full pile.
- Selecting does **not** scroll, collapse rolls, or reset expanded-roll state beyond what re-filtering
  naturally implies (a filtered-out roll simply isn't rendered).

### Motion (§7 answer: essentially none)
- The **only** motion is the Chip's built-in `transition-colors duration-(--motion-fast)` as a chip
  moves between selected/unselected. That's inherited from the primitive — nothing to add.
- **No** list enter/exit animation, no height-collapse, no crossfade on filter. The list re-renders to
  the narrowed set instantly. Ma prefers a clean cut to a decorative reflow, and an animated list
  churn under a look-back read would feel busy.
- `prefers-reduced-motion` is already honored: `--motion-fast` collapses to `0ms` in tokens.css, so
  the chip color swap becomes instant. Since we add no other motion, **there is nothing new to guard.**

---

## 7. Tokens consumed

Everything derives from `src/styles/tokens.css`; the filter introduces **no new token** and **no
magic value** — it composes existing primitives.

| Surface | Token groups consumed |
|---|---|
| Filter row container | **Space:** `--space-2` (gap) · `--space-8` (mb below row). Via `flex flex-wrap gap-2 mb-8` — copied from `today-mission.tsx`. |
| Chip (unselected) | **Color:** `--ink-soft` (text), `--line` (border), transparent bg. **Type:** `--text-sm`. **Radius:** `--radius-full`. **Motion:** `--motion-fast`. (all inside `Chip`) |
| Chip (selected) | **Color:** `--ink` (bg), `--paper` (text via `text-paper`), `--ink` (border). (inside `Chip`) |
| Focus ring | **Color:** `--focus`. (Chip inherits the app's global focus-visible treatment — verify it's present.) |
| Empty-state panel | **Color:** `--paper-raised` (bg), `--line` (border), `--ink` / `--ink-soft` (text). **Space:** `p-8`. **Radius:** `--radius-lg` (`rounded-lg`). **Type:** `--font-serif`, `--text-lg`. — reuses the existing diary empty card. |

Accent (`--accent`) is deliberately **not** consumed — the film-amber mark stays reserved for the
mission underline/dot. A filter chip is chrome, not a highlight.

---

## 8. Accessibility intent (target for `a11y-checker`)

- **Roles:** row is `role="radiogroup"` with a group name; each chip is `role="radio"` +
  `aria-checked` (built into `Chip`). Exactly the Today pattern, already axe-clean there.
- **Group name:** `aria-label="Filter diary"` on the radiogroup (Today uses `"Location"`). Keep it a
  noun phrase; do not rely on a visible label (there is none, by design).
- **Per-chip label:** pass `ariaLabel` so screen-reader users hear intent, not just the token, matching
  Today's `"Show {x} missions"`. Recommended:
  - All → `"Show all keepers"`
  - Theme → `"Show keepers themed {Theme}"` (e.g. "Show keepers themed Light")
  - With people → `"Show keepers with people"`
- **Keyboard path:** `Tab` moves into the group to the selected chip; `Space`/`Enter` activates. This
  is native `<button role="radio">` behavior already shipped and E2E-covered for the Today radiogroup;
  arrow-key roving is a *nice-to-have* parity item — match whatever Today does today, do not diverge.
- **Selected contrast, light + dark:** selected chip is `--ink` on `--paper` text
  (`#211f18` bg / `#fbfaf5` text light; `#ece8dc` bg / `#1b1a15` text dark) — both well above 4.5:1.
  Unselected is `--ink-soft` text on `--paper` (verify ≥4.5:1 for the small `text-sm` label in both
  themes — this is the one contrast pair to check; it's the same pair Today already passes).
- **Result announcement:** the filter changes rendered content; the existing diary has no live region
  for the list, and adding one risks chatter. **Recommendation:** rely on the visible `aria-checked`
  state change (the chip announces "checked") and the reflowed list — do **not** add an `aria-live`
  narration of counts (consistent with §5 no-counts). If `a11y-checker` wants a whisper, a single
  polite `sr-only` line "Showing keepers themed Light." is acceptable, but design's default is silence.
- **Empty-state:** the Ma line is real text in the DOM where the list was; it's reachable in reading
  order immediately after the (still-present) radiogroup, so a screen-reader user who just selected
  "With people" lands on the explanation next. No `role="alert"` — it's an expected state, not an error.

---

## 9. Handoff notes / what NOT to build

- **Reuse `Chip` and the radiogroup container verbatim** — no new primitive, no restyle. If the chip
  row needs any wrapper, it's the same `<div className="mb-8 flex flex-wrap gap-2" role="radiogroup">`
  as Today.
- All theme derivation / ordering / threshold / filtering is **pure logic** in
  `src/lib/diary-filter.ts` (`availableThemes`, `shouldShowFilterBar`, `filterKeepers`) — the display
  Title-casing is the component's only presentational transform.
- No persistence, no URL param, no localStorage (FR-DF9) — view resets on reload, deliberately.
- No accent, no motion, no counts, no separator, no reset button, no "Filter:" label.

### Storybook stubs (optional visual baseline)
Suggest three stories for the future `DiaryFilterBar` (architect names it): **Default** (All selected,
5 chips wrapping to 2 lines at mobile width), **Theme selected** (one theme active), **Empty result**
(With people selected, empty-state line shown, bar still present) — light + dark. Stubs only; the
developer wires real data.

---

## Recommendation to Jason (gate 2)

Ship the restrained read: **one wrapping row of chips (All · themes by descending count · With people),
no counts, no separator, no accent, no motion beyond the Chip's own color swap; bar absent below
threshold; a single kind Ma line on empty.** It reuses the Today radiogroup with zero new vocabulary
and cannot touch the Reflection tallies. This is a look-back doorway, not a query builder — and it
should feel like the diary quietly grew the ability the first day it was useful.

**Approve this direction and I'll hand it to `component-architect`.**
