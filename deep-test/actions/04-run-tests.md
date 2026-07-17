# 04 — Run tests (parallel QA agents)

Partition the behavior spec across parallel specialized QA agents and collect their structured, scored reports. This is where bugs are found empirically against the running app.

## Inputs

- `behavior_spec` (required) — the acceptance criteria from `understand`.
- `app_access` (required) — URLs, credentials, seed data from `intake`.

## Depends on

- `03-understand`

## Process

1. **Partition (hard rule).** Split the behavior spec so the sweep actually fans out — this is what makes step 3 parallel rather than parallel-in-name-only:
   - **One batch per `(family, feature)` pair.** A `both` criterion is placed in BOTH that feature's `ui` batch and its `api` batch — the UI contract and the API contract are tested separately, by different agents.
   - **Cap batch size at 6 criteria.** Split any batch over 6 into equal sub-batches so no agent tests more than 6 criteria (deep probing needs room per criterion).
   - **Resulting invariant:** agent count ≥ the number of families present in the spec, and equals the number of `(family, feature)` batches (after the size split). A single-agent dispatch is valid ONLY when the spec has one family, one feature, and ≤ 6 criteria. Anything larger MUST fan out.
2. Read `assets/qa-report-schema.md` — every QA agent must return exactly this JSON shape.
3. **Dispatch (hard rule): emit every agent call in ONE message** (multiple Agent tool uses in a single response) so they run concurrently:
   - **`qa-ui`** (`subagent_type: qa-ui`, model `opus`) for each `ui` / `both` batch — drives the app through `agent-browser` per `references/agent-browser-cheatsheet.md`.
   - **`qa-api`** (`subagent_type: qa-api`, model `opus`) for each `api` / `both` batch — probes endpoints with `curl`.
   Never dispatch one batch, await its report, then dispatch the next — **serial dispatch defeats the sweep and is a defect**. If the harness caps concurrency it queues the extras; you still emit them together in one message. Pass each agent its criteria batch, the `app_access` record, `references/qa-scoring.md`, and the schema. A `qa-ui` agent also gets its feature's `flows` entry from the spec — the ordered steps to reach and exercise the feature in the browser.
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

LLM assertion on partition + dispatch + coverage (all three must hold):

- **Partition**: no agent received more than 6 criteria; there is at least one agent per family present in the spec; the number of agents equals the number of `(family, feature)` batches the hard rule produces. A single-agent run when the spec spans multiple features or families FAILS.
- **Dispatch**: all agent calls were emitted in one message (concurrent). A dispatch-await-dispatch sequence for multiple batches FAILS.
- **Coverage/evidence**: every spec criterion appears in some agent's `coverage`; every `problems` entry has `criterion`, `severity`, reproduction `steps`, and `evidence`.

A run that leaves a spec criterion uncovered, serializes a multi-batch dispatch, or reports a problem without evidence, fails.
