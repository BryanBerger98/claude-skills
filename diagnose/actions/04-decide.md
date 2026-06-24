# 04 — Decide

Present the report and HALT. This is the single gate where execution is unlocked. No code changes until the user approves a solution in writing.

## Inputs

- `report_path` (required) — `.claude/docs/analysis/<slug>.md` from `report`.

## Depends on

- `03-report`

## Process

1. Present the report to the user: root cause, the four impact dimensions, and the proposed solutions with the recommendation. Link the file path.
2. **HALT.** Ask the user to choose an option (or request changes). Do not edit any code, run any mutating command, or proceed to `implement` until an explicit choice is given. Approval in another context does not count — it must be for this report.
3. If the user requests changes to the analysis, loop back to `investigate` or `report` as needed, then re-present.
4. On approval, edit the report's **## Decision** section: chosen option, rationale, `Approved by: <user>` and date.
5. Move the metadata `status` to `approved`. `decide` is the ONLY action permitted to set `approved`.
6. Hand the chosen option + report path to `implement`.

## Outputs

The report updated with a recorded decision and `status: approved`.

```text
## Decision
- Chosen option: A — single source of truth for session TTL
- Rationale: removes the config/middleware mismatch at the root; smallest blast radius
- Approved by: bryan on 2026-06-24

status: approved
```

## Test

LLM assertion: no file outside `.claude/docs/analysis/` was modified before this action recorded an explicit user approval; after approval, the report's **## Decision** section names a chosen option, a rationale, and an approver, and `status` reads `approved`. If any source/code file changed before approval, the gate failed.
