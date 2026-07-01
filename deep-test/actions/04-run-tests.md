# 04 — Run tests (parallel QA agents)

Partition the behavior spec across parallel specialized QA agents and collect their structured, scored reports. This is where bugs are found empirically against the running app.

## Inputs

- `behavior_spec` (required) — the acceptance criteria from `understand`.
- `app_access` (required) — URLs, credentials, seed data from `intake`.

## Depends on

- `03-understand`

## Process

1. Partition the criteria into batches by family and feature so each agent owns a coherent slice (e.g. one agent per feature per family). Keep batches small enough that an agent can probe each criterion thoroughly — split rather than overload.
2. Read `assets/qa-report-schema.md` — every QA agent must return exactly this JSON shape.
3. Dispatch the agents **in parallel** (multiple Agent tool calls in one message):
   - **`qa-ui`** (`subagent_type: qa-ui`, model `opus`) for `ui` / `both` batches — drives the app through `agent-browser` per `references/agent-browser-cheatsheet.md`.
   - **`qa-api`** (`subagent_type: qa-api`, model `opus`) for `api` / `both` batches — probes endpoints with `curl`.
   Pass each agent its criteria batch, the `app_access` record, `references/qa-scoring.md`, and the schema.
4. Each agent tests every criterion in its batch — happy path, edge cases, and adversarial inputs — and scores its slice on the five axes (coherence, reliability, stability, errors, bugs) per `references/qa-scoring.md`. Every problem it reports must carry reproduction steps + evidence (HTTP status, console/log excerpt, or accessibility-tree snapshot).
5. Collect all agent reports. Reject any that omit evidence or leave a criterion in its batch untested (send it back or note the gap). Do NOT dedup or rank here — that is `report`'s job.

## Outputs

An array of raw QA agent reports (one per agent), each conforming to `assets/qa-report-schema.md`, handed to `report`.

```json
[
  {
    "area": "payment-authorization-api",
    "family": "api",
    "scores": { "coherence": 3, "reliability": 2, "stability": 4 },
    "coverage": ["AC-1", "AC-2", "AC-4"],
    "problems": [
      { "id": "P1", "criterion": "AC-2", "title": "declined card returns 500 instead of 402", "severity": "high", "type": "bug", "steps": ["POST /api/payments with test-declined card"], "expected": "402 + error code", "actual": "500 + stack trace", "evidence": "HTTP 500, body: 'Cannot read properties of undefined'" }
    ]
  }
]
```

## Test

LLM assertion: at least one report exists per family present in the spec; every criterion in the spec appears in some agent's `coverage`; every entry in `problems` has `criterion`, `severity`, reproduction `steps`, and `evidence`. A run that leaves a spec criterion uncovered, or a problem without evidence, fails.
