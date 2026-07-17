# 02 — Audit setup

Delegate the inventory of the existing Claude Code setup to the `setup-auditor` agent, so raw frontmatters and settings never enter the parent context. Runs in parallel with `03-research-docs`.

## Inputs

- `need_brief` (required) — validated brief from `frame-need`; a few-line digest of it drives the agent's relevance filter.
- `project_root` (required) — target project path for the project-side scan.

## Outputs

The classified inventory table and reuse shortlist returned by the agent, held in conversation context. Not written to any file.

```markdown
| Type  | Name              | Location                     | Classification   | Note                                        |
| ----- | ----------------- | ---------------------------- | ---------------- | ------------------------------------------- |
| skill | generate-skill    | ~/.claude/skills (global)    | reuse            | builds any skill the plan proposes          |
| agent | codebase-explorer | .claude/agents (project)     | extend           | could feed the review flow with code maps   |
| skill | fix-errors        | ~/.claude/skills (global)    | duplication-risk | overlaps a proposed "auto-fix" component    |

Top reuse candidates:
- generate-skill — builds every skill-type component in the plan.
```

## Depends on

- `01-frame-need`

## Process

1. Spawn the `setup-auditor` agent (Agent tool) in the same message as the `research-docs` delegation — the two run in parallel. Pass it: a ≤ 5-line digest of the need brief and `project_root`.
2. The agent scans global + project setup (frontmatter only), classifies against the need (`reuse` / `extend` / `duplication-risk`), drops unrelated components, and returns the table above.
3. On receipt, spot-check one `Location` with `ls` before relying on the table; relay any `Gaps:` line to the user.
4. Do NOT re-scan in the parent — if the table looks incomplete, re-invoke the agent with a sharpened digest instead.

## Test

**Pattern C — LLM assertion with example:**
Assert: "The parent context contains only the returned table and shortlist — no raw frontmatter or settings dump; every row carries a real on-disk location; every row has one of the three classifications; unrelated components are absent." Example of a correct output: the table in `## Outputs` above.
