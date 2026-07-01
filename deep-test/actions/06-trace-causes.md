# 06 — Trace causes

For each ranked problem, trace the likely code root cause and append the problem↔cause mapping to the report. Read-only analysis — no edits.

## Inputs

- `report_path` (required) — from `report`.
- `problems` (required) — the ranked problem list from `report`.
- `surface_map` (required) — from `map`, to focus the search.

## Depends on

- `05-report`

## Process

1. Spawn the **`investigator`** subagent (Agent tool, `subagent_type: investigator`, model `opus`), read-only — the shared agent at `../agents/investigator.md`. Pass the ranked problems (with reproduction + evidence) and the surface map.
2. The investigator traces each problem to its mechanism using the freshly built graph and LSP: `graphify affected "<symbol>"`, call hierarchy, and `goToDefinition`. It must **not** rebuild the graph (that breaks read-only) — `map` already did. It separates the proximate cause from the underlying cause and cites `file:line` for each.
3. For each problem, require: `proximate_cause` (+`file:line`), `underlying_cause` (+`file:line`), `confidence` (low/medium/high), and `fix_seeds` (candidate directions, not implementations). If a cause cannot be located, say so explicitly rather than guessing.
4. Hand the causes to the **`qa-reporter`** subagent (`subagent_type: qa-reporter`, model `sonnet`) to append them into the report's **Root causes** section, one entry per problem id, linking `P<n>` to its cause(s). `qa-reporter` owns all report writes.
5. Set the report `status` to `traced`.

## Outputs

The report's **Root causes** section filled — each problem id mapped to proximate + underlying cause with `file:line`; `status: traced`. Findings shape handed to the reporter:

```json
{
  "P1": {
    "proximate_cause": "authorize() dereferences response.data before null-check — server/payments/authorize.ts:47",
    "underlying_cause": "gateway client returns undefined on decline, contract assumes an object — server/payments/gatewayClient.ts:22",
    "confidence": "high",
    "fix_seeds": ["null-check the decline branch", "map gateway decline to a 402 result type"]
  }
}
```

## Test

LLM assertion: every problem id from `report` has a Root causes entry with a proximate cause, an underlying cause, and at least one `file:line` reference — or an explicit "cause not located" with what was checked. A problem left without any cause entry fails.
