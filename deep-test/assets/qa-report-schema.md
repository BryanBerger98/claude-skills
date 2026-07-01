# QA report schema

Every QA agent (`qa-ui`, `qa-api`) MUST return exactly one JSON object of this shape as its final message. It is consumed as data by `run-tests` / `retest` and aggregated by `qa-reporter`. No prose around it.

## Schema

```json
{
  "area": "string — short slug for the tested slice, e.g. 'payment-authorization-api'",
  "family": "ui | api",
  "scores": {
    "coherence": "integer 0-5 — does behavior match the spec + UI/API/data-model contract",
    "reliability": "integer 0-5 — does it produce correct results across inputs",
    "stability": "integer 0-5 — is it consistent across retries (no flakiness)"
  },
  "coverage": ["AC-1", "AC-2"],
  "untestable": [{ "criterion": "AC-9", "reason": "feature not present in the running app" }],
  "problems": [
    {
      "id": "P1",
      "criterion": "AC-2",
      "title": "short problem statement",
      "severity": "low | medium | high | critical",
      "type": "error | bug | instability | incoherence",
      "steps": ["ordered reproduction steps, or the exact curl command(s)"],
      "expected": "what the acceptance criterion promises",
      "actual": "what actually happened",
      "evidence": "HTTP status + body excerpt, console/network error, or accessibility-tree snapshot excerpt"
    }
  ]
}
```

## Rules

- `errors` and `bugs` counts are NOT in this object — `qa-reporter` derives them from `problems[].type` (`error` → errors; `bug`/`incoherence`/`instability` → bugs) so the two never drift.
- Every criterion in the agent's assigned batch appears in `coverage` OR `untestable` — never silently dropped.
- Every `problems[]` entry MUST have non-empty `steps` and `evidence`. An entry without evidence is invalid and will be rejected by `run-tests`.
- `id` is the agent-local problem id; `qa-reporter` reassigns a global `P<n>` after dedup + ranking. Keep `criterion` accurate — it is how `retest` finds what to re-run.
- Report observations only. Do NOT include root-cause claims — `trace-causes` owns that.

## Type → axis mapping

| `type`        | meaning                                             | feeds        |
| ------------- | --------------------------------------------------- | ------------ |
| `error`       | crash, exception, 5xx, failed request               | errors count |
| `bug`         | wrong-but-not-crashing behavior (wrong status/shape)| bugs count   |
| `instability` | non-deterministic / flaky across retries            | stability ↓  |
| `incoherence` | contradicts the spec, the UI, or the data model     | coherence ↓  |
