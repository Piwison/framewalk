---
description: Independent sign-off — run code, design, and a11y reviewers in parallel on the diff.
argument-hint: <feature>
---

Run an **independent-context** review of the changes for **$ARGUMENTS**. The writer of the code
(the main thread) must NOT be the approver.

Spawn these three subagents in parallel (single message, multiple Agent calls):
- `code-reviewer` — correctness, edge cases, data-loss/error handling, TS `strict`/no-`any`,
  security/privacy (no secrets, no off-device paths, CSP intact), tokens single-source, tests
  assert behaviour. Verdict: APPROVE or REQUEST CHANGES with file:line + P0/P1/P2.
- `design-reviewer` — rendered screens (light + dark, mobile + desktop): token compliance and
  anti-slop. Punch list by severity.
- `a11y-checker` — WCAG 2.1 AA: keyboard path, focus moves, `aria-live`, contrast, alt text,
  reduced-motion.

Aggregate into one ranked punch list (P0 blocks ship). Apply P0/P1 fixes, then re-run the
relevant reviewer if a fix was non-trivial. Do not call it approved while any P0 stands.
