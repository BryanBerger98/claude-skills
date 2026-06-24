# 01 — Intake

Capture and scope the reported problem. Establish an unambiguous problem statement before any code is read. Never investigate a guess.

## Inputs

- `problem` (required) — string. The user's raw description of the bug, regression, unexpected behavior, or inconsistency.

## Outputs

A scoped problem record held in context and passed to `investigate`. Also fixes the report `slug`.

```text
title       = "Users logged out randomly after deploy"
slug        = users-logged-out-after-deploy
symptom     = "session drops within minutes of login since the 2026-06-20 deploy"
expected    = "session persists for its configured TTL"
scope_hints = ["auth middleware", "session store", "the 2026-06-20 deploy diff"]
open_qs     = []        # empty only once nothing blocks investigation
```

## Process

1. Restate the problem in one sentence: observed vs. expected. Confirm it back to the user.
2. Derive a kebab-case `slug` from the title — this names the report at `.claude/docs/analysis/<slug>.md`.
3. Gather anchors: when it started (deploy, commit, version), where it shows (route, screen, input), reproduction steps if any.
4. List ambiguities that would change the investigation. If any are blocking, **ask the user and wait** — do not proceed on assumptions. Re-ask until `open_qs` is empty.
5. Sanity-check scope: if the request is actually a quick fix with no report wanted, a diff review, or a broad refactor, say so and point to `fix-errors` / `code-review` / `improve-codebase-architecture` instead of proceeding.
6. Hand the scoped record to `investigate`.

## Test

LLM assertion: a one-sentence observed-vs-expected statement and a kebab-case slug exist; every blocking ambiguity was either resolved by a user answer or surfaced as an explicit question — none were silently assumed.

Example of a correct intake outcome:
```text
title:   "Cart total differs between API and UI"
slug:    cart-total-api-ui-mismatch
open_qs: []   # user confirmed: web checkout, not mobile; reproduced on staging
```
