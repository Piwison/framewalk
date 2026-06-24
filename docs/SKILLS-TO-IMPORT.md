# Skills / MCP to import (first-party first, pin versions)

> Per the brief §9: install first-party, pin versions, and confirm source + version with
> the PM before each install. Treat any third-party skill as untrusted code (research
> found ~13% of marketplace skills had serious vulns, ~36% carried prompt injection).
> The audit-then-approve discipline applies here too — **don't install until Jason says go.**

## Product taste (the "good taste" requirement)

| Skill | Source | Why | Install |
|---|---|---|---|
| **Taste Skill** (`design-taste-frontend`) | `github.com/Leonxlnx/taste-skill` (~47k★) | Anti-slop: reads the brief, infers a real design direction, stops generic AI-looking UI. v2 current. | `npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"` |
| **frontend-design** (official) | Anthropic `anthropics/skills` | Forces distinctive, production-grade UI; first-party. | Anthropic skills marketplace |

> Note: `senlindesign/taste-skill` and `Dragoon0x/taste-skills` are alternative taste
> skills (reverse-engineer a site's tokens / visual-judgment heuristics). Evaluate, don't
> stack — overlapping skills can fight. Default to the first-party + the 47k★ one.

## Frontend quality

| Skill | Source | Why | Install |
|---|---|---|---|
| **Vercel agent-skills** | `vercel-labs/agent-skills` (~27.6k★) | `react-best-practices`, `web-design-guidelines`, `composition-patterns`. | `npx skills add vercel-labs/agent-skills` |
| **OneRedOak design-review** | `OneRedOak/claude-code-workflows` (~3.3k★) | `/design-review` + Playwright visual-review subagent (top-tier bar + WCAG AA+). | clone, copy `design-review/` into `.claude/` |
| **shadcn/ui MCP** | shadcn (official) | Accessible, ownable component primitives. | official MCP (free) — in `.mcp.json` |
| **Context7** (optional) | upstash | Live, version-correct library docs; fewer hallucinated APIs. | MCP / skill |

## Spec-driven development

| Tool | Source | Why | Install |
|---|---|---|---|
| **GitHub Spec Kit** | `github/spec-kit` (~111k★) | EARS acceptance criteria; `/speckit.specify → .plan → .tasks → .implement`. | `--integration claude` (v0.10+; **not** the old `--ai`) |

> **Do NOT install BMAD** (~49k★) — too heavy for a solo-maintained web app. Add only if a
> real multi-team workflow appears.

## Agent discipline (evaluated 2026-06-22 — PM approval required before install)

> Both are **third-party** → per the brief §9 and AGENTS.md ("Ask the PM first"),
> treat as untrusted code and **do not install until Jason says go.** Recommendation
> and rationale below; neither has been added to `skills-lock.json`.

| Skill | Source | Verdict | Why it fits FrameWalk | Install (only on approval) |
|---|---|---|---|---|
| **ponytail** (YAGNI / "laziest senior dev") | `github.com/DietrichGebert/ponytail` (~45k★, MIT) | **Recommend (full mode)** | Stops over-engineering at the first rung that works (exists? → stdlib → native platform → installed dep → one line) while *never* cutting validation, security, or a11y. Directly serves this repo's "lean, solo-maintained" mandate and the design system's native-primitive bias. Independently measured ~54% less code on a real agentic benchmark. | `/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`. Desktop: Customize → personal plugins → Add from repository. Set `PONYTAIL_DEFAULT_MODE=full`. |
| **grill-me** | `github.com/mattpocock/skills` (productivity/grill-me) | **Recommend as a gate, not an install** | One-prompt skill: interview down the decision tree, one question at a time, recommending an answer each. Best used as a *pre-code verification gate*. For harness work the higher-leverage form is an **independent-context subagent** that grills the plan and reports a delete-list — matches AGENTS.md's "never let an agent approve its own work" rule. | Tiny; copy the SKILL.md or just invoke the pattern via a `general-purpose` subagent (as done for the M1 plan on 2026-06-22). |

**How they were used in this build (2026-06-22):** ponytail's rung-ladder was applied
as discipline during the M1 scaffold (native `<input type="date/file">`, native
`<dialog>` over a custom Sheet, native `<textarea>` over a PromptField primitive, one
hand-written SW instead of a framework). grill-me was run as a subagent gate *before*
writing screen code; its delete-list and must-fix list shaped the final plan (see
`docs/framewalk/BUILD-NOTES.md`).

## ✅ PM decision — ponytail APPROVED (2026-06-23)

Jason (PM) approved installing **ponytail** (YAGNI / lazy-senior-dev discipline). It was
already applied informally throughout M1; this makes it an always-on guardrail.

**Install (desktop app — the agent cannot install plugins from a session):**
1. Customize → the **+** by personal plugins → **Create plugin and add marketplace** →
   **Add from repository** → enter `https://github.com/DietrichGebert/ponytail`.
2. Install **ponytail@ponytail**. Optionally set `PONYTAIL_DEFAULT_MODE=full`.
3. New sessions then load the YAGNI ruleset; `/ponytail-review` audits a diff for over-build.

Source pinned + reviewed: `github.com/DietrichGebert/ponytail` (MIT, ~45k★). Treated as
third-party — re-confirm the source before installing. grill-me remains used as an
independent-context subagent gate, not a standing install.
