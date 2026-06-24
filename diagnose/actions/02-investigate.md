# 02 — Investigate

Read the codebase deeply and map the problem: root cause plus the four impact dimensions, each backed by `file:line` evidence. Read-only — no edits.

## Inputs

- `scoped_problem` (required) — the record from `intake` (title, slug, symptom, scope hints).

## Depends on

- `01-intake`

## Process

1. Read `references/analysis-checklist.md` in full — it defines what to inspect and the evidence rule.
2. Spawn the **`investigator`** subagent (Agent tool, `subagent_type: investigator`, model `opus`). Pass the scoped problem + the checklist. It runs read-only: trace call paths, data flow, and contracts with references/call-hierarchy, not text search alone.
3. Require structured findings back: `root_cause` (proximate + underlying), and the four dimensions — `side_effects`, `regressions`, `undesirable_behaviors`, `inconsistencies` — each a list of `{ finding, evidence: "file:line", severity }` or an explicit "none found". Plus `reproduction` and `solution_seeds`.
4. Reject thin findings: any claim without a `file:line` goes back to the investigator. A dimension left blank (vs. "none found") is incomplete.
5. If the investigation reveals the problem is mis-scoped (different root system than `intake` assumed), return to `intake` to re-confirm before continuing.
6. Hand the findings to `report`.

## Outputs

Structured findings consumed by `report`.

```json
{
  "root_cause": { "proximate": "session cookie TTL reset on every request — auth/middleware.ts:88", "underlying": "shared mutable config object mutated per-request — config/session.ts:24" },
  "side_effects": [{ "finding": "in-memory session cache never invalidated", "evidence": "lib/cache/session.ts:40", "severity": "medium" }],
  "regressions": [{ "finding": "loginRateLimiter reads the same TTL", "evidence": "auth/rateLimit.ts:17", "severity": "high" }],
  "undesirable_behaviors": [{ "finding": "no error when store write fails — silent logout", "evidence": "auth/middleware.ts:95", "severity": "high" }],
  "inconsistencies": [{ "finding": "TTL is 30m in config, 5m hardcoded in middleware", "evidence": "config/session.ts:24 vs auth/middleware.ts:88", "severity": "critical" }],
  "reproduction": ["log in", "wait 5 min", "any request 401s"],
  "solution_seeds": ["stop mutating the shared config object", "single source for TTL"]
}
```

## Test

LLM assertion: findings cover all four dimensions (each either a non-empty list or an explicit "none found"), every listed finding carries a `file:line` reference, and a proximate + underlying root cause is stated. A findings object with any dimension key missing, or any finding lacking `evidence`, fails.
