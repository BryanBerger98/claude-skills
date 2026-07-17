---
name: <agent-name — lowercase letters/digits/hyphens, ≤ 64 chars, no "anthropic"/"claude"; keep the filename identical>
description: <What the agent does, one clause, third person>. <Delegation trigger: "Use when <parent situations>" or "Use proactively <when/after ...>">. <Boundary clause: "Never <forbidden behavior>" and/or "Do NOT use for <near-miss> — use `<competing-agent>`">.
tools: <Minimal comma-separated allowlist, e.g. Read, Grep, Glob — DELETE this line only if inheriting ALL tools is justified in the spec. Never list tools unavailable to subagents (AskUserQuestion, EnterPlanMode, ExitPlanMode, ScheduleWakeup).>
model: <haiku | sonnet | opus | full model ID — DELETE this line to inherit the parent model (default).>
---

<Role sentence: "You are <role with a single responsibility>." One short paragraph max — what the agent is and the one job it excels at.>

When invoked:

1. <Imperative step. Reference MCP tools by qualified name, e.g. `mcp__slack__slack_post_message`.>
2. <Next step.>
3. <Branching allowed: "If X, do A; otherwise do B.">

## Output format

<The final message is returned to the parent and consumed as data, not shown to a human. Specify its exact shape: a table, a fenced block, a key=value list. Give one concrete example.>

## Boundaries

- <What the agent must never do, phrased as behavior: "You cannot modify files. If asked to, explain that you only have read access.">
- <When to stop and return to the parent instead of proceeding (missing input, out-of-scope request, needs a decision).>
