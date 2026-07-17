# 03 — Research docs

Select the candidate component types from the brief, then delegate the best-practice collection to the `docs-researcher` agent — fetched pages never enter the parent context. Runs in parallel with `02-audit-setup`.

## Inputs

- `need_brief` (required) — from `frame-need`. Candidate types derive from the brief alone; the inventory is applied later, in `write-plan` (reuse-vs-build arbitration).

## Outputs

Sourced notes per retained type (returned by the agent) plus the list of discarded types with reasons (produced by the parent; feeds plan section 8).

```text
component_type = subagent
best_practices = single responsibility; restrict tools to the minimum;
                 cheapest capable model; description states when to invoke
sources        = https://code.claude.com/docs/en/sub-agents (live fetch, 2026-07-13);
                 references/component-catalog.md

discarded      = plugin ("solo user, nothing to distribute"), CI ("scope excluded in brief")
```

## Depends on

- `01-frame-need`

## Process

1. In the parent, read ONLY the decision table at the top of `references/component-catalog.md` and derive the candidate component types from the brief. Respect the brief's `scope` field (e.g. no CI if excluded). Log every discarded type with a one-line reason.
2. Spawn the `docs-researcher` agent (Agent tool) in the same message as the `audit-setup` delegation — the two run in parallel. Pass it: the retained types, the catalog path, and a one-line need digest.
3. The agent reads the catalog entries for those types, live-fetches each official URL (≤ 1 per type, sitemap fallback on 404), and returns one sourced note per type plus `discrepancies` and `fetch_gaps`.
4. On receipt: reject any note lacking a source URL (re-invoke the agent for that type); relay `fetch_gaps` to the user; queue `discrepancies` as a catalog update after the run.

## Test

**Pattern C — LLM assertion with example:**
Assert: "Every retained component type has exactly one note whose `sources` includes ≥ 1 official URL; no best-practice claim lacks a source; every discarded type has a logged reason and no note; the parent context contains no fetched page content." Example of a correct output: the note block in `## Outputs` above.
