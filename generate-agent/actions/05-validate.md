# 05 — Validate

Run the validators and walk every eval scenario. Loop until 100% pass.

## Inputs

- `<destination>/<agent-name>.md` (from 04)
- `<destination>/evals/<agent-name>.json` (from 03)

## Outputs

Validation report delivered to the user. Example:

| type                | prompt                                        | expected     | actual       | status |
| ------------------- | --------------------------------------------- | ------------ | ------------ | ------ |
| should_delegate     | Map every file involved in the auth flow      | delegate     | delegate     | PASS   |
| should_not_delegate | Fix the failing login test                    | → developer  | → developer  | PASS   |
| ambiguous           | Look into the checkout module                 | clarify      | clarify      | PASS   |

## Depends on

- `04-draft-agent`

## Process

1. Run the structural gate; fix and re-run until it passes:
   ```bash
   node ~/.claude/skills/generate-agent/scripts/validate-all.js <destination>/<agent-name>.md
   ```
2. Eval walkthrough — judge each scenario against the agent's `description` ONLY (that is all the parent sees when routing):
   - `should_delegate`: would a parent reading the description pick this agent for the prompt?
   - `should_not_delegate`: would the parent skip it AND would `competing_agent`'s description catch the task? Flag separately if the competing agent misses too.
   - `ambiguous`: does the description avoid over-claiming the case, leaving room for the clarification in `note`?
3. On failure, diagnose root cause:
   - Missed delegation → add the trigger phrasing to the description (A2).
   - Wrong capture of a near-miss → add or sharpen the boundary clause.
   - Scope creep in behavior → tighten `tools` (A3) or the body's boundaries section.
4. Re-check failing scenarios only. Loop until 100% pass.
5. Remind the user to restart Claude Code so a newly created agent is registered for the session.
6. Deliver the report table.

## Test

LLM assertion: the report shows 100% pass across every scenario in `<destination>/evals/<agent-name>.json`; no scenario was deleted, softened, or reworded to pass — any scenario judged invalid was explicitly flagged to the user with reasoning.
