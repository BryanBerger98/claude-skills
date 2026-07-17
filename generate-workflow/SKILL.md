---
name: generate-workflow
description: Designs an agentic-automation architecture from a user's expressed AI-workflow need. Frames the need in depth via AskUserQuestion, audits the existing Claude Code setup, grounds every choice in official Claude Code / Anthropic documentation, and writes a prioritized architecture plan (agents, skills, rules, hooks, MCP tools, plugins, scheduled agents) with a handoff to the skills that build each component. Use when the user describes a workflow pain to automate, asks how to structure agents/skills/hooks for a process, or requests an agentic architecture plan. Do NOT use for building a single component with a clear spec — use `generate-skill` (skills) or `generate-agent` (agents) — nor for codebase architecture (use `improve-codebase-architecture`) or direct settings/hook changes (use `update-config`).
---

# Generate Workflow

Turns a fuzzy "I want AI to help me with X" into a grounded architecture plan: which Claude Code components to build (agents, skills, rules, hooks, MCP tools, plugins, scheduled agents, CI or Agent SDK pieces), why, in what order, and which builder skill constructs each one. The skill produces exactly one file — `.claude/docs/architecture/<slug>.md` in the target project — and never builds components itself.

## Available actions

| #   | Action          | Role                                                                                                                                                     | Input                |
| --- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 01  | `frame-need`    | Deep-dive the need via AskUserQuestion (pain, current workflow, ROI, constraints, scope) into a user-validated need brief                                | free-form user need  |
| 02  | `audit-setup`   | Delegate to the `setup-auditor` agent: inventory global (`~/.claude`) and project (`.claude/`) components, classified reuse / extend / duplication-risk  | need brief           |
| 03  | `research-docs` | Select candidate types from the brief, then delegate collection to the `docs-researcher` agent: catalog first, one targeted live fetch per retained type | need brief           |
| 04  | `write-plan`    | Compose the architecture and write the plan file with ROI-ordered build sequence and builder-skill handoff                                               | all upstream outputs |

## Default flow

`01 → (02 ∥ 03) → 04`. No skipping allowed. After `frame-need`, actions 02 and 03 each depend only on the brief: spawn both agents in a single message so they run in parallel; `write-plan` starts once both have returned.

Entry gates, checked before starting `01`:

- Request is a **single component with a clear spec** (one skill, one agent, one hook) → redirect to `generate-skill`, `generate-agent`, or `update-config` and stop.
- Request is **ambiguous between a single component and a system** → ask one clarifying question first; route accordingly.

## Transversal rules

- **One writing target.** The skill writes exactly one file: `.claude/docs/architecture/<slug>.md` (slug = kebab-case of the need). Everything else is read-only; component construction is always handed off.
- **Sourced claims only.** Every best-practice recommendation in the plan carries its source URL — from `references/component-catalog.md` or from the live fetch in `research-docs`. No doc claim from memory.
- **Language split.** AskUserQuestion dialogs follow the user's conversation language; the plan file is an authored artifact and is written in English.
- **Questioning discipline.** AskUserQuestion is the only questioning mechanism; batch related questions (≤ 4 per call) and always offer a recommended option first.
- **Handoff vocabulary.** The plan maps each component to its builder: skill → `generate-skill`, subagent → `generate-agent`, hook/permission/env → `update-config`, scheduled agent → `schedule`, everything else (MCP server, plugin, CI, Agent SDK) → manual step with its official doc URL.
- **Collection is delegated, synthesis is not.** Actions 02 and 03 run through their dedicated agents — raw frontmatters, settings dumps, and fetched doc pages never enter the parent context. `frame-need` (user dialogue) and `write-plan` (synthesis) always stay in the parent.

## Agents (spawned by this skill)

- `agents/setup-auditor.md` — read-only setup inventory, classified against the need. Used by `audit-setup`.
- `agents/docs-researcher.md` — sourced best-practice notes from official docs, retained types only. Used by `research-docs`.

Both must be registered where the Agent tool resolves them (symlink or copy into `~/.claude/agents/`, or the target project's `.claude/agents/`).

## References (documents to read)

- `references/component-catalog.md` — Claude Code component types: what each is for, when to prefer which, official documentation URLs, distilled best practices, builder-skill mapping.

## Assets (templates to copy or data to inject)

- `assets/plan-template.md` — skeleton of the architecture plan file, copied then filled by `write-plan`.

## Scripts

- `scripts/validate-plan.js <plan-file>` — checks a produced plan contains every required section; used as the `write-plan` test.
