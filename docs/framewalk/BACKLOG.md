# FrameWalk — Backlog (deferred features)

> Things intentionally **out of scope for the MVP**, parked here so they're not lost.
> The MVP ships with **zero AI** (see `PRD.md`). AI is revisited only after the core loop —
> mission → cull → story → diary — is validated and genuinely loved. Last updated 2026-06-21.

## Deferred — AI features (post-MVP, opt-in, never on the critical path)

- **[AI] Mission enrichment via LLM.** Tailor a library mission to the user's recent diary
  themes / time / location, using a free LLM tier (e.g. Gemini Flash) behind a thin
  serverless route, with strict rate-limit and a guaranteed fallback to the curated library.
  *Was PRD FR-4 + decision D2; removed from MVP.*
  - Gate to build: missions proven valuable in the curated form first.
- **[AI] On-device keeper suggestions (cull assist).** Transformers.js / WebGPU model that
  flags likely keepers (sharpness, eyes-open, near-duplicates) — suggestions only, fully
  on-device, zero marginal cost. User always decides.
  - Gate: manual cull is shipped and the < 5-min target is met without it.
- **[AI] PoseCue portrait module.** Real-time pose / light / expression cues for portrait
  sessions. Larger surface; its own design-thinking + PRD when prioritized.

## Deferred — non-AI

- Optional end-to-end-encrypted sync + multi-device (v1 is local-only, no accounts).
- Print / zine export of a diary chapter.
- Opt-in small-group "walk together" prompts (explicitly no public feed).
- Localized approach-card etiquette per region/market.

## Principle that governs this list
AI is an *enhancement*, never the product. Nothing here may break the offline, private,
$0 core experience. If a deferred item would compromise that, it stays deferred.
