# 01 — Capture need

Investigate the need in depth before any file is touched. Never assume — this action is AskUserQuestion-driven.

## Inputs

- Free-form user request about creating or modifying an agent.

## Outputs

The agent spec. Held in conversation context and passed to actions 02+ as-is — **not written to any file**. This block is illustrative, not a schema.

```text
intent       = generate | modify
agent_name   = <kebab-case, ≤ 64 chars, no reserved words>
role         = <one-sentence single responsibility>
triggers     = <when the parent should delegate to it>
boundaries   = <what it must never do + competing agents for near-miss tasks>
tools        = <minimal tool list, or explicit justification for inherit-all>
model        = haiku | sonnet | opus | inherit
destination  = <project>/.claude/agents/ | ~/.claude/agents/ | custom (e.g. agents/ in a skills repo)
```

## Process

1. Ask: "Create a new agent or modify an existing one?"
2. If `modify`: `ls` the destination agents directory, Read the target agent file and its evals (`<dest>/evals/<name>.json`) if present. Capture what must change and why (wrong routing? scope creep? new capability?). Jump to `04` — via `02` if the change touches an ungrounded practice area, via `03` first if the agent has no evals (backfill per A6).
3. If `generate`, investigate with AskUserQuestion — multiple rounds are expected, one theme per round:
   - **Mission**: single responsibility in one sentence (A1). Several missions → propose a split into several agents.
   - **Delegation triggers**: in which parent situations must this agent be chosen? Which near-miss situations must it NOT capture?
   - **Boundaries**: read-only or writing? What must it never touch? Which existing agent handles the near-misses?
   - **Tools**: derive the minimal set from the mission (A3); confirm anything unusual with the user.
   - **Model**: cheapest capable tier (A4); when unclear, ask what the hardest reasoning step is.
   - **Destination**: project `.claude/agents/` (or the repo's own agents folder in a skills repo) vs global `~/.claude/agents/`.
4. Collision check: `ls` the destination directory and scan registered agent descriptions. Two agents that could be chosen for the same parent task → merge, rename, or tighten descriptions. When in doubt, ask.
5. Validate `agent_name`: kebab-case, ≤ 64 chars, reserved words `anthropic` and `claude` forbidden.
6. Agent-vs-other-component heuristic: a user-invoked workflow → recommend `generate-skill` and stop; a multi-component automation → recommend `generate-workflow` and stop; an event-driven automation ("every time X happens") → recommend `update-config` (hooks) and stop.
7. Read the full spec back to the user and wait for written confirmation before `02`.

## Test

LLM assertion: all spec fields are set and confirmed by the user in writing; the collision check was run against the destination directory; the agent-vs-other-component heuristic was applied. Example of a passing state: a spec block quoted in conversation followed by an explicit user confirmation.
