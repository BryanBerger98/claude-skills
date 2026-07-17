# 03 — Design evals

Write the invocation evals BEFORE the agent file exists. Core of TDD (A5).

## Inputs

- Agent spec (from 01), including `destination` and `agent_name`.
- Realistic parent-task situations from the user: ≥ 3 `should_delegate`, ≥ 3 `should_not_delegate`, ≥ 1 `ambiguous`.

## Outputs

`<destination>/evals/<agent-name>.json` — see `assets/agent-evals-template.md`. Example shape:

```json
[
  { "type": "should_delegate",     "prompt": "Map every file involved in the auth flow before I refactor it" },
  { "type": "should_not_delegate", "prompt": "Fix the failing login test", "competing_agent": "developer" },
  { "type": "ambiguous",           "prompt": "Look into the checkout module", "note": "Parent should clarify: map the code (delegate) or diagnose a bug (investigator)?" }
]
```

## Depends on

- `01-capture-need`

## Process

1. Ask the user for realistic parent-task situations — never invent them. Drafting candidates grounded in the user's actual repos and asking for written correction is acceptable; inventing without validation is not.
2. For each `should_delegate`: a task where the parent MUST spawn this agent based on the description alone.
3. For each `should_not_delegate`: a near-miss task; fill `competing_agent` with the agent that should handle it (`"none"` if none exists).
4. For each `ambiguous`: describe in `note` what the parent should clarify before delegating.
5. Each scenario must exercise a distinct decision — no trivial rephrasings.
6. Write `<destination>/evals/<agent-name>.json` (create the `evals/` directory if absent).
7. Read the scenarios back to the user and wait for validation before `04`.

## Test

```bash
node ~/.claude/skills/generate-agent/scripts/validate-agent-evals.js <destination>/evals/<agent-name>.json
```
