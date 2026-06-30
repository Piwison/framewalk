---
description: Run the full gate, update docs, commit, and push the working branch (gate 3).
argument-hint: <feature>
---

Ship **$ARGUMENTS** — this is gate 3 (Jason approves the ship).

1. **Full gate green:** `npx tsc --noEmit`, `npx vitest run`, `npm run build`, and the e2e + axe
   suite. If anything is red, stop and report — do not ship.
2. **Update the record:** append a dated entry to the CLAUDE.md error log (symptom · root cause ·
   guardrail), and mark the item shipped in `docs/framewalk/ROADMAP.md` (and the relevant
   `SPEC-*.md` status).
3. **Commit small and honest** with a descriptive message; end with the required
   `Co-Authored-By` / `Claude-Session` trailers. Do not put the model identifier in the commit.
4. **Push** to the working branch: `git push -u origin <branch>` (retry with backoff on network
   errors). **Do NOT open a PR unless Jason explicitly asks.**

Report what shipped, the gate results, and the pushed commit.
