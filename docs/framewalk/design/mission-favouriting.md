# Design spec — Mission favouriting (P0 slice)

> Status: for design-direction sign-off (⛔ gate 2). Owner: Product Designer.
> Companion: `SPEC-mission-favouriting.md` (FR-F1..F8), `DESIGN-THINKING.md`, `tokens.css`.
> Scope: the **affordance + interaction + a11y** for the Today favourite toggle. No production
> code here — hands to `component-architect` → developer → reviewers.

Design language: 間 Ma, 清亮無負擔 — bright, unburdened, type-led. One accent (`--accent`, the
film-amber MARK), used sparingly. No streak guilt, no count, no celebration. This feature is a
**quiet bookmark**, not a badge.

---

## 0. Recommendation up front (decision-ready)

- **Affordance:** a single quiet **bookmark** glyph-button — hairline outline when unmarked,
  filled with the amber accent when marked. Bookmark over star: a star reads as *rating/quality*
  ("this mission is good"); a bookmark reads as *"keep this for me,"* which is exactly the JTBD
  (re-entry, "get that walk back"). Restraint over decoration.
- **Placement:** top-right of the mission `<article>`, on the metadata row, opposite the
  difficulty/people labels. It rides above the serif title so it never competes with the prose.
- **Semantics:** a real toggle button using **`aria-pressed`** (not two swapped labels, not a
  checkbox). One stable accessible name; pressed state carries the marked/unmarked meaning.
- **Motion:** fill cross-fades on `--motion-fast`; **no** scale-pop, no burst, no confetti.
  Collapses to an instant swap under `prefers-reduced-motion` (tokens already do this).
- **Feedback:** the visual fill *is* the feedback. **No `aria-live` announcement** — the button's
  own `aria-pressed` change is announced by SR on activation; a live region would be redundant
  chatter and breaks the calm.
- **Detail page toggle:** **OUT of P0.** Today-only keeps the slice lean and avoids a new
  `'use client'` island. Rationale in §6.

---

## 1. The affordance

### Flow & IA
The toggle lives inside the existing Today mission `<article>` (`today-mission.tsx`). No new
screen, no route, no modal. The three states already in that component are unchanged:

- **Loading** ("Finding a mission for right now…") — no toggle rendered (there is no mission
  yet to mark). Consistent with today.
- **Happy path** (a mission is shown) — the toggle renders in the metadata row.
- **Error / private mode** (FR-F8) — favourites store no-ops; the toggle still renders and is
  operable, it simply won't persist. It never surfaces an error, never disappears. (An optional
  future nicety — dimming when storage is unavailable — is explicitly out of this slice.)

### Placement within the article
The metadata row (`today-mission.tsx` line 114) becomes a two-part row:

```
┌ article ─────────────────────────────────────────────┐
│  EASY · WITH PEOPLE                        [ bookmark ]│  ← metadata row, space-between
│                                                        │
│  The decisive gesture, waist-level          (serif h2) │
│  ──                                          (accent MARK)
│  Find one honest moment between two…        (serif p)  │
│                                                        │
│  [ I'm going ]   Another                     (actions) │
└────────────────────────────────────────────────────────┘
```

- The metadata row switches from `flex flex-wrap gap-3` to `flex items-center justify-between`,
  so the uppercase labels stay left and the bookmark sits far-right, vertically centred to the
  label cap-height.
- The bookmark is a **glyph-only** target (label is SR-only) so it stays quiet — it must not read
  as a third CTA competing with "I'm going" / "Another." It is deliberately smaller and lighter
  than the primary actions.
- Target size: a **44×44px** hit area (WCAG 2.5.5) with a ~20px glyph centred inside; the extra
  padding is invisible (transparent), so the *visual* weight stays small while the *touch* target
  is honest. On the desktop/wide layout the same right-aligned position holds — the article is a
  reading column, so nothing changes but the surrounding whitespace.

### Marked vs unmarked visual states
| State | Glyph | Fill | Stroke | Accessible name |
|---|---|---|---|---|
| **Unmarked** | bookmark outline | none (transparent) | `--ink-faint` hairline (matches the metadata label ink) | "Save this mission" |
| **Marked** | bookmark solid | `--accent` | none / same amber | "Saved — tap to remove" |
| **Hover (unmarked)** | outline | none | stroke → `--ink-soft` (gentle darken) | — |
| **Hover (marked)** | solid | `--accent`, `hover:opacity-90` (matches CTA hover language) | — | — |
| **Focus-visible** | inherits the global `:focus-visible` ring (2px `--focus`, offset 2px) | | | |

