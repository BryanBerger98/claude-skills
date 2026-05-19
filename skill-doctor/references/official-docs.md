# Official documentation index

Curated authoritative sources for Claude Code, Claude API, Anthropic SDK. Refresh via `scripts/fetch_docs.py` or WebFetch on demand.

**Refresh rule**: if `last_fetched` ≥ 7 days old, re-fetch before citing.

## Source-validation criteria

Only the following sources count as **Anthropic-validated** for citation. Reject any other origin when recommending behavior.

- `*.anthropic.com` (engineering blog, news, product, research, webinars)
- `docs.claude.com` / `code.claude.com` (canonical product docs)
- `resources.anthropic.com` and `www-cdn.anthropic.com` (PDFs, hubs)
- `anthropic.skilljar.com` (Anthropic Academy / official courses)
- `github.com/anthropics/*` (official org repos: skills, claude-code, courses, prompt-eng-interactive-tutorial, anthropic-cookbook)

Third-party content (community skills, awesome-lists, blog reposts) is excluded even when accurate. When in doubt, find the equivalent assertion on an Anthropic-owned URL above before citing.

## Claude Code (docs.claude.com)

| Topic               | URL                                                               | last_fetched |
| ------------------- | ----------------------------------------------------------------- | ------------ |
| Skills overview     | <https://docs.claude.com/en/docs/claude-code/skills>              | 2026-05-19   |
| Subagents           | <https://docs.claude.com/en/docs/claude-code/sub-agents>          | 2026-05-19   |
| Hooks               | <https://docs.claude.com/en/docs/claude-code/hooks>               | 2026-05-19   |
| Slash commands      | <https://docs.claude.com/en/docs/claude-code/slash-commands>      | 2026-05-19   |
| Settings            | <https://docs.claude.com/en/docs/claude-code/settings>            | 2026-05-19   |
| MCP                 | <https://docs.claude.com/en/docs/claude-code/mcp>                 | 2026-05-19   |
| Memory (CLAUDE.md)  | <https://docs.claude.com/en/docs/claude-code/memory>              | 2026-05-19   |
| IAM & permissions   | <https://docs.claude.com/en/docs/claude-code/iam>                 | 2026-05-19   |
| Plugins             | <https://docs.claude.com/en/docs/claude-code/plugins>             | 2026-05-19   |
| Plugin marketplaces | <https://docs.claude.com/en/docs/claude-code/plugin-marketplaces> | 2026-05-19   |
| CLI reference       | <https://docs.claude.com/en/docs/claude-code/cli-reference>       | 2026-05-19   |
| Common workflows    | <https://docs.claude.com/en/docs/claude-code/common-workflows>    | 2026-05-19   |
| Headless mode       | <https://docs.claude.com/en/docs/claude-code/headless>            | 2026-05-19   |
| SDK overview        | <https://docs.claude.com/en/docs/claude-code/sdk/sdk-overview>    | 2026-05-19   |

## Claude API / Anthropic (docs.claude.com)

| Topic                       | URL                                                                             | last_fetched |
| --------------------------- | ------------------------------------------------------------------------------- | ------------ |
| Prompt engineering overview | <https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview> | 2026-05-19   |
| Tool use                    | <https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview>            | 2026-05-19   |
| Prompt caching              | <https://docs.claude.com/en/docs/build-with-claude/prompt-caching>              | 2026-05-19   |
| Extended thinking           | <https://docs.claude.com/en/docs/build-with-claude/extended-thinking>           | 2026-05-19   |
| Model overview              | <https://docs.claude.com/en/docs/about-claude/models/overview>                  | 2026-05-19   |
| Agent skills (API)          | <https://docs.claude.com/en/docs/agents-and-tools/agent-skills>                 | 2026-05-19   |

## GitHub releases / changelogs (anthropics/*)

| Topic                                     | URL                                                                         | last_fetched |
| ----------------------------------------- | --------------------------------------------------------------------------- | ------------ |
| claude-code releases                      | <https://github.com/anthropics/claude-code/releases>                        | 2026-05-19   |
| claude-code issues (bugs, RFC)            | <https://github.com/anthropics/claude-code/issues>                          | 2026-05-19   |
| anthropic-cookbook                        | <https://github.com/anthropics/anthropic-cookbook>                          | 2026-05-19   |
| Skills reference repo (official examples) | <https://github.com/anthropics/skills>                                      | 2026-05-19   |
| Official claude-api SKILL.md example      | <https://github.com/anthropics/skills/blob/main/skills/claude-api/SKILL.md> | 2026-05-19   |
| Educational courses                       | <https://github.com/anthropics/courses>                                     | 2026-05-19   |
| Prompt-engineering interactive tutorial   | <https://github.com/anthropics/prompt-eng-interactive-tutorial>             | 2026-05-19   |

