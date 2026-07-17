---
name: generate-skill
description: Generate and maintain router-based Claude Code skills — SKILL.md router + atomic testable actions + TDD evaluations. Use when the user wants to create a new skill, refactor an existing skill, add or remove actions, or migrate a slash command into a skill. Do NOT use for editing a single action inside an existing skill (edit directly), creating slash commands (no router needed), writing MCP servers, or modifying project-level CLAUDE.md files.
version: 2.0.0
license: MIT
author: AI-Driven Dev
---

# Generate Skill

Produces Claude Code skills following a router-based architecture: SKILL.md as pure router, actions as atomic testable operations, evaluations written BEFORE implementation (strict TDD).

## Available actions

| #   | Action              | Role                                                | Input              |
| --- | ------------------- | --------------------------------------------------- | ------------------ |
| 01  | `capture-intent`    | Clarify output + decide generate vs modify          | user intent        |
| 02  | `design-evals`      | Write the 3 scenarios (should/should_not/ambiguous) | expected output    |
| 03  | `decompose-actions` | List actions + their tests                          | evals + output     |
| 04  | `draft-skill`       | Write SKILL.md router                               | decomposed actions |
| 05  | `write-actions`     | Write each action file                              | validated SKILL.md |
| 06  | `validate`          | Run evals, fix loop                                 | complete skill     |

## Default flow (strict TDD)

`01 → 02 → 03 → 04 → 05 → 06`. No skipping allowed.

## Modify flow

`01` (detects modify) → `03` (re-decompose if structure changes) → `05` (targeted edit) → `06` (re-validate).

## Level-1 rules (non-negotiable)

### Structure
- **R1** — SKILL.md is a pure router: description + action table + transversal rules. Zero business logic.
- **R2** — One skill = one domain (tool OR activity). Actions are the domain's operations.
- **R3** — References one-level deep only. Never chain reference → reference.
- **R4** — SKILL.md ≤ 500 lines. If exceeded, split into references.

### Naming
- **R5** — Tool domain = singular noun (`slack`, `notion`, `github`). Activity domain = action verb (`review`, `plan`, `test`).
- **R6** — Description must include: (a) what, (b) explicit triggers, (c) a "Do NOT use for..." clause. Format constraints (third person, char caps, reserved words) live in `references/naming-conventions.md` — single source.

### Data
- **R7** — Zero duplication. Data lives in the broadest scope possible: cross-skill → shared repo folder; skill-specific → `<skill>/assets/` or `<skill>/references/`. No copies; references point.
- **R8** — Two-role split:
  - `references/` = **documents to READ** (conventions, decision guides, cheatsheets, API notes) — knowledge consumed by the agent to reason correctly.
  - `assets/` = **templates to COPY or data to INJECT** at runtime (skeletons, JSON templates, ID tables, prompt fragments) — raw material consumed by actions.
  - Heuristic: a file that only explains *how things work* → `references/`. A file that is *copied or injected as-is* → `assets/`.

### Test & evaluation
- **R9** — Every action has a `## Test` with a concrete verification — the sine qua non. Pick the form pragmatically: a JS script in `scripts/` when the check is deterministic (parseable / on-disk); an MCP runbook when the verification needs an external system ("verify Slack post via `mcp__slack__slack_get_channel_history`"); an LLM assertion with a concrete example when neither fits. What matters is that a verification actually runs.
- **R10** — Every skill has `evals/scenarios.json` with ≥ 3 `should`, ≥ 3 `should_not`, ≥ 1 `ambiguous`.
- **R11** — Strict TDD: output → evals → action tests → SKILL.md → actions. Never the reverse.

### Execution
- **R12** — When writing a script is the right choice (R9), use JavaScript (Node) — avoid Python unless a JS equivalent is impractical. "Solve, don't punt": scripts handle their own errors and print actionable diagnostics.

## References (documents to read)

- `references/naming-conventions.md` — tool vs activity naming rules, hard constraints
- `references/skill-vs-command.md` — decision guide: skill vs slash command vs hook

## Assets (templates to copy)

- `assets/skill-template.md` — SKILL.md skeleton to copy and fill
- `assets/action-template.md` — action file skeleton to copy and fill
- `assets/evals-template.md` — `scenarios.json` structure and concrete example

## Invocation

All validator invocations in this skill assume the working directory is the **repository root** (the directory that contains `.claude/`). The canonical form is:

```bash
node .claude/skills/generate-skill/scripts/validate-all.js <path-to-target-skill>
```

The target path can be relative to cwd (e.g. `.claude/skills/<your-skill>`) or absolute. Each validator script also accepts no argument — it then defaults to the generate-skill directory itself (self-validation).

## Distribution

- **Version, license, author**: declared in the frontmatter above.
- **Status**: stable, self-validating, portable.
- **Dependencies**: Node.js ≥ 18 (the validator scripts use no external packages).
- **Usage by other teams**: copy the `generate-skill/` folder into your `.claude/skills/` directory. The skill makes no organization-specific assumptions — every doctrine reference in a generated skill is a placeholder you fill in with paths from your own repo.
