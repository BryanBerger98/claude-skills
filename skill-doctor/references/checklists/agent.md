# Checklist: subagent audit

Apply to `agents/*.md` files (project or user-level).

## Frontmatter

- [ ] `name:` kebab-case, matches filename (sans `.md`)
- [ ] `description:` present
- [ ] Description states the agent's narrow domain
- [ ] Description states WHEN to delegate to this agent
- [ ] Description includes negative triggers ("Do NOT use for X")
- [ ] Description mentions expected input shape
- [ ] Description mentions output shape returned
- [ ] `tools:` field present only if scope must be restricted (else omit or `*`)
- [ ] `model:` field present only if non-default model required

## System prompt body

- [ ] Doesn't restate Claude Code base instructions (harness inherits them)
- [ ] States agent's role/expertise specifically
- [ ] Documents output format expected
- [ ] Documents domain-specific anti-patterns
- [ ] States when agent should refuse / escalate
- [ ] No conflicting guidance with `description:`

## Tool scope (if `tools:` restricted)

- [ ] Listed tools match stated role (read-only agent has no Edit/Write)
- [ ] MCP tools listed by full name (e.g., `mcp__server__tool`)
- [ ] No tools required by workflow but missing from scope

## Delegation discipline

- [ ] Agent doesn't duplicate work of an existing sibling agent
- [ ] If parallel/independent work expected, agent designed to be spawned concurrently
- [ ] Returns concise summary, not raw tool output dumps (subagent results are unseen by user; only main agent's relay is)

## Input/output contract

- [ ] Prompt input shape stated ("expects: <X>")
- [ ] Output format stated ("returns: <Y>")
- [ ] Length cap suggested where relevant ("report under 200 words")

## Coherence

- [ ] No other agent with overlapping description
- [ ] If agent invoked by a skill, that skill references it correctly
- [ ] Bundled in `.claude/agents/` (project) vs. `~/.claude/agents/` (user) — appropriate scope

## Trigger test

5 prompts that should delegate to this agent + 5 that shouldn't. Verify:

- Description language matches positive cases
- Description doesn't bleed into negative cases
- Negative triggers explicitly block the negative cases
