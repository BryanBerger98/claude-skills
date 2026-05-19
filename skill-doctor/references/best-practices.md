# Claude Code best practices (distilled)

Source: official docs (`references/official-docs.md`) + observed failure modes. Refresh when official docs change.

## Skills

**Description (frontmatter `description:`)**

- Must describe WHAT the skill does AND WHEN to use it. Both halves required.
- Include 3-5 example trigger phrases ("Use when user asks to X, Y, or Z").
- Name competing/adjacent skills and clarify boundary ("Do NOT use for X — delegate to skill-Y").
- Length: 1-3 sentences. Too short → ambiguous trigger. Too long → noise.
- First word should be a verb describing the action.
- Avoid generic terms (helps, assists, works with). Use specific outcomes.

**Body (`SKILL.md`)**

- Lead with the workflow/algorithm, not background.
- Use H2 sections; short paragraphs; tables for comparisons.
- Keep body under ~500 lines. Heavy reference material → `references/*.md` files, linked.
- Include concrete examples (input → expected output).
- Document anti-patterns explicitly.
- State guardrails (what skill must NOT do).

**File layout**

```
skill-name/
├── SKILL.md           # entry, frontmatter + workflow
├── references/        # loaded on demand, not every invocation
├── scripts/           # executable helpers
└── agents/            # bundled subagent prompts (referenced, not auto-registered)
```

## Subagents

**Description (frontmatter)**

- States narrow domain. Broad descriptions → wrong delegation.
- Include positive triggers and negative ("Do NOT use for...").
- Mention input shape expected and output shape returned.

**System prompt body**

- Don't restate Claude Code base instructions. Subagent inherits them via harness.
- Focus on: domain expertise, output format, anti-patterns specific to this domain.
- Specify tool scope explicitly if `tools:` field restricts (read-only? specific MCP?).

**Tool scope (`tools:` field)**

- Default = inherit all. Restrict only when scope must be enforced (read-only agents).
- Listing `*` is equivalent to omitting the field.

## CLAUDE.md

- Convention, not documentation. State decisions, conventions, hard rules. Not architecture diagrams or file listings.
- Keep under ~200 lines per file. Long → split via `@import.md` syntax.
- Use imperative voice: "Always use trash, never rm" — not "We tend to prefer..."
- Lead with overrides ("IMPORTANT: these instructions override defaults") only when actually overriding.
- Rot risk: anything naming a specific file path or function will rot. Prefer rules over examples.

## .mcp.json

- Project-scoped MCP servers go here. Global servers go in user settings, not project file.
- Don't duplicate global servers — they merge and cause confusion.
- Env vars: use `${VAR}` interpolation; document required vars in nearby README/CLAUDE.md.
- Auth: never hardcode tokens. Use env or external credential helpers.
- Scope (`type`): `stdio` for local processes, `sse`/`http` for remote. Match transport to use case.

## Settings (settings.json / settings.local.json)

- `settings.json` = team-shared, committed. `settings.local.json` = user-local, gitignored.
- Permissions: prefer specific allowlists over broad `*`. Permissions inherit project → user → global.
- Hooks: keep idempotent and fast. Long hooks block the model.
- Status line, env vars, model selection live here.

## Hooks

- Triggers: `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SubagentStop`, `Notification`, `PreCompact`.
- Exit code 0 → success, non-zero → block tool / inject error. Stdout/stderr injected into conversation.
- Don't run network-heavy commands in `PreToolUse` for `Bash` — fires on every shell call.
- Hooks share context with Claude via stdout — keep output terse.

## Plugins / marketplaces

- Plugin = bundle of skills + agents + commands + hooks + MCP servers.
- Marketplace = git repo serving plugin manifests. Personal marketplaces work for distribution.
- `.claude-plugin/plugin.json` defines plugin manifest.
- Plugin skills appear with `plugin:skill-name` namespacing in skill lists.

## Prompts (general)

- Lead with role/goal, not pleasantries.
- Specify output shape explicitly (format, length, structure).
- Few-shot examples beat long descriptions for nuanced behavior.
- Include negative constraints ("do NOT do X") — Claude follows these reliably.
- For long context: put instructions LAST (closer to assistant turn) for best adherence.
- Use XML tags for structured input when sections matter.

## Token efficiency

- Move loaded-every-time content into `references/` files behind links.
- Don't restate framework/harness behavior — Claude Code already knows it.
- Avoid example bloat. 2-3 sharp examples > 10 mediocre.
- Strip filler: "In order to" → "to", "make use of" → "use", "at this point in time" → "now".
- Tables compress dense info better than bulleted prose.

## Common failure modes

| Symptom                        | Likely cause                                                            |
| ------------------------------ | ----------------------------------------------------------------------- |
| Skill never triggers           | Description too vague, or competing skill with broader description wins |
| Skill triggers on wrong intent | Description too broad, missing negative triggers                        |
| Subagent gives wrong format    | Output shape not specified in system prompt                             |
| CLAUDE.md ignored              | Buried under noise, or contradicts higher-priority instructions         |
| `.mcp.json` server fails       | Env var missing, transport mismatch, or duplicate in global config      |
| Hook spams output              | Not idempotent, or runs on too many triggers                            |
