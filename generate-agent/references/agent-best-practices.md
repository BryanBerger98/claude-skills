# Agent best practices (official, sourced)

Static grounding for `generate-agent`. Primary source: https://code.claude.com/docs/en/sub-agents (live fetch 2026-07-13). Each section states its source; anything not backed by an official page is explicitly tagged **[house doctrine]**. When a live fetch contradicts this file, the live source wins — flag and update this file (action 02, step 4).

## File anatomy

Source: https://code.claude.com/docs/en/sub-agents

- An agent is a Markdown file: YAML frontmatter + body. The body is the agent's **entire system prompt** — the subagent receives only this prompt plus basic environment details (working directory), not the full Claude Code system prompt.
- Only `name` and `description` are **required**. All other fields are optional.

| Field             | Required | Notes                                                                                                     |
| ----------------- | -------- | --------------------------------------------------------------------------------------------------------- |
| `name`            | yes      | Unique identifier, lowercase letters and hyphens. Hooks receive it as `agent_type`. The filename need not match `name` officially — keeping them identical is **[house doctrine]** (evals resolve by name). |
| `description`     | yes      | The delegation trigger — see below.                                                                        |
| `tools`           | no       | Comma-separated **allowlist**. **Omitted = inherits ALL tools** of the main conversation (including write tools). Read-only is a design choice to make explicit, never a default. |
| `disallowedTools` | no       | Denylist, applied BEFORE `tools` is resolved; a tool present in both is removed.                           |
| `model`           | no       | `sonnet` \| `opus` \| `haiku` \| `fable` \| full model ID (e.g. `claude-opus-4-8`) \| `inherit`. **Omitted = `inherit`.** |
| others            | no       | `permissionMode`, `maxTurns`, `skills`, `mcpServers`, `hooks`, `memory`, `background`, `effort`, `isolation`, `color`, `initialPrompt` — see source for details. |

## Locations and precedence

Source: https://code.claude.com/docs/en/sub-agents

On name collision, highest priority wins: managed settings (org) → `--agents` CLI flag (session-only) → project `.claude/agents/` → user `~/.claude/agents/` → plugin `agents/`. Project agents are discovered walking up from cwd; the definition closest to the working directory wins. Duplicate names in the SAME directory resolve by filesystem read order (undocumented behavior) — `/doctor` flags them.

## Description = delegation trigger

Source: https://code.claude.com/docs/en/sub-agents

- Official: "Claude automatically delegates tasks based on the task description in your request, the `description` field in subagent configurations, and current context."
- Official tip: "Write detailed descriptions: Claude uses the description to decide when to delegate."
- To encourage proactive delegation, include phrases like **"use proactively"** (official examples: "Expert code reviewer. Use proactively after code changes.").
- **[house doctrine — A2]** The description must carry three parts: (a) what the agent does, (b) an explicit trigger ("Use when ...", "Use proactively ..."), (c) a boundary clause naming the competing agent for near-miss tasks ("Never edits source", "Do NOT use for X — use `investigator`").

## Tool scoping

Source: https://code.claude.com/docs/en/sub-agents

- Official tip: "Limit tool access: grant only necessary permissions for security and focus."
- `tools` and `disallowedTools` accept MCP patterns (`mcp__<server>`, `mcp__<server>__*`; `mcp__*` strips all MCP tools).
- `Agent(type1, type2)` restricts which subagent types the agent may spawn; bare `Agent` = unrestricted; omitting `Agent` = cannot spawn subagents.
- Some tools are **never available to subagents** even if listed: `AskUserQuestion`, `EnterPlanMode`, `ExitPlanMode` (unless `permissionMode: plan`), `ScheduleWakeup`, `WaitForMcpServers`. Never put them in a generated agent's `tools`.
- **[house doctrine — A3]** A read-only role never carries `Write`, `Edit`, or `NotebookEdit`.

## Model selection

- Valid aliases and default: see File anatomy table (source: https://code.claude.com/docs/en/sub-agents). Resolution order when a subagent runs: `CLAUDE_CODE_SUBAGENT_MODEL` env var → per-invocation parameter → frontmatter `model` → main conversation's model.
- **[house doctrine — A4]** Cheapest capable tier: `haiku` for mechanical work, `sonnet` for scoped research/exploration, `opus` for planning and tradeoffs. Not stated on the official page in these terms — it is the user's delegation doctrine (global CLAUDE.md). Omit the field when no tier is clearly cheaper-and-sufficient.

## System prompt structure

Source: https://code.claude.com/docs/en/sub-agents (official tips + worked examples)

- "Design focused subagents: each subagent should excel at one specific task" — single responsibility (A1).
- Official worked examples consistently follow this shape, mirrored by `assets/agent-template.md`:
  1. Role sentence ("You are a senior code reviewer ...").
  2. Numbered process ("When invoked: 1. ...").
  3. Domain checklist where relevant.
  4. Explicit output-format section (the parent consumes the final message as data).
  5. Explicit boundary statement, phrased as behavior ("You cannot modify data. If asked to INSERT/UPDATE/DELETE ... explain that you only have read access.").
- "Check into version control: share project subagents with your team."

## Testing and evals

- **No official methodology exists** for testing subagent behavior (verified against the sub-agents page, 2026-07-13; only tangential mentions: `--agents` CLI flag for session-only quick testing, `/doctor` duplicate-name detection).
- **[house doctrine — A5/A6]** Invocation evals are this skill's own doctrine: ≥ 3 `should_delegate`, ≥ 3 `should_not_delegate`, ≥ 1 `ambiguous`, written before the agent file, persisted at `<dest>/evals/<agent-name>.json`, judged against the description alone. See `assets/agent-evals-template.md`.
