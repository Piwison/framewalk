---
description: Orchestrate a feature end-to-end through the team, pausing only at the 3 direction gates.
argument-hint: <idea>
---

Drive **$ARGUMENTS** through the full FrameWalk team workflow. You are the tech-lead/orchestrator
(see `ai-product-builder`). Run the stages in order, delegating each to its specialist, and
**pause only at the three direction gates** — otherwise keep moving autonomously.

1. **/pm** → `product-manager` researches and proposes a prioritized slate.
   ⛔ **GATE 1 (direction):** present priorities + recommendation; wait for Jason to choose.
2. **/design** → `product-designer` writes the design spec for the chosen slice.
   ⛔ **GATE 2 (design direction):** present the spec + recommendation; wait for sign-off.
3. **/architect** → `component-architect` plans the structure.
4. **/build** → implement on the main thread (you), per the architecture + rules.
5. **/qa** → `qa-engineer` authors/runs tests and drives the app.
6. **/review** → `code-reviewer` + `design-reviewer` + `a11y-checker` in parallel; clear all P0.
7. **/ship** → full gate, update docs/error-log/roadmap, commit, push.
   ⛔ **GATE 3 (ship):** confirm the ship with Jason; PR only if explicitly asked.

Guardrails: the writer of code never approves it; tokens are the single source of design values;
nothing is "done" until tsc + vitest + e2e + axe are green; new deps / schema migrations need
Jason's sign-off; never assume `fable`.
