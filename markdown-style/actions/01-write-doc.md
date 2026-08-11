# 01 — Write doc

Author a new Markdown file that satisfies the writing contract on the first pass.

## Inputs

- `target_path` (required) — string, where the file goes. Decides whether `type` belongs in the front-matter: `docs/**` yes, anywhere else no.
- `subject` (required) — string, what the document is about.
- `diataxis_type` (optional, default: inferred) — one of `tutorial` \| `how-to` \| `reference` \| `explanation`. Infer from the reader's situation; ask when two types are equally plausible.
- `owner` (optional, default: the repo's convention) — string, the accountable person.

## Outputs

A single `.md` file. Shape of a conforming document:

```markdown
---
title: Authentification par jeton JWT
type: reference
status: draft
updated: 2026-08-11
owner: bryan
---

# Authentification par jeton JWT

## 🔑 Émission du jeton

Le service signe un JWT HS256 valable 15 minutes.
La clé de signature vient de `JWT_SECRET`.

| Revendication | Type | Source |
| --- | --- | --- |
| `sub` | `string` | Identifiant utilisateur |
| `exp` | `number` | Horodatage Unix |
```

## Process

1. Read `references/frontmatter-diataxis.md`. Determine `diataxis_type` from what the reader is doing when they open the file. If two types fit, ask — a mixed file is two files.
2. Copy the matching block from `assets/frontmatter-template.md`. Fill all keys. Set `updated` to the current date taken from session context, `status: draft` for a new document.
3. Write the H1 identical to `title`, character for character.
4. Outline the H2 sections first, each with one semantic emoji. Check the outline holds a single Diátaxis type before writing any prose.
5. Read `references/prose-structure.md` and write the body. One sentence per source line. Any enumeration of 3+ items with 2+ attributes becomes a table, not a list.
6. If the subject involves a flow, an exchange, a data model, or a state machine, read `references/mermaid.md` and add one diagram per H2 — preceded by the sentence that says what it shows. Otherwise add none.
7. If a warning genuinely matters, read `references/emojis-callouts.md` and add at most two callouts, never consecutive, never containing an emoji.
8. Write the file, then run the test below. Fix every `ERROR` and re-run until the exit code is 0.

## Test

**Pattern A — JS script:**

```bash
node scripts/check-markdown.js <target_path>
```

Exit 0 means the document is conforming. A non-zero exit prints one line per violation with
its rule code and line number — fix and re-run. Warnings do not fail the check, but each one
must be a deliberate exception, not an oversight.