The unmarked stroke deliberately matches `--ink-faint` — the *same* ink as the difficulty label
beside it — so an unmarked bookmark recedes into the metadata line and reads as chrome, not a
call to action. Only when marked does it earn the accent.

### Why it's anti-slop
- **No count / no number / no badge** — the spec's G3. Marked is a filled glyph, nothing else.
- **No celebration** — no confetti, no scale-pop, no toast, no sound. The fill cross-fade is the
  entire reward. This respects design principle 3 (calm over gamified) and 2 (no streak guilt).
- **One accent, used as a MARK** — the amber only ever appears as the *filled* bookmark, echoing
  the existing accent underline MARK under the title. It is not a surface, gradient, or glow.
- Reuses existing motion/ink/accent tokens and the global focus ring — nothing invented.

---

## 2. Interaction & motion

- **Activation:** click / Enter / Space toggles `aria-pressed` and swaps outline↔solid. The store
  write (`localStorage`) is synchronous and best-effort; the visual reflects the new state
  immediately (FR-F1/F2), independent of whether persistence succeeded (FR-F8).
- **Feedback = the fill.** The bookmark cross-fades between outline and solid over `--motion-fast`
  (140ms, `--ease`). Only the fill/stroke colour transitions (`transition-colors`), matching the
  Chip and CTA language already in the codebase. **No transform, no opacity burst on the glyph.**
- **`aria-live`:** none. The toggle button's `aria-pressed` state change is self-announcing to
  assistive tech on activation; adding a live region would double-announce and add noise the Ma
  voice rejects. (Contrast: the *mission title* live region on line 106 stays as-is — it announces
  when the *mission* changes, a different event.)
- **Reduced motion:** `--motion-fast` collapses to `0ms` under `prefers-reduced-motion: reduce`
  (already wired in `tokens.css` lines 108–113). The outline→solid swap becomes instant. No
  motion-specific code path is needed — consuming the token gives us this for free.
- **Selection coupling (visible-but-quiet):** because a favourite is now *preferred* for "mission
  of the day" and "Another" (FR-F3), the user may notice their saved mission returns more often.
  That is the intended calm reward — no UI announces it. The fallback ladder (FR-F4) guarantees
  Today is never empty, so the toggle never strands the user.

---

## 3. Voice & microcopy (Ma voice — an invitation, never an order)

