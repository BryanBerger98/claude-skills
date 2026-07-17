# 01 — Frame need

Deep-dive the user's expressed AI-workflow need into a validated need brief via AskUserQuestion.

## Inputs

- `user_need` (required) — free-form user message describing a workflow pain or automation wish.

## Outputs

A need brief held in conversation context and passed to actions 02–04 as-is. Not written to any file.

```text
pain             = "PR reviews take ~45 min each, 6×/week"
current_workflow = manual review in the GitHub UI, no tooling
actors           = solo today, may extend to a team of 4
frequency        = ~6 runs/week
roi_estimate     = ~4h/week recoverable
criticality      = medium — errors are caught downstream by CI
constraints      = token-budget sensitive; no write access to prod repos; portable across projects
scope            = native components + scheduled agents OK; no CI, no Agent SDK
success_criteria = "review draft ready in <5 min, catching ≥80% of my usual findings"
```

## Process

1. Extract every field the initial message already answers. Never re-ask an answered question.
2. Round 1 — pain and current workflow (≤ 4 questions): what happens today step by step, which tools are touched, who is involved, how often.
3. Round 2 — ROI and success (≤ 4 questions): time lost per occurrence, cost of an error (criticality), what "good" looks like — extract measurable `success_criteria`.
4. Round 3 — constraints and scope (≤ 4 questions): token/cost sensitivity, security and permission boundaries, solo vs team distribution, portability across projects, and whether the extended scope is acceptable (scheduled agents, CI, Agent SDK apps).
5. Adaptive pacing: merge rounds when earlier answers cover them; hard cap at 3 AskUserQuestion calls.
6. Synthesize the brief in the shape above, present it back, and ask for validation (validate / amend). Apply amendments and re-present until the user validates in writing.

## Test

**Pattern C — LLM assertion with example:**
Assert: "Every brief field is filled and traceable to either the initial message or an AskUserQuestion answer; no field was invented; the user validated the final brief in writing." Example of a correct output: the brief block in `## Outputs` above, where each line maps to a quoted user answer.
