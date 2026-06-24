# diagnose

Diagnose a specific code problem end to end: read the codebase to trace root cause and impact, write a versioned Markdown report with ranked solutions, **halt for approval**, then record the chosen fix and implement it.

## When to use

Report a problem and ask for a deep analysis with a decision trail:

```
diagnose why users get logged out after the last deploy
analyze the impact of this null-pointer bug and propose a fix before touching code
investigate this regression: search results are empty since we changed the indexer
the cart total differs between the API and the UI — dig in before changing anything
```

**Does NOT** handle:

| Intent | Use instead |
|---|---|
| Quick error fix, no report wanted | `fix-errors` |
| Review an existing diff for bugs/cleanups | `code-review` |
| Broad architecture refactor, no specific reported problem | `improve-codebase-architecture` |

Gray zone — a vague complaint ("the app feels slow") triggers `diagnose` but stops at `intake` to ask what symptom/route/metric defines the problem before investigating.

## Flow

Sequential, five actions, **two hard gates**:

```
intake → investigate → report → decide → implement
   🚪questions              🚪approval
```

| # | Action | Role | Runs in |
|---|---|---|---|
| 01 | `intake` | Capture + scope the problem; ask clarifying questions until unambiguous | main loop |
| 02 | `investigate` | Read the codebase deeply; map root cause + 4 impact dimensions, each cited `file:line` | `investigator` (opus) |
| 03 | `report` | Write the Markdown report with ranked solutions | `reporter` (haiku) |
| 04 | `decide` | Present the report, HALT for approval, record the chosen solution | main loop |
| 05 | `implement` | Plan then apply the chosen fix; record implementation details | `planner` (opus) → `developer` (sonnet) |

**Gate 1 (after `intake`)** — never investigate a guess. Blocking ambiguities are asked and waited on.
**Gate 2 (after `decide`)** — no code edit, `git` mutation, or migration before the user approves a solution in writing. `decide` is the only action that unlocks execution and sets `status: approved`.

## The report

One report per problem, versioned at `.claude/docs/analysis/<slug>.md`. Actions append to it — never fork.

**Status lifecycle**: `draft → awaiting-approval → approved → implemented`. Only `decide` may set `approved`.

**Sections** (from `assets/report-template.md`):

| Section | Filled by |
|---|---|
| Problem / Reproduction & context / Root cause | `report` |
| Impact analysis — Side effects, Regressions, Undesirable behaviors, Inconsistencies | `report` |
| Proposed solutions (≥2 options, one Recommended) | `report` |
| **Decision** (chosen option, rationale, approver) | `decide` |
| **Implementation** (plan, changed files, verification) | `implement` |

**Evidence rule**: every finding cites concrete `file:line`. No claim without a reference.

## Impact dimensions

`investigate` must cover all four before a report is written (see `references/analysis-checklist.md`). Each dimension is either a list of findings or an explicit "none found" — never blank.

| Dimension | Looks for |
|---|---|
| **Side effects** | Shared/global state, caches, emitted events, I/O on the affected path |
| **Regressions** | Callers/dependents a fix could break, test coverage gaps, public contracts |
| **Undesirable behaviors** | Edge cases, error paths, concurrency/ordering, silent failures |
| **Inconsistencies** | Contract mismatches, divergent data shapes across boundaries (e.g. API vs UI), drifted duplicate logic |

It also separates the **proximate** cause (immediate trigger) from the **underlying** cause (the mechanism that allowed it).

## Agents

Heavy actions delegate to subagents so each runs at the right model tier with an isolated context.

| Agent | Model | Scope | Role |
|---|---|---|---|
| `investigator` | opus | shared (`../agents/`) | Read-only root-cause + impact analysis, returns structured findings |
| `reporter` | haiku | local (`agents/`) | Mechanical fill of the report template from findings |
| `planner` | opus | shared (`../agents/`) | Turns the approved solution into an ordered, file-level step plan (no edits) |
| `developer` | sonnet | shared (`../agents/`) | Applies the plan, adds regression tests, runs the project's checks |

Shared agents are **pointed to, not copied** (R7). `intake` and `decide` run in the main loop — they require direct conversation with the user.

**Code navigation** — the analysis and implementation agents resolve real bindings instead of grepping blind, down a fallback ladder: **graph → symbols → text**.

| Layer | Tool | Used for |
|---|---|---|
| Graph | `graphify` CLI (`affected`, `query`, `path`, `explain`) | Blast radius + architecture, when `graphify-out/graph.json` exists; `affected` seeds regressions/side effects |
| Symbols | `LSP` (`findReferences`, `incomingCalls`, `goToDefinition`, `goToImplementation`) | Precise callers/definitions for TS/JS + PHP; deferred — agents load it via `ToolSearch select:LSP` |
| Text | `Grep` / `Glob` / `Read` | Strings, config, comments, and languages the above don't cover — the floor, never the only layer |

`investigator` and `planner` never build the graph (read-only); `developer` runs `graphify update .` after edits to keep it current. `reporter` does no navigation — it fills the template from findings.

> **Install note** — this repo is a skill *library* (skills at root, not under `.claude/`). For Claude Code to dispatch `subagent_type: investigator | planner | developer | reporter`, install these agent files into the target project's `.claude/agents/`. See SKILL.md → *External data*.

## Validation

Structural (run from the repo root). The three structural validators ship with the `generate-skill` skill:

```bash
node ~/.claude/skills/generate-skill/scripts/validate-all.js diagnose   # SKILL.md + actions + evals
node diagnose/scripts/test-report-template.js                           # report template completeness
```

Behavioral (manual) — after restarting Claude Code, send the 9 prompts in `evals/scenarios.json`: 4 `should` trigger `intake`, 4 `should_not` defer to the competing skill, 1 `ambiguous` asks for clarification.

## Guardrails

- No code change before the `decide` gate clears — approval must be for *this* report, not borrowed from another context.
- `implement` refuses to start unless `status: approved`.
- Every finding carries `file:line` evidence; a dimension left blank (vs. "none found") is treated as incomplete.
- `investigator` and `planner` are read-only; only `developer` edits code.