- **Accessible name, unmarked:** `Save this mission`
- **Accessible name, marked:** `Saved — tap to remove`

  (These are the accessible names on a single `aria-pressed` toggle. "Save / Saved" is calmer and
  more honest to the JTBD than "Favourite/Unfavourite," which sounds like a rating verb, or
  "Bookmark," which is jargon. It's a plain invitation: *keep this for later.*)

- **Visible words:** **none.** The bookmark is glyph-only; adding a "Saved" text label would turn
  a quiet mark into an announcement. If usability testing later shows the glyph is unclear, the
  minimal escalation is a `title`/tooltip echoing the accessible name — not visible body text.
- **No toast, no snackbar, no "Added to favourites!" confirmation.** Explicitly rejected.

---

## 4. Tokens consumed

All from `src/styles/tokens.css` — no magic values.

| Group | Tokens | Used for |
|---|---|---|
| **Color — accent** | `--accent`, (hover `opacity-90`) | the marked bookmark fill (the MARK) |
| **Color — ink** | `--ink-faint` (unmarked stroke, matches metadata label), `--ink-soft` (unmarked hover stroke) | the receding, chrome-like unmarked state |
| **Color — focus** | `--focus` (via global `:focus-visible`) | keyboard focus ring |
| **Space** | `--space-2` / `--space-3` (invisible padding to reach the 44px target), row uses existing `gap`/`justify-between` | hit-area padding, row layout |
| **Type** | none of its own — it sits on the existing metadata row (`text-xs`, `--tracking-label`, uppercase); glyph is an inline SVG sized in `space` units | alignment to the label cap-height |
| **Radius** | `--radius-full` (round 44px hit target, matching Chip/Button roundness) | the focus-ring shape / hover area |
| **Motion** | `--motion-fast`, `--ease` (both collapse to 0ms under reduced-motion) | outline↔solid colour cross-fade |

No new tokens are required. If the developer needs the glyph as a component, prefer an inline SVG
(currentColor-driven) over a new dependency; icon colour is then just `text-accent` /
`text-ink-faint`, keeping tokens as the source.

---

## 5. Accessibility intent (target for `a11y-checker`)

- **Element:** a native `<button type="button">` with **`aria-pressed={marked}`**. This is the
  correct pattern for a binary on/off toggle whose label is stable. (Chosen over a checkbox — this
  is an action affordance in a content row, not a form field — and over swapping two buttons.)
- **Accessible name:** provided via `aria-label` (glyph-only button). Unmarked: "Save this
  mission." Marked: "Saved — tap to remove." The decorative SVG is `aria-hidden="true"`.
- **Toggle semantics:** state is conveyed by `aria-pressed`, not by colour alone (WCAG 1.4.1 — the
  outline vs solid *shape* also differs, so colour is never the sole signal).
- **Keyboard path:** naturally in tab order after the location radiogroup and within the article,
  before the "I'm going" / "Another" actions. Operable with Enter and Space. Visible focus via the
  global 2px `--focus` ring at 2px offset — verify it clears the surrounding labels.
- **Hit target:** ≥ 44×44px (WCAG 2.5.5 / 2.5.8).
- **Contrast (verify both themes):**
  - Unmarked stroke `--ink-faint` on `--paper` — light `#777262` on `#fbfaf5`, dark `#9a9485` on
    `#1b1a15`. This is a non-text UI-component graphic → WCAG 1.4.11 (≥ 3:1). Confirm the hairline
    stroke meets 3:1; if a 1px stroke reads thin, `a11y-checker`/design-reviewer should flag
    bumping the unmarked stroke to `--ink-soft` for the resting state.
  - Marked fill `--accent` on `--paper` — light `#c2702f`, dark `#d98a52`. Confirm ≥ 3:1 as a
    graphical control against the paper.
  - Focus ring `--focus` — light `#2f6f8f`, dark `#6db3d4` — verify ≥ 3:1 against `--paper`.
- **No live-region spam:** confirmed absent by design (§2).
- **Screen-reader pass (the human gate):** activate → hear the pressed state flip; navigate away
  and back → the marked state persists and is announced correctly on re-focus.

---

## 6. Detail-page toggle — IN or OUT of P0?

**Recommendation: OUT of P0.** Today-only.

- The JTBD is the **re-entry moment on Today** ("I tapped Another fishing for that mission").
  Today is where discovery and re-shuffle happen, so that's where the mark earns its keep and
  where the FR-F3 selection preference is felt. The detail page (`mission/[id]/page.tsx`) is a
  read-and-go screen reached *after* the user already chose to go.
- The detail page is a **Server Component**; adding a toggle there means a new `'use client'`
  island purely to read/write `localStorage` — added surface, a second store-hydration point, and
  a second thing for reviewers to verify, for a moment where marking is lower-value.
- Leaner slice = fewer states to get right. The spec's Phase 1 already scopes "Today toggle"; the
  detail toggle is a natural, low-risk fast-follow once the store + component pattern are proven.

If Jason wants it in P0 anyway, the design is a direct reuse: the same glyph-button island placed
in the detail metadata row (`page.tsx` lines 29–32, beside the difficulty/people Chips), same
tokens, same a11y contract. It's a copy-paste of the affordance, not a redesign — so deferring it
costs nothing to add later.

---

## 7. Hand-off notes

- Reuses: the global `:focus-visible` ring, the accent MARK language (title underline), the
  `transition-colors duration-(--motion-fast)` pattern from `Chip`/`action.ts`. No new primitive
  is strictly required — but if the team wants one, a small `FavouriteToggle` in
  `src/components/ui/` (glyph SVG + `aria-pressed` + tokens) is the right home, so the affordance
  can be lifted to the detail page later without drift. Do **not** fold it into `Chip` (radio
  semantics) or `Button`/`action.ts` (CTA semantics) — this is a distinct toggle role.
- Storybook baseline (optional): `FavouriteToggle` stories — Unmarked, Marked, Hover, Focus, and
  a reduced-motion snapshot; light + dark — as the visual baseline for `design-reviewer`.
- Downstream: `component-architect` structures the toggle + the store read/hydration seam;
  developer implements against `favourites.ts`; `design-reviewer` + `a11y-checker` verify against
  §5.
```
