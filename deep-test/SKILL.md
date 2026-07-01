---
name: deep-test
description: Deep-tests a set of features end to end — rebuilds the code graph, maps the UI/API surface, derives a testable behavior spec, dispatches parallel opus QA agents (browser e2e + HTTP) that score coherence, reliability, stability, errors and bugs, consolidates a ranked report, traces each problem to its code root cause, then runs an interactive approve-fix-retest loop. Use when the user wants a thorough autonomous QA sweep of one or more features across web UI and API — e.g. "deep-test the checkout flow", "full QA pass on auth with root-cause analysis and fixes". Do NOT use for a single known bug (use `diagnose`), reviewing a diff (use `code-review`), quick error fixes (use `fix-errors`), or just launching the app to eyeball a change (use `verify` or `run`).
---

# Deep Test

Takes a prompt describing a set of features and tests them in depth: it rebuilds the code graph and maps the UI/API surface, derives a testable behavior spec, then dispatches **parallel specialized QA agents** (browser e2e + HTTP API) that probe for coherence, reliability, stability, errors and bugs. Their structured reports are consolidated into a ranked report at `.claude/docs/deep-test/<slug>.md`, each problem is traced to a code root cause, and the skill runs an **interactive approve-fix-retest loop** — the user validates every problem and authorizes every fix before any code changes. Most useful when a feature is non-trivial, spans UI and API, and you want empirical QA plus a written trail rather than a static read.

## Available actions

| #   | Action         | Role                                                                                       | Input                          |
| --- | -------------- | ------------------------------------------------------------------------------------------ | ------------------------------ |
| 01  | `intake`       | Scope the feature set; detect + launch the app; collect URL/API/creds/test-account; verify reachability | raw `<prompt>`      |
| 02  | `map`          | Rebuild the graphify graph, then map the relevant code surface (UI routes, API endpoints, business logic, data models) | scoped features |
| 03  | `understand`   | Derive the testable behavior spec: expected behaviors, invariants, edge cases, user flows, acceptance criteria | surface map |
| 04  | `run-tests`    | Partition the spec across parallel opus QA agents (UI-e2e + API); collect structured, scored reports | behavior spec + app access |
| 05  | `report`       | Aggregate, dedup, and rank QA reports into `.claude/docs/deep-test/<slug>.md`               | QA agent reports               |
| 06  | `trace-causes` | Trace each ranked problem to its code root cause (`file:line`); append the mapping to the report | ranked report              |
| 07  | `review`       | Interactive review, problem by problem; build the fix todolist. HALT — no code changes yet | traced report                  |
| 08  | `fix`          | Ask for approval, then dispatch fixer agents to resolve the todolist                        | approved todolist              |
| 09  | `retest`       | Re-run only the tests tied to the fixed problems; update the report                         | applied fixes                  |

## Default flow (sequential + loop)

`01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09`, then **loop**: after `09`, if any problem remains unresolved, return to `07`; otherwise finish.

Two hard gates:

- **After 01** — never proceed while the feature scope is ambiguous OR the app is unreachable. Ask, launch, verify, then continue.
- **Before 08** — never edit code, run `git` mutations, or migrate until the user approves fixes during `07`. `08` is the only place execution is unlocked.

## Transversal rules

- **Report path**: one report per run at `.claude/docs/deep-test/<slug>.md` (slug = kebab-case of the feature scope). Actions append to it; never fork it. All writes to this file go through the `qa-reporter` agent.
- **Status field**: the report's `status` advances `draft → tested → traced → in-review → fixing → retested → done`. Each action sets it; only `review` may move it to `in-review`, only `fix` to `fixing`.
- **Evidence rule**: every QA problem carries reproduction steps + evidence (HTTP status, console/log excerpt, screenshot or accessibility-tree snapshot). Every traced cause cites `file:line`. No claim without a reference.
- **Approval is sacred**: code edits, `git` mutations, and migrations are forbidden before the `review` gate clears in `07`. `fix` runs only on explicit user approval.
- **QA agents are opus**: `run-tests` and `retest` dispatch `qa-ui` and `qa-api` on the opus model — deep probing needs strong reasoning. Report aggregation and fixing use cheaper tiers (see *Agents*).
- **Graph is always rebuilt**: `map` runs `graphify update <repo>` (fast, no-LLM re-extraction) before exploring, so navigation reflects the current tree. Read-only agents (`investigator`) must never build the graph.
- **App access**: base URL, API base URL, test credentials, test account, and seed data are captured once in `intake` and threaded to every QA agent. Never test against an unverified endpoint.

## Agents

Heavy actions delegate to subagents so each runs at the right model tier with an isolated context. Spawn them with the Agent tool using the listed `subagent_type` and model.

| Action         | Subagent            | Model  | Scope    | Why                                                                  |
| -------------- | ------------------- | ------ | -------- | -------------------------------------------------------------------- |
| `intake`       | `app-scout`         | sonnet | local    | Detect app type, launch UI+API, verify reachability, propose scope   |
| `map`          | `codebase-explorer` | sonnet | harness  | Read-only surface mapping over the freshly rebuilt graph + LSP       |
| `understand`   | `spec-analyst`      | opus   | local    | Derive expected behaviors, invariants, and edge cases from the code  |
| `run-tests`    | `qa-ui`             | opus   | local    | Browser e2e probing via `agent-browser`; structured scored report    |
| `run-tests`    | `qa-api`            | opus   | local    | HTTP endpoint probing via `curl`; structured scored report           |
| `report`       | `qa-reporter`       | sonnet | local    | Aggregate, dedup, rank QA reports and own every write to the report  |
| `trace-causes` | `investigator`      | opus   | shared   | Read-only root-cause tracing; returns `file:line` causes for the report |
| `fix`          | `planner`           | opus   | shared   | Turn each approved fix into a precise step plan                       |
| `fix`          | `developer`         | sonnet | shared   | Apply the plan as code edits                                         |

`intake` and `review` also run logic in the main loop — they require direct conversation with the user (clarifying questions, problem-by-problem approval). Shared agents are pointed to, not copied (R7) — see *External data*.

## References (documents to read)

- `references/qa-scoring.md` — the five QA axes (coherence, reliability, stability, errors, bugs), how to score them, and the severity taxonomy.
- `references/agent-browser-cheatsheet.md` — how `qa-ui` drives the `agent-browser` CLI (snapshot, element refs, interactions).
- `references/app-launch.md` — how `app-scout` detects, launches, and verifies the app (UI + API) before testing.

## Assets (templates to copy or data to inject)

- `assets/report-template.md` — the Markdown report skeleton `qa-reporter` injects and later actions append to.
- `assets/qa-report-schema.md` — the structured JSON schema every QA agent must return, injected into `run-tests`/`retest` agent prompts.

## External data (cross-skill pointers per R7)

- `../agents/investigator.md` — shared read-only root-cause agent (opus). Used by `trace-causes`.
- `../agents/planner.md` — shared planning agent (opus) that turns an approved fix into a step plan. Used by `fix`.
- `../agents/developer.md` — shared implementation agent (sonnet) that applies the plan. Used by `fix`.
