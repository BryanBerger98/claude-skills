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
4. Turn each item into a numbered **acceptance criterion** with a stable id (`AC-1`, `AC-2`, …) — this id is what QA agents report coverage against and what `retest` re-runs. Every criterion cites the source it derives from (`source: file:line`) and carries a `status` (`implemented` | `assumed` | `unimplemented`) so QA can tell a firm contract from an inferred one.
5. Tag each criterion with a target family: `ui`, `api`, or `both`, so `run-tests` can partition work — and a `priority` (`high` | `normal`) so QA agents probe the riskiest criteria first.

## Outputs

The behavior spec consumed by `run-tests`.

```json
{
  "criteria": [
    { "id": "AC-1", "feature": "payment authorization", "family": "api", "kind": "happy-path", "priority": "high", "status": "implemented", "source": "src/api/payments.ts:42", "behavior": "POST /api/payments with a valid card returns 200 and an authorization id" },
    { "id": "AC-2", "feature": "payment authorization", "family": "api", "kind": "edge-case", "priority": "high", "status": "assumed", "source": "src/api/payments.ts:67", "behavior": "a declined card returns 402 with a machine-readable error code" },
    { "id": "AC-3", "feature": "payment authorization", "family": "ui", "kind": "edge-case", "priority": "normal", "status": "implemented", "source": "src/components/CardForm.tsx:120", "behavior": "submitting an expired card shows an inline field error and keeps the user on the form" },
    { "id": "AC-4", "feature": "payment authorization", "family": "both", "kind": "invariant", "priority": "high", "status": "implemented", "source": "src/services/orders.ts:88", "behavior": "after a declined payment, GET /api/orders returns no new order" }
  ],
  "flows": [
    { "feature": "payment authorization", "steps": ["open /checkout", "fill the card form", "submit"] }
  ],
  "assumptions": ["AC-2 — treated 402 as the intended decline status (not documented)"]
}
```

## Test

LLM assertion: every scoped feature has ≥ 1 happy-path AND ≥ 1 edge-case criterion; each criterion has a unique `id`, a `family` in {ui, api, both}, a `status` in {implemented, assumed, unimplemented}, a `source` (`file:line`) unless `unimplemented`, and an observable `behavior` (states inputs/state → expected output) verifiable with curl or a browser alone. Every feature with a UI surface has a `flows` entry. A spec with only happy paths, a criterion whose behavior is not externally observable, or a criterion without code evidence fails.
