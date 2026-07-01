# Deep-Test Report: <SCOPE_TITLE>

> Owned by the `qa-reporter` agent. `report` fills the header, QA scorecard, Problems, Coverage.
> `trace-causes` fills Root causes; `review` fills Todolist; `fix` fills Fix log; `retest` fills Retest results.
> One report per run at `.claude/docs/deep-test/<slug>.md`. Append and update in place — never fork.

| field    | value                                                                       |
| -------- | --------------------------------------------------------------------------- |
| slug     | `<kebab-slug>`                                                               |
| status   | `draft`  <!-- draft → tested → traced → in-review → fixing → retested → done --> |
| created  | `<YYYY-MM-DD>`                                                               |
| ui_url   | `<ui_base_url>`                                                              |
| api_url  | `<api_base_url>`                                                             |
| scope    | `<comma-separated features under test>`                                      |
| auth     | `<none \| cookie \| credentials \| magic_link>` (method used to reach the logged-in state) |

## Scope tested

<The features under test and the number of acceptance criteria exercised, from the behavior spec. One line per feature: name — N criteria (H happy / E edge / I invariant).>

## QA scorecard

One row per tested area. Coherence / reliability / stability scored 0–5 (see `references/qa-scoring.md`); errors / bugs are counts.

| area | family | coherence | reliability | stability | errors | bugs |
| ---- | ------ | --------- | ----------- | --------- | ------ | ---- |
| `<area>` | `<ui\|api>` | `<0-5>` | `<0-5>` | `<0-5>` | `<n>` | `<n>` |

## Problems

Ranked critical → high → medium → low. Deduplicated across agents. Ids `P1, P2, …` are stable for the whole run.

### P1 — <title> · `<severity>` · `<type>`

- **Criterion**: `<AC-id>`
- **Area / family**: `<area>` / `<ui|api>`
- **Steps to reproduce**: <numbered steps or curl commands>
- **Expected**: <what the spec promises>
- **Actual**: <what happened>
- **Evidence**: <HTTP status, console/log excerpt, or accessibility-tree snapshot>

## Root causes

Filled by `trace-causes`. One entry per problem id.

### P1

- **Proximate cause**: <what + `file:line`>
- **Underlying cause**: <what + `file:line`>
- **Confidence**: `<low | medium | high>`
- **Fix seeds**: <candidate directions — not implementations>

## Todolist

Filled by `review` after per-problem user approval. Mirrors the native TodoWrite list.

| id | problem_id | fix_summary | target_files | status |
| -- | ---------- | ----------- | ------------ | ------ |
| `T1` | `P1` | `<summary>` | `<files>` | `pending` <!-- pending → fixed → verified --> |

**Deferred**: <problem ids the user chose not to fix this round, or "none">

## Fix log

Filled by `fix` as tasks land.

### T1 — `P1`

- **Files**: <files touched, each `file:line`>
- **What/why**: <one-line change summary>

## Retest results

Filled by `retest`. Verdict per fixed problem: `resolved | partial | regressed`.

### P1

- **Criteria re-run**: `<AC-ids>`
- **Verdict**: `<resolved | partial | regressed>`
- **Evidence**: <fresh evidence from the retest>

**Loop back to review?**: `<yes | no>` — <reason: residual/new problems, or clean>
