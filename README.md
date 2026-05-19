# claude-skills

Personal Claude Code skills.

## Skills

### skill-doctor

Audit, diagnose, and improve existing Claude Code primitives — skills, subagents, prompts, `.mcp.json`, `CLAUDE.md`, or full `.claude/` trees.

**Triggers on:** audit / review / diagnose / analyze / benchmark / test / "why isn't X working" + a named target.

**Does not create** new primitives from scratch — use `prompt-creator` or `subagent-creator` for that.

**Workflow:** identifies target → sets audit focus → gathers context in parallel → produces scored report (Trigger / Structure / Tokens / Coherence / Quality, each /5) → proposes fixes → dispatches rewrites to bundled builder agents (`prompt-builder`, `subagent-builder`) → re-measures → loops until done.