## Anthropic engineering blog (anthropic.com/engineering)

Authoritative deep dives. Treat as canonical for design rationale.

| Topic                                          | URL                                                                                           | last_fetched |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------ |
| Claude Code best practices                     | <https://www.anthropic.com/engineering/claude-code-best-practices>                            | 2026-05-19   |
| Equipping agents with Agent Skills (rationale) | <https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills> | 2026-05-19   |
| Writing tools for agents                       | <https://www.anthropic.com/engineering/writing-tools-for-agents>                              | 2026-05-19   |
| Building agents with Claude Agent SDK          | <https://www.anthropic.com/engineering/building-agents-with-the-claude-agent-sdk>             | 2026-05-19   |
| Effective context engineering for AI agents    | <https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents>           | 2026-05-19   |
| Effective harnesses for long-running agents    | <https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents>           | 2026-05-19   |
| Multi-agent research system architecture       | <https://www.anthropic.com/engineering/multi-agent-research-system>                           | 2026-05-19   |
| Advanced tool use                              | <https://www.anthropic.com/engineering/advanced-tool-use>                                     | 2026-05-19   |
| Managed agents (scaling)                       | <https://www.anthropic.com/engineering/managed-agents>                                        | 2026-05-19   |
| Building effective AI agents (research)        | <https://www.anthropic.com/research/building-effective-agents>                                | 2026-05-19   |

## Anthropic news & product announcements

| Topic                                      | URL                                                                  | last_fetched |
| ------------------------------------------ | -------------------------------------------------------------------- | ------------ |
| Introducing Agent Skills                   | <https://www.anthropic.com/news/skills>                              | 2026-05-19   |
| How Anthropic teams use Claude Code (blog) | <https://www.anthropic.com/news/how-anthropic-teams-use-claude-code> | 2026-05-19   |

## Anthropic resources (PDFs, webinars)

Long-form Anthropic-authored material. Useful for citation depth.

| Topic                                                        | URL                                                                                                                                          | last_fetched |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Complete Guide to Building Skills for Claude (PDF)           | <https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf>                                                  | 2026-05-19   |
| How Anthropic teams use Claude Code (PDF field guide)        | <https://www-cdn.anthropic.com/58284b19e702b49db9302d5b6f135ad8871e7658.pdf>                                                                 | 2026-05-19   |
| Building Effective AI Agents (resources hub)                 | <https://resources.anthropic.com/building-effective-ai-agents>                                                                               | 2026-05-19   |
| Claude Code Advanced Patterns: Subagents, MCP, Scaling (PDF) | <https://resources.anthropic.com/hubfs/Claude%20Code%20Advanced%20Patterns_%20Subagents,%20MCP,%20and%20Scaling%20to%20Real%20Codebases.pdf> | 2026-05-19   |
| Claude Code Advanced Patterns webinar page                   | <https://www.anthropic.com/webinars/claude-code-advanced-patterns>                                                                           | 2026-05-19   |

## Anthropic Academy (anthropic.skilljar.com)

Official Anthropic-hosted training courses.

| Topic                        | URL                                                           | last_fetched |
| ---------------------------- | ------------------------------------------------------------- | ------------ |
| Introduction to subagents    | <https://anthropic.skilljar.com/introduction-to-subagents>    | 2026-05-19   |
| Introduction to agent skills | <https://anthropic.skilljar.com/introduction-to-agent-skills> | 2026-05-19   |

## code.claude.com (Claude Code product docs mirror)

Alternative canonical docs host. Cross-verify when docs.claude.com differs.

| Topic                     | URL                                      | last_fetched |
| ------------------------- | ---------------------------------------- | ------------ |
| Extend Claude with skills | <https://code.claude.com/docs/en/skills> | 2026-05-19   |

## Refresh procedure

```bash
# refresh single URL
python ~/.agents/skills/skill-doctor/scripts/fetch_docs.py <URL>

# refresh all stale
python ~/.agents/skills/skill-doctor/scripts/fetch_docs.py --all-stale
```

Or inside Claude: WebFetch the URL, summarize key changes, update timestamp in this file.

## Citation rule

When quoting docs in a finding, include:

- URL
- `last_fetched` date from this index
- The exact quoted snippet

If user doubts: re-fetch live, compare.
