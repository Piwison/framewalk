# Design directions — the remaining slate

> Owner: Jason (PM). Author: product-designer. Date: 2026-07-01.
> Source of truth: `docs/framewalk/STRATEGY-remaining-roadmap.md` §3 (Briefs 1–4).
> Design language: 間 Ma — 清亮無負擔 (bright, unburdened, type-led). One accent, sparingly.
> No streak guilt. No decoration for its own sake.
>
> ⛔ **This is a direction gate (Gate 2).** Four items below, each ready to become a visual
> mockup. Each names the tokens it consumes, its a11y intent, and the open call for Jason.
> No production code here — hand to `component-architect` after sign-off.
>
> **Primitives reused, not reinvented:** `Card`, `Button` (primary/quiet/ghost via
> `action.ts`), `Chip`. The only *new* primitive proposed is a hidden file `<input>` wrapped
> in an existing action style (§1) — everything else is composition of what ships today.

---

## 1. Diary import — the Import card in Settings

**Where it lives.** A fifth `Card` in `settings-panel.tsx`, placed **directly below the
Export card** (Export → Import reads as "save a copy → bring one back"). Same `Card`
shell, same `<h2 className="font-medium text-ink">` + `text-ink-soft` body as its four
siblings — it must look like it always belonged there, not like a bolted-on utility.

**The affordance.** A file picker, styled as a **quiet** action (not primary — Export is the
everyday verb; Import is the rare recovery verb, so it recedes one step). Because a native
`<input type="file">` can't be styled, wrap it in a `<label>` carrying `quietAction` from
`action.ts` (the label-as-CTA pattern the codebase already uses for `primaryAction` on
`<Link>`). Accept `application/json,.json`. No `capture`, no `multiple`.

### The calm model: merge-by-id (locked recommendation)

Import is **additive and idempotent**. It never asks "overwrite?", never shows a destructive
warning, never has a checkbox. It reads the `version:2` payload Export already writes, and for
each keeper: if the `id` is new → add it; if the `id` already exists → skip it. Re-importing
the same file a second time changes nothing and says so. This is the whole reason there is no
scary dialog: **nothing is ever destroyed, so nothing needs confirming.** (Replace-all is a
future power-user option, explicitly *not* built now — see open decision.)

### States (idle → importing → success / declined)

The card body carries a single **status line** below the button that swaps copy per state.
It is an `aria-live="polite"` region so the outcome is announced without moving focus.

| State | Button label | Status line (serif-free, `text-ink-soft`) |
|---|---|---|
| **idle** | `Restore from a file` | *Bring a diary back from a file you exported. Merges gently — nothing is overwritten.* |
| **importing** | `Reading…` (disabled) | *Reading your file, all on this device.* |
| **success — new entries** | `Restore from a file` | **42 entries restored.** *Your diary is whole again.* |
| **success — nothing new** | `Restore from a file` | **Already up to date.** *Every walk in that file is already here.* |
| **partial** (some new, some already present) | `Restore from a file` | **18 entries restored, 24 already here.** |
| **declined — bad file** | `Restore from a file` | *That doesn't look like a FrameWalk diary file.* (in `text-danger`) |

Copy rules: the count is the **only** bold/emphasis in the line; the reassurance follows in
soft ink. No exclamation-mark celebration, no confetti — Ma marks success with a quiet full
stop. On success, the underlying Diary list simply *has more entries* next time it's opened;
we do **not** auto-navigate away from Settings (the user chose to be here).

### Motion

The status line cross-fades on change over `--motion-fast`; under `prefers-reduced-motion`
that token is `0ms`, so it swaps instantly. No spinner animation — "Reading…" is a text
state, not a spinner (restraint, and it degrades to nothing under reduced motion). File
reads are near-instant for a JSON diary; if a very large file ever warrants it, the disabled
"Reading…" label is sufficient feedback.

### Tokens consumed
- **Color:** `--paper-raised`, `--line` (Card); `--ink`, `--ink-soft` (heading/body/status);
  `--danger` (decline line only); `--focus` (input focus ring); quiet button uses
  `--line` / `--line-strong` (hover) / `--ink` via `quietAction`.
