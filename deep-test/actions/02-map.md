# 02 — Map the code surface

Rebuild the code graph, then map the code that implements the scoped features: UI routes/components, API endpoints, business logic, and data models. Read-only.

## Inputs

- `scoped_features` (required) — the feature list from `intake`.
- `repo_path` (required) — the repository root.

## Depends on

- `01-intake`

## Process

1. Rebuild the graph: run `graphify update <repo_path>` (fast, no-LLM re-extraction) so `graphify-out/graph.json` reflects the current tree. If graphify is absent, note it and continue on LSP + search alone.
2. Spawn the **`codebase-explorer`** subagent (Agent tool, `subagent_type: codebase-explorer`, model `sonnet`), read-only. Pass the scoped features and instruct it to map each feature to its code, resolving symbols rather than matching text.
3. The explorer navigates with the sharpest tool first: `graphify query "<feature>" --budget 2000` and `graphify explain "<node>"` for scoped subgraphs, `graphify path "<A>" "<B>"` to relate a UI screen to its API handler, then the **LSP** tool (`workspaceSymbol`, `goToDefinition`, `findReferences`, call hierarchy) to confirm real bindings. Text search is the floor.
4. For each feature, collect: UI entry points (routes/components), API endpoints (method + path + handler `file:line`), business-logic units, and the data models / schemas they touch.
5. Flag coverage gaps: any scoped feature with no locatable code is surfaced explicitly (it may be unimplemented — that itself is a finding for `run-tests`).

## Outputs

A structured surface map consumed by `understand` and `run-tests`.

```json
{
  "features": [
    {
      "name": "payment authorization",
      "ui": ["app/checkout/PaymentForm.tsx:42"],
      "api": [{ "method": "POST", "path": "/api/payments", "handler": "server/payments/route.ts:18" }],
      "logic": ["server/payments/authorize.ts:30"],
      "models": ["db/schema/payment.ts:8"]
    }
  ],
  "unmapped": []
}
```

## Test

LLM assertion: `graphify update` was run (or its absence explicitly noted), and every scoped feature appears in `features` with at least one `file:line` anchor OR is listed under `unmapped` with a reason. A map that references a symbol with no `file:line`, or silently drops a scoped feature, fails.
