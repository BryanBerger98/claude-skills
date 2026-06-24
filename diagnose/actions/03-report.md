# 03 — Report

Write the Markdown analysis report from the investigation findings. The report is the skill's primary artifact and the spine of the approval gate.

## Inputs

- `findings` (required) — the structured object from `investigate`.
- `slug` (required) — from `intake`; names the report file.

## Depends on

- `02-investigate`

## Process

1. Spawn the **`reporter`** subagent (Agent tool, `subagent_type: reporter`, model `haiku`). This is a local agent (`agents/reporter.md`) — a mechanical template fill, no reasoning required.
2. Copy `assets/report-template.md` to `.claude/docs/analysis/<slug>.md` (create `.claude/docs/analysis/` if absent). One report per problem — if the file exists for this slug, append/update in place, never fork.
3. Fill every section from `findings`: Problem, Reproduction & context, Root cause, and the four Impact subsections (Side effects / Regressions / Undesirable behaviors / Inconsistencies). Carry `file:line` evidence verbatim — never paraphrase a reference away.
4. Build **Proposed solutions** from `solution_seeds`: ≥ 2 options, each with approach, blast radius, effort, risk; mark one **Recommended**.
5. Set the metadata block: `status: awaiting-approval`, `created`, `severity`. Leave **Decision** as "Awaiting approval." and **Implementation** as "Pending approval." — those are filled by later actions only.
6. Hand the report path to `decide`.

## Outputs

A written report at `.claude/docs/analysis/<slug>.md` with `status: awaiting-approval`.

```text
.claude/docs/analysis/users-logged-out-after-deploy.md
  status: awaiting-approval
  sections filled: Problem, Reproduction, Root cause, Impact×4, Proposed solutions (A recommended, B)
  Decision: "Awaiting approval."   Implementation: "Pending approval."
```

## Test

```bash
node scripts/test-report-template.js
```

Validates that `assets/report-template.md` (the contract the reporter fills) contains every required section — Problem, Reproduction & context, Root cause, Impact analysis with its four dimensions, Proposed solutions, Decision, Implementation — plus the `status` field. A missing section fails the build before any report is ever generated.
