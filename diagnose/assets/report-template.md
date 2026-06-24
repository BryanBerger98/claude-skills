# Analysis Report: <PROBLEM_TITLE>

> Injected by the `report` action. `decide` fills **## Decision**; `implement` fills **## Implementation**.
> Keep one report per problem at `.claude/docs/analysis/<slug>.md`. Append — never fork.

| field    | value                                                        |
| -------- | ------------------------------------------------------------ |
| slug     | `<kebab-slug>`                                                |
| status   | `draft`  <!-- draft → awaiting-approval → approved → implemented --> |
| created  | `<YYYY-MM-DD>`                                                |
| author   | `<who ran the diagnosis>`                                     |
| severity | `<low | medium | high | critical>`                           |

## Problem

<One-paragraph statement of the reported problem, in the user's own framing. What is observed vs. what is expected.>

## Reproduction & context

- **Steps to reproduce**: <numbered steps, or "not reproduced — analyzed statically">
- **Environment / trigger**: <deploy, route, input, version, feature flag…>
- **First seen**: <when / since which change, if known>

## Root cause

<The mechanism behind the problem, traced to code. Cite every claim `path/to/file.ext:line`. Distinguish the proximate cause from the underlying cause.>

## Impact analysis

The four dimensions every diagnosis must cover. Each finding cites `file:line`. Write "none found" explicitly when a dimension is clear — never leave it blank.

### Side effects

<Shared state, globals, caches, emitted events, side-effecting calls reachable from the affected code. `file:line` each.>

### Regressions

<Callers and dependents that the bug — or any fix to it — could break. Tests that cover (or fail to cover) the path. `file:line` each.>

### Undesirable behaviors

<Edge cases, error paths, concurrency/ordering issues, silent failures the problem exposes. `file:line` each.>

### Inconsistencies

<Contract mismatches between modules, divergent data shapes across boundaries (e.g. API vs UI), duplicated logic that drifted. `file:line` each.>

## Proposed solutions

At least two options. For each: approach, blast radius, effort, risk, and the dimensions above it touches. Mark one **Recommended**.

### Option A — <name> (Recommended)

- **Approach**: <what changes>
- **Blast radius**: <files / modules touched>
- **Effort**: <S | M | L>
- **Risk**: <what could go wrong>

### Option B — <name>

- **Approach**: <what changes>
- **Blast radius**: <files / modules touched>
- **Effort**: <S | M | L>
- **Risk**: <what could go wrong>

## Decision

<!-- Filled by `decide` AFTER the user approves. Until then: "Awaiting approval." -->

- **Chosen option**: <A | B | …>
- **Rationale**: <why this one>
- **Approved by**: <user> on `<YYYY-MM-DD>`

## Implementation

<!-- Filled by `implement` after code changes land. Until then: "Pending approval." -->

- **Plan**: <link to / summary of the planner's step plan>
- **Changes**: <files touched, each with a one-line what-and-why>
- **Verification**: <tests run, manual checks, result>
- **Follow-ups**: <anything deferred, with a reference>
