# 02 — Research practices

Ground every spec decision in official guidance. Static reference first; live fetch only for what it does not cover.

## Inputs

- Agent spec (from 01).

## Outputs

Practice notes held in conversation context — for each spec decision (description phrasing, tool scope, model, prompt structure), the applicable guideline and its source. Example shape:

```text
description → "use proactively" phrasing for proactive delegation — references/agent-best-practices.md §Description
tools       → allowlist Read, Grep, Glob; disallowedTools unnecessary — §Tool scoping
model       → omit (inherit default) — §Model
uncovered   → none
```

## Depends on

- `01-capture-need`

## Process

1. Read `references/agent-best-practices.md` in full.
2. List the spec aspects the reference does not cover (unusual frontmatter field, novel tool, new platform feature). An empty list is a valid outcome — state it explicitly.
3. For each uncovered aspect, make ONE targeted live fetch: delegate to the `docs-researcher` agent when available, otherwise WebFetch the official docs (`https://code.claude.com/docs/en/sub-agents` and neighbors). Every claim gets its URL.
4. If a live source contradicts the static reference, the live source wins: flag the discrepancy to the user and propose the reference update.
5. Produce the practice notes mapping each spec decision to its guideline + source.

## Test

LLM assertion: every recommendation in the practice notes carries a source (a reference section or a URL); the uncovered-aspects list is explicitly stated, even when empty. Example of a passing note: `tools → comma-separated allowlist; AskUserQuestion never available to subagents — references/agent-best-practices.md §Tool scoping`.
