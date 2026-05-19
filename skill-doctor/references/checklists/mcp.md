# Checklist: .mcp.json audit

Apply to `.mcp.json` (project root or user-level config).

## File location

- [ ] `.mcp.json` at project root (not nested) if project-scoped
- [ ] User-level MCP config in `~/.claude/mcp.json` or via `settings.json` `mcpServers` block
- [ ] No duplicate server definitions across scopes (project + user merge → confusion)

## Schema

- [ ] Valid JSON (no trailing commas, balanced braces)
- [ ] `mcpServers` root key present
- [ ] Each server entry has `command` (stdio) or `url` (sse/http)
- [ ] `type` field present and matches transport (`stdio` / `sse` / `http`)

## Per-server checks

For each server:

- [ ] Server name kebab-case, unique
- [ ] Command exists on PATH (or absolute path resolves)
- [ ] Args properly quoted, no shell injection risk
- [ ] Env vars use `${VAR}` interpolation, not hardcoded secrets
- [ ] Required env vars documented (README / CLAUDE.md)
- [ ] Server actually used by a skill, agent, or known workflow (else: dead config)

## Security

- [ ] No API tokens / passwords inline
- [ ] No `.env` paths pointing outside repo
- [ ] No servers from untrusted sources without note

## Performance / scope

- [ ] No heavy MCP server enabled for projects that don't need it (slow startup)
- [ ] Servers needed only occasionally → consider user-level toggle vs. always-on
- [ ] No server duplicating built-in Claude Code capability (e.g., custom filesystem MCP when Read/Edit suffice)

## Documentation

- [ ] Each server's purpose noted somewhere (CLAUDE.md or comment in README)
- [ ] Setup instructions for required env vars present
- [ ] Auth flow documented (OAuth callback, token refresh, etc.)

## Common issues

| Symptom                      | Check                                             |
| ---------------------------- | ------------------------------------------------- |
| Server fails to start        | command on PATH? env vars set?                    |
| Tool not appearing in Claude | server's tool name shadowed by another?           |
| Slow Claude Code startup     | too many MCP servers always-on?                   |
| Duplicate tools in tool list | server defined in both project and user scope     |
| Auth loop                    | OAuth tokens not persisted, or callback URL wrong |

## Output for user

For each server: status (OK / WARN / FAIL), one-line issue, recommended action.
