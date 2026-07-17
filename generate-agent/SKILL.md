---
name: generate-agent
description: Generates and modifies optimized Claude Code agents (subagent .md files) through a strict TDD pipeline — deep need investigation via AskUserQuestion, official-docs grounding, invocation evals written before the agent, structural validation. Use when the user asks to create a new agent or subagent, fix an existing agent's description or delegation routing, tighten an agent's tool scope or model choice, or backfill invocation evals for an existing agent. Do NOT use for authoring skills (use `generate-skill`), for designing multi-component agentic architectures (use `generate-workflow`), for invoking an existing agent on a task (use the Agent tool directly), or for hooks and settings changes (use `update-config`).
version: 1.0.0
license: MIT
author: Bryan Berger
---

# Generate Agent

Produces Claude Code agents that route correctly and stay in scope: a validated agent file (frontmatter + system prompt) at the destination the user picks, plus persistent invocation evals in `<dest>/evals/<agent-name>.json`, both passing structural validators. Evaluations are written BEFORE the agent (strict TDD), and every best-practice decision traces to an official source.

## Available actions

| #   | Action               | Role                                                                                       | Input                       |
| --- | -------------------- | ------------------------------------------------------------------------------------------ | --------------------------- |
| 01  | `capture-need`       | Deep-dive the need via AskUserQuestion into an agent spec; decide generate vs modify       | free-form user request      |
| 02  | `research-practices` | Ground the spec: static references first, one targeted live fetch for uncovered topics    | agent spec                  |
| 03  | `design-evals`       | Write invocation evals (delegate / not-delegate / ambiguous) BEFORE the agent file        | agent spec                  |
| 04  | `draft-agent`        | Write the agent .md (frontmatter + system prompt) from the template                        | spec + practice notes + evals |
| 05  | `validate`           | Run validators, walk every eval against the description, fix loop                          | agent file + evals          |

## Default flow (strict TDD)

`01 → 02 → 03 → 04 → 05`. No skipping allowed.

## Modify flow

`01` (detects modify, reads the existing agent and its evals) → `02` (only if the change touches a practice area not already grounded) → `03` (only if the agent has no evals yet — backfill) → `04` (targeted edit) → `05` (re-validate).

## Transversal rules (non-negotiable)

- **A1** — One agent = one responsibility. The `description` is the parent's routing contract, not documentation. If the need spans several missions, split into several agents.
- **A2** — Description must include: (a) what the agent does, (b) when the parent should delegate (explicit trigger phrasing), (c) a boundary clause ("Never ...", "Do NOT use for ... — use `<competing-agent>`").
- **A3** — Minimal tool scope: only the tools the role requires. A read-only role never carries `Write`, `Edit`, or `NotebookEdit`.
- **A4** — Cheapest capable model: `haiku` for mechanical work, `sonnet` for scoped research/exploration, `opus` for planning and tradeoffs. Omit the field to inherit the parent model when no tier is clearly cheaper-and-sufficient.
- **A5** — Strict TDD: invocation evals (`03`) are written and user-validated before the agent file (`04`). Never the reverse.
- **A6** — Evals persist at `<dest>/evals/<agent-name>.json`, versioned alongside the agent — re-validation must be possible at any time (modify flow, audits).
- **A7** — Every best-practice claim applied to the generated agent traces to `references/agent-best-practices.md` or to a live-fetched official source with its URL. No folklore.

## References (documents to read)

- `references/agent-best-practices.md` — official agent anatomy, frontmatter fields, locations and precedence, description-as-routing guidance, tool scoping, model selection, system prompt structure. Sourced; each section carries its origin URL.

## Assets (templates to copy)

- `assets/agent-template.md` — agent file skeleton to copy and fill
- `assets/agent-evals-template.md` — invocation evals schema (`<dest>/evals/<agent-name>.json`) and concrete example

## Invocation

Validators take the path to the generated agent's `.md` file. Canonical form (works from any project):

```bash
node ~/.claude/skills/generate-agent/scripts/validate-all.js <path-to-agent.md>
```

`validate-all.js` chains `validate-agent.js` (structure) and `validate-agent-evals.js` (evals — resolved as `<agent-dir>/evals/<agent-name>.json`). Each script also accepts its target directly.

## Distribution

- **Version, license, author**: declared in the frontmatter above.
- **Dependencies**: Node.js ≥ 18 (validator scripts use no external packages).
- **Usage by other teams**: copy the `generate-agent/` folder into your `.claude/skills/` directory. No organization-specific assumptions.
