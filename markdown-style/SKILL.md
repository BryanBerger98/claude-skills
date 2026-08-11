---
name: markdown-style
description: Applies the house Markdown writing contract when authoring or editing .md and .mdx files — front-matter, Diátaxis typing, anti-verbosity budget, semantic emojis, GFM callouts, themed Mermaid. Use when the user asks to write, draft, restructure, reword, or fix a README, an ADR, a spec, a changelog, a documentation page, or any Markdown file. Do NOT use when Markdown is merely read, parsed, or executed as instructions — reading a plan, following a runbook, consuming a spec, grepping docs, or summarizing a README never loads this skill. Do NOT use for SKILL.md, agent, or command files (they follow `generate-skill` architecture rules instead).
---

# Markdown Style

Turns any Markdown-authoring request into a file that satisfies the house writing contract: complete front-matter, exactly one Diátaxis type, French prose with English identifiers, semantic emojis on H2 only, and Mermaid diagrams that stay legible in dark mode.

The contract lives in `references/`. Load only the parts the task needs — `frontmatter-diataxis.md` always, the others on demand.

## Available actions

| #   | Action       | Role                                                | Input                        |
| --- | ------------ | --------------------------------------------------- | ---------------------------- |
| 01  | `write-doc`  | Author a new Markdown file from scratch             | target path, subject         |
| 02  | `revise-doc` | Edit an existing Markdown file without repainting it | target path, requested change |
| 03  | `audit-doc`  | Report contract violations, change nothing          | file path or glob            |

## Default flow

Non-sequential. The router dispatches on intent.

| User says | Action |
| --- | --- |
| "rédige", "crée la doc", "écris le README / l'ADR / la spec" | `write-doc` |
| "corrige", "reformule", "mets à jour", "ajoute une section" | `revise-doc` |
| "vérifie", "audite", "est-ce conforme", "qu'est-ce qui cloche" | `audit-doc` |
| Target file unknown, or report-vs-rewrite unclear | ask, then dispatch |

## Transversal rules

Every action obeys these. They are not negotiable and not repeated per action.

- **Content language is French** — headings, body, captions, alt text. Technical identifiers stay English: file names, commands, config keys, types, endpoints.
- **Semantic linefeeds** — one sentence per source line, no hard wrapping. This is what keeps a one-word fix to a one-line `git diff`.
- **Scope discipline** — touch only the file the user named. A malformed neighbouring file is a finding to report, never a file to silently rewrite.
- **`updated` is mandatory** — set it to the current date on every edit, without exception. Read the date from the session context, never guess it.
- **Verify before declaring done** — run `node scripts/check-markdown.js <file>` from the skill directory. A non-zero exit means the work is not finished.
- **Mechanical typography is not your job** — spacing, list markers, and trailing whitespace belong to `markdownlint-cli2`. Spend attention on structure and prose instead.

## Out of scope

This skill governs prose documents. It does not govern:

- `SKILL.md`, agent, and slash-command files — they follow `generate-skill` architecture (no front-matter, no emoji H2).
- Machine-generated Markdown (dependency reports, coverage output, changelog fragments produced by a tool).
- Markdown embedded in code strings or test fixtures.

## References (documents to read)

- `references/frontmatter-diataxis.md` — required front-matter keys, Diátaxis type table, one-type-per-file rule
- `references/prose-structure.md` — anti-verbosity budget, banned phrasings, heading structure, tables, code blocks
- `references/emojis-callouts.md` — where emojis are allowed, GFM callout catalogue, the no-emoji-in-callout rule
- `references/mermaid.md` — when a diagram earns its place, node shapes, the imposed palette

## Assets (templates to copy)

- `assets/frontmatter-template.md` — the front-matter block to copy verbatim and fill
- `assets/markdownlint-rules.jsonc` — canonical typography rule set. A repository never copies it; its `.markdownlint-cli2.jsonc` points at it through `config.extends`. Rules sit at the file root: wrapping them in a `config` key makes the inheritance silently do nothing.

## Scripts

- `scripts/check-markdown.js` — deterministic conformance checker. `node scripts/check-markdown.js <file...>`; add `--json` for machine-readable output. Exit 0 = clean, 1 = violations, 2 = usage error.
- `scripts/markdown-format.sh` — PostToolUse hook, symlinked into `~/.claude/hooks/`. Runs `markdownlint-cli2 --fix` on every `.md`/`.mdx` the tools touch, looping until it converges. Never call it by hand: typography is repaired behind you, which is why no action spends attention on it.
