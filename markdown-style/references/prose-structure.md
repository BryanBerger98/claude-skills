# Prose, structure, tables, code blocks

Render targets: GitHub, GitLab, IDE preview (VS Code / Cursor). Full GFM allowed.

## Language

- Write **all** content in French: headings, body, captions, alt text.
- Technical identifiers stay English: file names, commands, config keys, types, endpoints.
- Direct tone, active voice, present indicative. No conditional politeness.

## Anti-verbosity budget

- No introductory paragraph before a heading. The heading is enough.
- Four sentences maximum per paragraph.
- Two callouts maximum per document, never consecutive.
- No "Conclusion", "En résumé", or "Pour aller plus loin" section.
- One sentence per source line (semantic linefeeds). No hard wrapping.
- Any enumeration of 3+ items carrying 2+ attributes → **table, mandatory**.

Banned phrasings, verbatim — these are French strings, do not translate them in the check:

```text
il est important de noter
n'hésitez pas à
dans ce document nous allons
en effet
de manière générale
comme vous pouvez le voir
il convient de
```

## Structure

- Exactly one H1, identical to the front-matter `title`.
- No heading-level skip (H2 → H4 is forbidden).
- Blank line before and after every heading, list, table, and code block.
- ATX headings (`##`), never underlined.
- Bold `**texte**`, italic `_texte_`. Never `__` and never `*`.

## Tables

- Header row always present. Explicit alignment on numeric columns: `|---:|`.
- Five columns maximum. Beyond that, split into two tables.
- Cells of six words maximum. A long cell means the table is the wrong shape.
- Most discriminating column first.

## Code blocks

- Always a language tag: ` ```ts `, ` ```bash `, ` ```json `.
- 25 lines maximum. Beyond that, extract the useful part and elide with `// ...`.
- One leading comment if the intent is not obvious. No more.
- Shell commands: one per line, no `$` prompt prefix.

## Underused elements worth reaching for

| Element | Use for |
| --- | --- |
| `<details><summary>` | Any non-central block over 30 lines: logs, command output, full config |
| `- [ ]` task lists | Actionable checklists |
| `[^1]` footnotes | Sources — never inline parentheses |
| Relative links | Cross-document links inside the repo, never an absolute internal URL |

Link text must be descriptive. "cliquez ici" is forbidden.
