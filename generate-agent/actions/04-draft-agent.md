# 04 — Draft agent

Write the agent file. Frontmatter is the routing contract; the body is the system prompt.

## Inputs

- Agent spec (from 01), practice notes (from 02).
- `<destination>/evals/<agent-name>.json` (from 03) — MUST exist before this action runs (A5).

## Outputs

`<destination>/<agent-name>.md` following `assets/agent-template.md`. Example frontmatter:

```yaml
---
name: hooks-auditor
description: Read-only inventory of project hooks and settings — lists every hook, its trigger, and its script with file:line evidence. Use proactively before changing hook configuration. Never edits settings; for changes use `update-config`.
tools: Read, Grep, Glob
---
```

## Depends on

- `02-research-practices`
- `03-design-evals`

## Process

1. Copy `assets/agent-template.md` and fill each `<placeholder>` per its inline annotation.
2. Frontmatter per the practice notes:
   - `name`: lowercase letters/digits/hyphens, ≤ 64 chars, no `anthropic`/`claude`. Keep the filename identical to `name` (house convention — evals resolve by name).
   - `description` (A2): what + delegation trigger ("Use when ...", "Use proactively ...") + boundary clause naming the competing agent for near-misses.
   - `tools` (A3): minimal comma-separated allowlist. Omitting the field inherits ALL tools — only do so with the justification captured in 01. `disallowedTools` may complement it. Never list tools unavailable to subagents (e.g. `AskUserQuestion`).
   - `model` (A4): `haiku` | `sonnet` | `opus` (or a full model ID). Omit the field to inherit the parent model.
3. Body = system prompt, following the official shape: role sentence → numbered process ("When invoked: 1. ...") → output format (the final message is consumed by the parent as data — specify its exact shape) → boundaries (what the agent must never do, phrased as behavior: "You cannot modify files. If asked to, explain ...").
4. Walk every `should_delegate` eval prompt against the description alone — if a scenario would not route, fix the description now, not in 05.
5. Modify flow: targeted `Edit` on the existing file; leave untouched sections byte-identical.

## Test

```bash
node ~/.claude/skills/generate-agent/scripts/validate-agent.js <destination>/<agent-name>.md
```
