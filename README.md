# claude-skills

Personal Claude Code skills.

## Skills

### skill-doctor

Audit, diagnose, and improve existing Claude Code primitives — skills, subagents, prompts, `.mcp.json`, `CLAUDE.md`, or full `.claude/` trees.

**Triggers on:** audit / review / diagnose / analyze / benchmark / test / "why isn't X working" + a named target.

**Does not create** new primitives from scratch — use `prompt-creator` or `subagent-creator` for that.

**Workflow:** identifies target → sets audit focus → gathers context in parallel → produces scored report (Trigger / Structure / Tokens / Coherence / Quality, each /5) → proposes fixes → dispatches rewrites to bundled builder agents (`prompt-builder`, `subagent-builder`) → re-measures → loops until done.

### ultrabrain

Run an intensive, facilitator-led brainstorming session for product/feature or technical/architecture problems — generating breadth of options, not analysis of a single answer.

**Triggers on:** brainstorm / ideate / generate ideas / explore options / "run an ideation session" + a named challenge, or `/ultrabrain`.

**Does not use** for stress-testing an existing plan (use `grilling`), reasoning through one hard problem (use `ultrathink`), reviewing code (use `code-review`), or authoring a skill (use `generate-skill`).

**Workflow:** frame the challenge in dialogue (How Might We + success criteria + constraints) → diverge widely with zero judgment across ≥3 techniques (inversion, analogies, SCAMPER, Six Thinking Hats) → converge (cluster, score, prioritize) → synthesize a prioritized ideas document plus a concrete action plan for the chosen idea.
