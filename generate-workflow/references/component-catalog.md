# Claude Code component catalog

Internal best-practice reference for the `research-docs` action. Read only the entries for the component types retained for the current need. All URLs verified 2026-07-13; if one 404s at runtime, find the moved page via `curl -s https://code.claude.com/docs/sitemap.xml`.

## Decision table — need signal → component type

| Need signal                                                         | Component type            |
| ------------------------------------------------------------------- | ------------------------- |
| Reusable procedure or domain knowledge, applied on demand           | Skill                     |
| Context isolation, parallel fan-out, or restricted tool access      | Subagent                  |
| Deterministic guarantee on an event (tool call, session, file edit) | Hook                      |
| Standing behavioral rule active in every session                    | CLAUDE.md rule            |
| One-shot explicit transformation, no routing, no external data      | Slash command             |
| Connect an external system (API, database, SaaS)                    | MCP server                |
| Distribute a bundle (skills + agents + hooks + MCP) to a team       | Plugin                    |
| Recurring unattended run on a schedule                              | Scheduled agent (routine) |
| Trigger on repository events (PR opened, issue labeled)             | GitHub Actions / headless |
| Productized agent living outside the terminal                       | Agent SDK app             |

Signals compose: one need usually yields 2–4 component types, not one.

## Skill

- **What**: markdown-defined capability (SKILL.md + resources) that the model loads on demand via description matching.
- **When**: reusable procedure or knowledge, invoked by varying phrasings, benefiting from bundled references/assets.
- **Best practices**: the description is the trigger — third person, explicit positive triggers and a "Do NOT use for" clause; progressive disclosure — keep SKILL.md small, push depth into `references/` loaded on demand; one skill = one domain.
- **Docs**: <https://code.claude.com/docs/en/skills> · <https://code.claude.com/docs/en/best-practices>
- **Builder**: `generate-skill`.

## Subagent

- **What**: named agent with its own system prompt, tool allowlist, and model tier, spawned via the Agent tool.
- **When**: isolate context from the parent, parallelize independent work, or enforce least-privilege tool access.
- **Best practices**: single responsibility; restrict tools to the minimum — omitting `tools` inherits ALL tools of the main conversation, so read-only must be made explicit via an allowlist, it is never the default; cheapest capable model (Haiku mechanical, Sonnet scoped research, Opus planning — house doctrine; official `model` aliases are `sonnet`/`opus`/`haiku`/`fable`, plus a full model ID or `inherit`, the default); description states when to invoke it.
- **Docs**: <https://code.claude.com/docs/en/sub-agents>
- **Builder**: `generate-agent`.

## Hook

- **What**: shell command executed deterministically on harness events (PreToolUse, PostToolUse, SessionStart, Stop…), configured in `settings.json`.
- **When**: a guarantee that must hold even when the model forgets — blocking, rewriting, or reacting to events. Prompting is advisory; hooks are enforcement.
- **Best practices**: fast and non-interactive; validate inputs defensively; exit codes drive allow/block; keep logic in a script file, not inline JSON.
- **Docs**: <https://code.claude.com/docs/en/hooks> · <https://code.claude.com/docs/en/hooks-guide>
- **Builder**: `update-config`.

## CLAUDE.md rule

- **What**: standing instruction loaded into every session — global (`~/.claude/CLAUDE.md`) or per-project (`CLAUDE.md`).
- **When**: behavioral rule that must always apply and needs no dispatch (style, language, tool preferences).
- **Best practices**: short and universal — every line costs context in every session; scope to the narrowest file (project vs global); no procedures that belong in a skill.
- **Docs**: <https://code.claude.com/docs/en/memory>
- **Builder**: direct edit (no dedicated skill); `claude-memory` for memory workflows.

## Slash command

- **What**: single markdown prompt file invoked explicitly as `/<name>`.
- **When**: exactly one action, always the same, user-triggered — no routing, no bundled data.
- **Best practices**: if it grows a second action or external data, promote it to a skill.
- **Docs**: <https://code.claude.com/docs/en/slash-commands>
- **Builder**: `generate-skill` (its capture-intent action detects the slash-command case and produces one).

## MCP server

- **What**: Model Context Protocol server exposing external-system tools (`mcp__<server>__<tool>`).
- **When**: the workflow must read or act on an external system (Jira, Notion, DB, browser…).
- **Best practices**: prefer official servers; least-privilege credentials; project-scope via `.mcp.json` when team-shared; account for token cost of large tool inventories.
- **Docs**: <https://code.claude.com/docs/en/mcp>
- **Builder**: manual step (`claude mcp add` or `.mcp.json`), doc URL in the handoff.

## Plugin

- **What**: distributable bundle of skills, agents, hooks, MCP servers, and commands, installable from a marketplace.
- **When**: several components must ship together to a team or across machines with one install.
- **Best practices**: bundle only what belongs to one coherent workflow; version it; keep org-specific config out (inject via settings).
- **Docs**: <https://code.claude.com/docs/en/plugins>
- **Builder**: manual step (`/plugin`), doc URL in the handoff.

## Scheduled agent (routine)

- **What**: cloud agent executing on a cron schedule, independent of an open session.
- **When**: recurring unattended task (daily digest, weekly cleanup, monitoring) — time-triggered, not user- or event-triggered.
- **Best practices**: idempotent runs; explicit output destination (file, PR, notification); mind interactive-auth MCP servers being absent headless.
- **Docs**: <https://code.claude.com/docs/en/routines>
- **Builder**: `schedule` skill.

## GitHub Actions / headless

- **What**: Claude Code run non-interactively (`claude -p`) or via the official GitHub Action on repository events.
- **When**: the trigger lives in the repo lifecycle (PR review, issue triage, release notes) rather than in a session.
- **Best practices**: pin permissions of the CI token; bounded prompts with explicit output contract; fail the job on unexpected output.
- **Docs**: <https://code.claude.com/docs/en/github-actions> · <https://code.claude.com/docs/en/headless>
- **Builder**: manual step (workflow YAML), doc URL in the handoff.

## Agent SDK app

- **What**: standalone agent built on the Claude Agent SDK (TypeScript/Python) — the Claude Code engine outside the terminal.
- **When**: the workflow must run as a product or service (UI, API, non-developer users), beyond what sessions and routines cover.
- **Best practices**: reuse skills/MCP definitions rather than re-encoding logic; start from the SDK's session primitives; budget for hosting and auth.
- **Docs**: <https://code.claude.com/docs/en/agent-sdk/overview>
- **Builder**: manual step (dedicated project), doc URL in the handoff.

## Cross-cutting sources

- Claude Code best practices: <https://code.claude.com/docs/en/best-practices>
- Building effective agents (architecture patterns — workflows vs agents, when NOT to add complexity): <https://www.anthropic.com/engineering/building-effective-agents>
- Writing tools for agents (tool/MCP design): <https://www.anthropic.com/engineering/writing-tools-for-agents>
- Settings reference (where every configuration lives): <https://code.claude.com/docs/en/settings>
