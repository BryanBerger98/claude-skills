---
name: diagnose
description: Diagnoses a specific code problem end to end — reads the codebase to trace root cause, side effects, regressions, undesirable behaviors, and inconsistencies, writes a Markdown analysis report with ranked solutions, HALTS for user approval, then on approval records the chosen fix in the report and implements it. Use when the user reports a bug, regression, unexpected behavior, or cross-module inconsistency and wants a deep written analysis with a validation gate before any code changes — e.g. "diagnose why X breaks", "analyze the impact of this bug and propose a fix before touching code", "investigate this regression". Do NOT use for quick error fixes with no analysis report (use `fix-errors`), reviewing an existing diff (use `code-review`), or broad architecture refactors with no specific reported problem (use `improve-codebase-architecture`).
---

# Diagnose

Takes a reported problem, analyzes the codebase deeply, and produces a versioned Markdown report at `.claude/docs/analysis/<slug>.md` covering root cause and impact (side effects, regressions, undesirable behaviors, inconsistencies) with ranked solutions. The skill **stops for user approval** before any code change; on approval it records the chosen solution in the report and implements it. Most useful when a problem is non-trivial, touches shared code, and a written decision trail matters.

## Available actions

| #   | Action        | Role                                                                 | Input                          |
| --- | ------------- | ------------------------------------------------------------------- | ------------------------------ |
| 01  | `intake`      | Capture and scope the problem; ask clarifying questions until unambiguous | raw problem statement     |
| 02  | `investigate` | Read the codebase deeply; map root cause + the four impact dimensions, each cited `file:line` | scoped problem |
| 03  | `report`      | Write the Markdown analysis report with ranked solutions             | investigation findings         |
| 04  | `decide`      | Present the report, HALT for approval, record the chosen solution    | report + user approval         |
| 05  | `implement`   | Plan then apply the chosen fix; record implementation details in the report | approved solution         |

## Default flow

Sequential: `01 → 02 → 03 → 04 → 05`. No skipping allowed.

Two hard gates:
- **After 01** — if the problem is ambiguous, ask questions and wait. Never investigate a guess.
- **After 04** — never edit code until the user approves a solution in writing. `04` is the only place execution is unlocked.

## Transversal rules

- **Report path**: every report lives at `.claude/docs/analysis/<slug>.md` (slug = kebab-case of the problem). One report per problem; actions append to it, never fork it.
- **Status field**: the report's `status` advances `draft → awaiting-approval → approved → implemented`. Each action sets it; `decide` is the only action allowed to move it to `approved`.
- **Evidence rule**: every finding in the report cites concrete `file:line` locations. No claim without a reference.
- **Subagents**: `investigate`, `report`, and `implement` delegate to specialized subagents (see *Agents* below). Spawn them with the Agent tool using the listed `subagent_type` and model. `intake` and `decide` run in the main loop — they require direct conversation with the user.
- **Approval is sacred**: code edits, `git` mutations, and migrations are forbidden before the `decide` gate clears.

## Agents

The heavy actions delegate to subagents so each runs at the right model tier and with an isolated context.

| Action        | Subagent       | Model  | Scope    | Why                                                        |
| ------------- | -------------- | ------ | -------- | ---------------------------------------------------------- |
| `investigate` | `investigator` | opus   | shared   | Deep read-only root-cause + impact analysis needs strong reasoning |
| `report`      | `reporter`     | haiku  | local    | Mechanical fill of the report template from findings        |
| `implement`   | `planner`      | opus   | shared   | Turns the approved solution into a precise step plan         |
| `implement`   | `developer`    | sonnet | shared   | Applies the plan as code edits                              |

Shared agents are pointed to, not copied (R7) — see *External data*. The local `reporter` lives in `agents/reporter.md`.

## References (documents to read)

- `references/analysis-checklist.md` — what `investigate` must inspect for each impact dimension, plus the `file:line` evidence requirement.

## Assets (templates to copy or data to inject)

- `assets/report-template.md` — the Markdown report skeleton `report` injects and later actions append to.

## External data (cross-skill pointers per R7)

- `../agents/investigator.md` — shared read-only deep-analysis agent (opus). Install into `.claude/agents/` so `subagent_type: investigator` resolves.
- `../agents/planner.md` — shared planning agent (opus) that turns an approved solution into a step plan.
- `../agents/developer.md` — shared implementation agent (sonnet) that applies the plan.
