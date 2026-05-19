# Checklist: full .claude/ directory audit

Apply to entire `.claude/` tree (project or user-level `~/.claude/`).

## Inventory

- [ ] `Explore` subagent run to list: skills/, agents/, commands/, hooks (settings.json), CLAUDE.md, .mcp.json
- [ ] Each skill/agent: real file vs. symlink documented
- [ ] Plugin-installed vs. user-installed vs. project-installed distinguished

## Coherence

- [ ] No two skills with overlapping `description:` trigger space
- [ ] No two agents with overlapping `description:` trigger space
- [ ] No skill claims to delegate to a missing agent
- [ ] No CLAUDE.md rule contradicts a skill or settings
- [ ] No settings permission contradicts a hook's expected behavior

## Dead code / orphans

- [ ] No skill directory without `SKILL.md`
- [ ] No agent file missing frontmatter
- [ ] No broken symlinks in `~/.claude/skills/`
- [ ] No `scripts/` referenced from SKILL.md but absent
- [ ] No `references/` files unreferenced anywhere

## Layering

- [ ] Project-specific knowledge in project `.claude/`, not user `~/.claude/`
- [ ] User-specific preferences in user `~/.claude/`, not project
- [ ] No `.local.json` settings committed accidentally
- [ ] No secrets in `.mcp.json` or `settings.json` (env interpolation only)

## CLAUDE.md hierarchy

- [ ] Each CLAUDE.md fits its scope (user/project/subdirectory)
- [ ] No duplication between user CLAUDE.md and project CLAUDE.md
- [ ] `@file.md` imports resolve to existing files
- [ ] Total CLAUDE.md context loaded < ~500 lines when summed across hierarchy

## Hooks

- [ ] Each hook in settings.json runs cleanly (no errors when triggered)
- [ ] No hook duplicates another's behavior
- [ ] Hooks are idempotent
- [ ] Hook output terse — doesn't spam conversation

## MCP

- [ ] `.mcp.json` (project) doesn't duplicate user-level MCP config
- [ ] All listed servers actually used by at least one skill/agent/workflow
- [ ] Env vars documented somewhere (README or CLAUDE.md)

## Permissions

- [ ] settings.json `permissions` allowlist matches actual tool use
- [ ] No overly broad allows (e.g., `Bash(*)` should be narrowed where possible)
- [ ] `settings.local.json` overrides are intentional

## Documentation freshness

- [ ] CLAUDE.md mentions files that still exist
- [ ] CLAUDE.md mentions commands/skills that still exist
- [ ] Skill references to other skills resolve

## Output for user

Produce a tree summary with:

- Each component (skill/agent/hook/MCP server)
- Status: OK / WARN / FAIL
- Top issue per component
- Recommended pruning list (orphans, dead refs)
- Recommended additions (gaps)
