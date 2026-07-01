# 03 — Understand the business logic

Turn the code surface into a **testable behavior spec**: what each feature is supposed to do, the invariants it must hold, its edge cases, and the user/API flows QA will exercise. Read-only.

## Inputs

- `surface_map` (required) — the structured map from `map`.
- `scoped_features` (required) — from `intake`.

## Depends on

- `02-map`

## Process

1. Spawn the **`spec-analyst`** subagent (Agent tool, `subagent_type: spec-analyst`, model `opus`), read-only. Pass the surface map and the scoped features.
2. For each feature, the analyst reads the mapped logic (`goToDefinition`, `outgoingCalls`, the graph) and states expected behavior in observable terms: given an input/state, what the UI shows and what the API returns.
3. Capture, per feature: **expected behaviors** (happy path), **invariants** (must always hold — e.g. "total never negative"), **edge cases** (empty, boundary, concurrent, unauthorized, malformed input), and the **flows** (ordered steps a QA agent will drive).
4. Turn each item into a numbered **acceptance criterion** with a stable id (`AC-1`, `AC-2`, …) — this id is what QA agents report coverage against and what `retest` re-runs.
5. Tag each criterion with a target family: `ui`, `api`, or `both`, so `run-tests` can partition work.

## Outputs

The behavior spec consumed by `run-tests`.

```json
{
  "criteria": [
    { "id": "AC-1", "feature": "payment authorization", "family": "api", "behavior": "POST /api/payments with a valid card returns 200 and an authorization id", "kind": "happy-path" },
    { "id": "AC-2", "feature": "payment authorization", "family": "api", "behavior": "a declined card returns 402 with a machine-readable error code, no order created", "kind": "edge-case" },
    { "id": "AC-3", "feature": "payment authorization", "family": "ui", "behavior": "submitting an expired card shows an inline field error and keeps the user on the form", "kind": "edge-case" },
    { "id": "AC-4", "feature": "payment authorization", "family": "both", "behavior": "invariant: no order row is created unless authorization succeeded", "kind": "invariant" }
  ]
}
```

## Test

LLM assertion: every scoped feature has ≥ 1 happy-path AND ≥ 1 edge-case criterion, each criterion has a unique `id`, a `family` in {ui, api, both}, and an observable `behavior` (states inputs/state → expected output). A spec with only happy paths, or a criterion whose behavior is not observable, fails.
