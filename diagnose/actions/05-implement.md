# 05 — Implement

Apply the approved fix, then record what was done in the report. Runs only after the `decide` gate has cleared.

## Inputs

- `chosen_option` (required) — the approved solution from `decide`.
- `report_path` (required) — `.claude/docs/analysis/<slug>.md`.

## Depends on

- `04-decide`

## Process

1. Refuse to start unless the report's `status` is `approved`. If it is anything else, return to `decide`.
2. **Plan** — spawn the **`planner`** subagent (Agent tool, `subagent_type: planner`, model `opus`). Pass the chosen option + the report's findings. It returns an ordered, file-level step plan (no edits yet) that respects the regressions and side effects listed in the report.
3. **Implement** — spawn the **`developer`** subagent (Agent tool, `subagent_type: developer`, model `sonnet`). Pass the plan. It applies the edits, adds/updates tests for the regressions the report flagged, and runs the project's checks.
4. Verify: run the reproduction steps from the report (or the relevant tests). If the fix doesn't hold, loop back to `planner` with what failed.
5. Edit the report's **## Implementation** section: the plan summary, files changed (each with a one-line what-and-why), verification result, and any follow-ups.
6. Move the metadata `status` to `implemented`.

## Outputs

Code changes applied + the report closed out.

```text
## Implementation
- Plan: single TTL source in config/session.ts; middleware reads it; cache invalidates on write
- Changes:
  - auth/middleware.ts: read TTL from config instead of hardcoded 5m
  - config/session.ts: stop mutating the shared object per-request
  - auth/__tests__/session-ttl.test.ts: regression test for the rate-limiter TTL
- Verification: repro steps pass; npm test green
- Follow-ups: none

status: implemented
```

## Test

LLM assertion: implementation began only with `status: approved`; the code edits match the option recorded in **## Decision** (not a different approach); a regression test or verification covering the report's flagged regressions was run; and the report's **## Implementation** section lists the changed files with rationale and `status` reads `implemented`.