- **Space:** `--space-2`/`--space-4`/`--space-6` for the existing card rhythm (`space-y-6`
  between cards, `mt-2`/`mt-4` internal), matching Export exactly.
- **Type:** `--text-base` body, `--text-sm` for the storage-style faint note if reused;
  `--font-sans` throughout (this is UI, not prose).
- **Motion:** `--motion-fast` for the status cross-fade.

### A11y intent
- The visible `<label>` is programmatically tied to the hidden `<input type="file">` (label
  `htmlFor` / input `id`) so it's a real, keyboard-reachable, screen-reader-named control:
  name "Restore from a file", role `button`-equivalent via the native file input.
- Status region: `aria-live="polite"`, so "42 entries restored" / "Already up to date" /
  the decline line are all announced. The decline is **not** `role="alert"` (it's not an
  error the user must drop everything for — it's a calm "try another file").
- Focus stays on the label after import completes (we don't yank it); the live region does
  the reporting. Keyboard path: Tab to label → Enter/Space opens OS picker → outcome
  announced in place.
- Decline color (`--danger`) is never the *only* signal — the words carry the meaning.

### Open decision for Jason
- **Merge-by-id vs. offering Replace-all.** Recommendation: **merge-by-id only**, no replace
  in this slice (it's the non-destructive default and needs no warning UI). Confirm you don't
  want a "Replace my diary entirely" affordance yet. *(This is a data-write contract per the
  brief — your call before build.)*

---

## 2. Rolls Phase 2 — pick cover

**Where it lives.** Inside the expanded roll grid in `diary-list.tsx` (the `grid grid-cols-3
… sm:grid-cols-4` block that appears when a roll `isOpen`). Single-frame keepers **never**
show this — the control only exists when `frameCount > 1` and the grid is open. It appears
nowhere on the collapsed card; you opt into it by viewing all frames.

**The read we want:** choosing a cover should feel like *tapping the frame you like best*,
not entering an editor. So the affordance is **the frame itself is the target**, with a
small textual button under each frame — no toolbar, no pencil icon, no "edit mode" toggle,
no drag handles. Quiet enough to ignore, obvious enough to find.

### The design

Each frame in the open grid becomes a small stack: the square thumbnail, and beneath it a
single **ghost** button (`ghostAction`, `text-sm`, `px-0`) — matching the "View all frames"
/ "Remove" ghost buttons already on the card, so it inherits the card's existing quiet-verb
language.

- **Non-cover frame:** button reads `Make cover`. Tapping it persists `coverIndex = i`
  (a `keepers.update`) and the labels re-resolve.
- **Current cover frame:** shows **no button**. Instead a small static `Chip` (non-interactive
  variant) reading `Cover` sits under it — the one place the film-amber accent may appear, as
  the chip's selected mark, so the current cover is the single quietly-accented thing in the
  grid. This is how "which one is the cover" is answered at a glance: one frame wears a small
  amber `Cover` tag; the rest offer `Make cover`.

Visual indication of the current cover is thus **two-layered**: (1) the `Cover` chip label,
and (2) a hairline `--line-strong` ring on the cover thumbnail (so it's not color-only — see
a11y). No frame is ever *dimmed*; all frames stay at full presence (they're all keepers).

### Interaction & motion
- Tapping `Make cover` on frame *i*: `coverIndex` updates, the `Cover` chip moves to frame
  *i*, the old cover frame gains a `Make cover` button. The collapsed card's cover image
  (`row.urls[keeper.coverIndex]`) is now that frame the next time the roll is collapsed.
- The chip/ring move cross-fades over `--motion-fast` (→ `0ms` under reduced-motion). No
  slide, no scale, no "pop." A `aria-live="polite"` note ("Cover set to frame 3 of 5")
  confirms for screen readers.
- **No auto-collapse** after choosing — the user may want to try a different frame. They
  close the grid themselves with the existing "Hide frames" button.

### A11y intent
- Each `Make cover` is a real `<button>` (`Button variant="ghost"`), labelled
  `aria-label="Make frame 3 of 5 the cover"` (positional, unambiguous when frames have no
  alt text of their own).
- The current-cover frame is announced via a visually-hidden `"Current cover"` text plus the
  visible `Cover` chip; the amber is decorative reinforcement, never the sole signal (the
  `--line-strong` ring + the word "Cover" both carry it — passes non-color-reliance).
- Keyboard path: Tab reaches each `Make cover` in DOM order (frame 1 → n); Enter/Space sets
  it; the live region confirms. Focus stays on the pressed control (which becomes the new
  `Cover` frame and loses its button) — so after setting, focus moves to the *next* focusable
  control; the architect should place a focus-restore to the roll's "Hide frames" button or
  the newly-adjacent frame to avoid a focus-lost jump. **Flag this to `component-architect`.**

### Tokens consumed
- **Color:** `--accent` / `--accent-soft` (the single `Cover` chip mark, sparingly);
  `--ink-soft` → `--ink` (ghost button hover); `--line-strong` (cover ring); `--focus`
  (button focus ring).
- **Space:** `--space-1` (existing grid `gap-1`/`p-1`), `--space-2` under each frame for the
  button/chip row.
- **Type:** `--text-sm` (`Cover` chip + `Make cover` label), `--font-sans`.
- **Motion:** `--motion-fast` (chip/ring cross-fade).

### Open decision for Jason
- **Reorder = explicit stretch / likely no-go for this slice.** Recommendation: **ship
  cover-pick alone.** Reorder means drag-and-drop (touch DnD is a genuine a11y and taste
  cost — drag handles are exactly the "editor chrome" Ma avoids) or per-frame ↑/↓ buttons
  (clutters every frame). Neither earns its complexity for a diary you *revisit*, not *edit*.
  Recommendation: **no reorder now**; if you want it later, per-frame "Move earlier/later"
  ghost buttons behind a small "Arrange" disclosure, not drag. Confirm cover-only is the
  slice.

---

## 3. Landing page — the Ma voice

**What it is.** A static, type-led marketing route (its own page, e.g. `/welcome` or the
root when unvisited — architect's call) that is **NOT the app shell**: no `BottomNav`, no
`max-w-xl` app column, no bottom-nav padding. It's a single scroll on a phone, editorial
and quiet, ending in one door into the app. No signup, no email field, no analytics, no
third-party call (CSP already forbids it).

**The feel.** A page of a well-set book, not a SaaS hero. No stock gradient, no product
screenshot mockup-in-a-phone cliché, no logo cloud. The serif (`--font-serif`, Fraunces)
leads; whitespace does the work; the film-amber accent appears **exactly once** (a hairline
rule or the CTA underline). Left-aligned, ragged-right prose — not centered-everything.

### Vertical rhythm (mobile-first, one column)

Generous `--space-16`/`--space-24` between beats — the page should feel *unhurried*, the
opposite of a conversion funnel. Each beat is text-first; any imagery is a single restrained
photo, never a grid of screenshots.

**Above the fold** (must fit first viewport on mobile — brand mark, headline, sub, CTA):

- Small brand line, uppercase, `--tracking-label`, `--ink-faint`: `FrameWalk · 街拍日課`
  (reuses the exact Today masthead treatment for continuity).
- **Headline** (serif, `--text-3xl`, `--ink`, `--leading-tight`):
  > **A reason to go shoot.**
  > **The photos stay yours.**
- **Sub** (serif or sans, `--text-lg`, `--ink-soft`, `--leading-prose`):
  > *A quiet companion for a photo walk: a small mission to pull you outside, a gentle way to
  > approach a frame, a fast look-back, and a private diary of the walks worth keeping.*
- **Primary CTA** (`primaryAction`, into `/`): `Start today →`
- Under the CTA, a faint one-liner (`--text-sm`, `--ink-faint`): *No account. Nothing leaves
  your device. Free.*

**The three beats** (each: a short serif line + a soft sub; a hairline `--line` between):

1. **A reason to shoot** — *Open the app and it offers today's mission — a colour, a shape, a
   kind of light. Not a task. An invitation to go look.*
2. **A light cull** — *Back home, glance through what you shot and keep the few that matter.
   Fast, kind, no scoring, no shame in letting the rest go.*
3. **A diary that tells the story** — *Keepers become a diary of walks — a line of story, a
   roll of frames. Yours to revisit, yours to keep.*

**The promise line** (its own quiet block, centered, serif, `--text-xl`, `--ink`, with the
one accent as a short hairline above it):
> *No AI looking at your photos. No account, no server, no cost. It works offline, and your
> diary lives on your device — you can carry it out as a file whenever you like.*

**Foot** — repeat the single CTA `Start today →` and the `FrameWalk · 街拍日課` mark. That's
the end. No footer nav sprawl, no social links, no newsletter.

### Motion
- On load, beats may fade/rise in on scroll **over `--motion-base`**, staggered — but this is
  entirely optional and **fully gated by `prefers-reduced-motion`** (token → `0ms`, so it
  renders static). The page must be complete and readable with zero motion. No parallax, no
  autoplay.

### Tokens consumed
- **Color:** `--paper` (page ground — no raised cards needed here; it's prose on paper),
  `--ink` / `--ink-soft` / `--ink-faint` (headline / body / meta), `--accent` (one hairline
  or CTA underline, once), `--line` (beat dividers), `--on-ink` + `--ink` (primary CTA via
  `primaryAction`), `--focus`.
- **Space:** `--space-16`, `--space-24` (beat rhythm), `--space-6`/`--space-8` (intra-beat),
  a page inset of `--space-4` matching the app's `px-4`.
- **Type:** `--font-serif` leads (`--text-3xl` headline, `--text-xl` promise, `--text-lg`
  sub), `--tracking-label` on the brand mark, `--leading-tight` / `--leading-prose`.
- **Motion:** `--motion-base` (optional gated fade-in only).

### A11y intent
- One `<h1>` (the headline), beats as `<h2>`s, in a logical heading order; landmark `<main>`.
- The CTA is a real `<Link>` styled by `primaryAction` — keyboard-reachable, visible focus
  ring (`--focus`), accessible name "Start today". Every text block meets AA on `--paper`
  (`--ink`/`--ink-soft` are the same tokens already AA-verified in-app).
- The 街拍日課 CJK mark carries an `aria-label`/lang or a visually-hidden English gloss so
  it isn't read as noise by a screen reader.
- Honors reduced-motion by construction; nothing is motion-dependent to understand.

### Open decision for Jason
- **Route + entry.** Recommendation: a distinct `/welcome` route with the current `/` staying
  the app's Today — safest, no risk to returning users' muscle memory. Alternative (root shows
  landing on first-ever visit, then Today) adds first-visit-detection complexity for little
  gain. Confirm `/welcome` (or your preferred path) and whether the app's Today should carry a
  small link back to it.
- **Headline pick.** Two candidates provided ("A reason to go shoot / The photos stay yours").
  Confirm the exact wording — this is the ten-second promise.

---

## 4. Desktop treatment + diary thumbnail mat (polish)

> Framed explicitly as **polish**, not a north-star mover. The walk is a phone moment by
> design; the *one* real desktop moment is reviewing the diary on a laptop. This makes that
> moment feel considered instead of a phone column stranded in whitespace.

### 4a. Desktop treatment — widen only the diary

**The principle:** Today / Mission / Cull / Story **stay mobile-first and centered** at the
existing `max-w-xl` — one thumb, one column, unchanged. Only **`/diary` review** earns the
extra width, because it's the only browse-and-compare surface.

**How.** The shared `<main>` in `layout.tsx` keeps `max-w-xl` as the default. The Diary route
opts into a wider measure via a route-level wrapper (the architect decides: a per-route max
override, or the diary page setting its own container). Recommended treatment:

- **Reading width, not sprawl.** On wide screens the diary column grows to a calm
  `max-w-3xl`-equivalent measure — enough to breathe, never edge-to-edge. Prose (the serif
  story line) stays within a comfortable ~65-character measure even inside a wider card, so
  reading doesn't degrade.
- **The single-cover cards stay a single column** (a big cover photo wants width, not
  crowding). The **filter chip bar** and card rhythm are unchanged.
- Optional, only if it stays calm: at the widest breakpoint the *timeline* could become **two
  columns** of cards. Recommendation: **hold at a single wider column for this slice** — two
  columns risks a Pinterest/masonry feeling that fights Ma restraint. Note it as a future
  option, don't build it now.
- **Nothing else moves.** `BottomNav` still centers on `max-w-xl`; the walk screens are
  untouched, verified structurally (the strategy's "without changing the walk-time screens").

**New token proposed:** `--measure-diary` (the wide diary max-width) added to `tokens.css`,
so the widening is a named token, not a magic Tailwind class. Reference candidate value:
align to an existing `max-w` step (~48rem / `3xl`) — architect sets the exact rem, but it
**lives in `tokens.css`**.

### 4b. Diary thumbnail mat — a quiet frame around the work

Today the diary `<img>` sits flush to the card edge (`overflow-hidden` card, image bleeds to
the border). Ma wants the photo to sit *in* a frame with a breath of paper around it — like a
mounted print, not a full-bleed banner.

**The design:** a consistent **mat/inset** of paper between the photo and the card's hairline
edge. The cover image gets a small `--paper` (or `--paper-raised`) mat on all sides; the
expanded-grid frames keep their tight `gap-1` (a contact sheet *should* be dense — the mat is
for the *presented cover*, not the contact grid). The photo itself may carry an inner
`--line` hairline so the mat reads as an intentional frame, not just padding.

**New token proposed:** `--mat-diary` (the inset size around a presented diary photo), added
to `tokens.css` — reference candidate `--space-2` or `--space-3`. Naming it as a token means
the mat is tunable in one place and can't drift per-card.

### Motion
None. This is layout + inset; nothing animates. (Trivially reduced-motion-safe.)

### Tokens consumed
- **Existing:** `--paper` / `--paper-raised` (mat ground), `--line` / `--line-strong` (card +
  inner frame hairline), `--radius-lg` (card), the full `--space-*` rhythm, `--ink*` for text.
- **New (proposed, both in `tokens.css`, no magic values):**
  - `--measure-diary` — wide-screen diary column max-width.
  - `--mat-diary` — inset between a presented diary photo and its card edge.

### A11y intent
- Pure presentation — no new roles, no new controls, no focus changes. Existing `alt` text on
  images is unchanged. Widening must not break reflow/zoom: at 200% zoom and narrow viewports
  the diary falls back to the mobile single column (the wide measure is a `min-width`
  enhancement only). Contrast is unaffected (same tokens).
- Verify the wider measure still passes AA line-length/readability and that focus order in the
  filter bar and cards is unchanged.

### Open decisions for Jason
- **Two token names OK to add?** `--measure-diary` + `--mat-diary` are the only two new values.
  Adding tokens touches the design-token system → your sign-off per AGENTS.md. Recommendation:
  approve both (they replace what would otherwise be magic values).
- **Single wide column vs. two-column timeline at the widest breakpoint.** Recommendation:
  **single wide column now**, two-column parked. Confirm.

---

## Summary for the prototype

| # | Item | New primitive? | New tokens? | The one decision |
|---|---|---|---|---|
| 1 | Diary import | Hidden file input in a `quietAction` label (composition only) | none | Merge-by-id only (no Replace-all) |
| 2 | Rolls pick cover | none (`Button` ghost + static `Chip`) | none | Cover-pick only; reorder parked |
| 3 | Landing page | none (prose + `primaryAction`) | none | Route (`/welcome`?) + headline wording |
| 4 | Desktop + mat | none | `--measure-diary`, `--mat-diary` | Approve 2 tokens; single wide column |

**Recommendation to Jason:** approve all four directions for the interactive prototype.
Items 1–3 introduce **zero new tokens and zero new primitives** (pure composition of
`Card`/`Button`/`Chip`/`action.ts` + prose). Item 4 adds exactly **two named tokens** in
`tokens.css`, replacing what would otherwise be magic values — the only design-system change,
and it's polish. Nothing here relaxes the CSP, adds a network path, or introduces streak/guilt
mechanics.
