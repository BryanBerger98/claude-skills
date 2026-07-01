# 09 — Retest

Re-run only the tests tied to the problems that were just fixed, update the report, and decide whether to loop.

## Inputs

- `fixed` (required) — the fixed tasks (with `problem_id`) from `fix`.
- `behavior_spec` (required) — from `understand`, to find the criteria to re-run.
- `app_access` (required) — from `intake`.

## Depends on

- `08-fix`

## Process

1. Build the retest set: for each fixed `problem_id`, collect the acceptance criteria it was linked to (via the problem's `criterion`), plus any criteria that share a target file with the fix (regression guard). Restart or reload the app if the fix requires it, and re-verify reachability.
2. Re-dispatch **only** the relevant QA agents — `qa-ui` and/or `qa-api` (model `opus`) — with that criteria subset and the same `app_access` and schema. This is a scoped repeat of `run-tests`, not a full sweep.
3. For each retested problem, record the verdict: `resolved` (criterion now passes, no new problem), `partial` (improved but a residual problem remains), or `regressed` (a new problem appeared). Require fresh evidence for each verdict.
4. Update the report via `qa-reporter`: fill the **Retest results** section, flip resolved problems' status, and add any newly surfaced problems to the ranked list. Set report `status` to `retested`.
5. Loop decision (owned by the router): if any problem is `partial`, `regressed`, or newly surfaced, return to `07-review` with the updated problem set. If all targeted problems are `resolved` and none are new, set `status: done` and finish with a summary.

## Outputs

The report's **Retest results** section filled; resolved problems closed, residual/new problems re-queued; `status: retested` or `done`.

```json
{
  "retest": [
    { "problem_id": "P1", "criteria": ["AC-2"], "verdict": "resolved", "evidence": "POST /api/payments declined card now returns 402 + error code E_DECLINED" }
  ],
  "loop_back": false
}
```

## Test

LLM assertion: only criteria tied to fixed problems (plus shared-file regressions) were re-run — not the full spec; every retested problem has a verdict in {resolved, partial, regressed} with fresh evidence; `loop_back` is true iff any non-resolved or new problem exists. Re-running the whole spec, or closing a problem without evidence, fails.
