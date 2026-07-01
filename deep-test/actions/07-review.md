# 07 — Review (interactive, HALT gate)

Walk the user through the problems one by one and build the fix todolist. This is the approval gate: no code changes happen in this action. Runs in the main loop.

## Inputs

- `report_path` (required) — the traced report from `trace-causes`.
- `problems` (required) — ranked problems with their root causes.

## Depends on

- `06-trace-causes`

## Process

1. Set the report `status` to `in-review` (via `qa-reporter`).
2. Present a one-line index of all problems (id, severity, title) so the user sees the whole picture first.
3. For **each** problem, in severity order, present a focused review:
   - the symptom + reproduction steps + evidence,
   - the proximate and underlying cause (`file:line`) from `trace-causes`,
   - a proposed fix direction (from the investigator's `fix_seeds`).
   Then ask the user: **add a fix for this problem to the todolist?** Accept yes / no / defer / edit-the-fix.
4. For each accepted problem, add a task to the native todolist (TodoWrite) AND to the report's **Todolist** section: `{ id, problem_id, fix_summary, target_files, status: pending }`. Keep the problem_id link so `retest` knows which criteria to re-run.
5. Do not proceed to `fix` until the user has reviewed every problem (or explicitly stops early). This action never edits code, runs `git` mutations, or migrates — the approval it collects is what unlocks `fix`.
6. Hand the accepted todolist to `fix`.

## Outputs

The report's **Todolist** section filled + the native todolist populated; `status: in-review`.

```json
{
  "todolist": [
    { "id": "T1", "problem_id": "P1", "fix_summary": "return 402 on gateway decline; null-check the decline branch", "target_files": ["server/payments/authorize.ts", "server/payments/gatewayClient.ts"], "status": "pending" }
  ],
  "deferred": ["P4"]
}
```

## Test

LLM assertion: every problem was presented to the user individually with its cause, each todolist item links back to a `problem_id` and names target files, and no code edit / `git` mutation occurred in this action. Producing a todolist without per-problem user approval, or editing code here, fails.
