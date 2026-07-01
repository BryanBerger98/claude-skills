# 08 — Fix

Ask for the go-ahead, then dispatch fixer agents to resolve the approved todolist. This is the only action allowed to edit code, and only after explicit approval.

## Inputs

- `todolist` (required) — the approved fix tasks from `review`.
- `report_path` (required) — to log the fixes.

## Depends on

- `07-review`

## Process

1. Confirm intent: ask the user **"run the fixer agents on these N tasks now?"** Do not start until they say yes. If they decline, stop and leave the todolist for later.
2. Set the report `status` to `fixing` (via `qa-reporter`).
3. For each task, plan then apply — reuse the shared agents:
   - Spawn **`planner`** (`subagent_type: planner`, model `opus`, at `../agents/planner.md`) to turn the task's `fix_summary` + causes into a precise, file-level step plan that respects the regressions the investigator flagged.
   - Spawn **`developer`** (`subagent_type: developer`, model `sonnet`, at `../agents/developer.md`) to apply that plan as code edits and run the project's checks.
4. Run independent tasks in parallel; when two tasks touch overlapping files, run them sequentially OR give each fixer its own git worktree (`isolation: worktree`) to avoid clobbering, then reconcile.
5. As each task lands, update its todolist `status` to `fixed` and append a **Fix log** entry (files touched + one-line what/why) via `qa-reporter`.
6. Hand the set of fixed `problem_id`s to `retest`.

## Outputs

Code edits applied for each approved task; the report's **Fix log** filled and todolist statuses advanced to `fixed`; `status: fixing`.

```json
{
  "fixed": [
    { "id": "T1", "problem_id": "P1", "files": ["server/payments/authorize.ts:47", "server/payments/gatewayClient.ts:22"], "note": "map gateway decline to a 402 result; null-check before deref" }
  ]
}
```

## Test

LLM assertion: no edit happened before the user's explicit go-ahead in this action; every `fixed` entry names the task, its `problem_id`, and the files changed; a Fix log entry exists per fixed task. Editing before approval, or a fixed task with no recorded files, fails.
