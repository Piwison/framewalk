# AI weekly digest

> Compounding AI knowledge for the product builder. The newest dated section is prepended
> each week by the scheduled task `ai-product-builder-weekly-digest`. Read the top section
> before any planning work. Verify versions against code.claude.com/docs/changelog before
> acting — Claude Code ships almost daily.

## 2026-06-22 (seed)
- **Models in play:** Opus 4.8 (`claude-opus-4-8`), Sonnet 4.6 (`claude-sonnet-4-6`, default),
  Haiku 4.5 (`claude-haiku-4-5-20251001`). `fable` (Fable 5 / Mythos 5) access suspended
  2026-06-12 — do **not** assume it is available.
- **FrameWalk MVP is intentionally AI-free.** All AI features are parked in
  `docs/framewalk/BACKLOG.md` and only revisited after the core loop is loved. This digest
  tracks the landscape so that decision stays informed, not so AI gets bolted on early.
- **Free inference (for deferred mission-enrichment only):** evaluate current free LLM tiers
  behind a thin serverless route with strict rate-limit + a guaranteed curated-library
  fallback. Confirm provider terms before any use.
- **On-device cull-assist (deferred):** Transformers.js / WebGPU can flag likely keepers
  fully on-device at zero marginal cost — suggestions only, user always decides.
- **Action for next digest:** re-check model/pricing/tooling deltas; note anything that
  changes what is cheap or feasible for the parked AI items.
