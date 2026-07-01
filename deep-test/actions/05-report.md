# 05 — Report

Consolidate the raw QA agent reports into one ranked, deduplicated report on disk. All writes go through the `qa-reporter` agent, which owns the report file.

## Inputs

- `qa_reports` (required) — the array of raw agent reports from `run-tests`.
- `slug` (required) — from `intake`, for the report path.

## Depends on

- `04-run-tests`

## Process

1. Spawn the **`qa-reporter`** subagent (Agent tool, `subagent_type: qa-reporter`, model `sonnet`). Pass the raw reports, the `slug`, and `assets/report-template.md`.
2. The reporter copies `assets/report-template.md` to `.claude/docs/deep-test/<slug>.md` if it does not exist, then fills it:
   - **QA scorecard**: one row per area with the five axes (coherence, reliability, stability scored 0–5; errors and bugs as counts) per `references/qa-scoring.md`.
   - **Problems (ranked)**: merge all agents' `problems`, **dedup** ones that describe the same defect (same criterion + same symptom), assign a global id (`P1`, `P2`…), and **rank by severity** (critical → high → medium → low), then by reliability impact.
   - **Coverage**: which acceptance criteria were exercised, and any left untested.
3. Set the report `status` to `tested`.
4. Leave the **Root causes** and **Todolist** sections as their template placeholders — `trace-causes` and `review` fill them.
5. Return the report path and the ranked problem list (ids + titles + severity) to the main loop.

## Outputs

`.claude/docs/deep-test/<slug>.md` with the header, QA scorecard, ranked problems, and coverage filled; `status: tested`. The main loop receives:

```json
{
  "report_path": ".claude/docs/deep-test/checkout-payment-flow.md",
  "problems": [
    { "id": "P1", "title": "declined card returns 500 instead of 402", "severity": "high", "criterion": "AC-2" }
  ]
}
```

## Test

```bash
node scripts/test-report-structure.js
```

Verifies `assets/report-template.md` contains every required section the reporter fills (QA scorecard, Problems, Root causes, Todolist, Retest results). If the template is missing a section, the reporter cannot produce a valid report — this fails fast.
