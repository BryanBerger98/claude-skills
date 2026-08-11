# Front-matter and Diátaxis typing

Load this reference for every authoring or editing task. The other three are on demand.

## Front-matter — mandatory on every file

```yaml
---
title: Titre exact du document
type: reference        # docs/** only — see the Diátaxis table below
status: draft          # draft | review | stable | deprecated
updated: 2026-08-10    # ISO 8601, current date on every edit
owner: bryan
---
```

| Key | Scope | Rule |
| --- | --- | --- |
| `title` | all files | Must equal the H1, character for character |
| `type` | `docs/**` only | One of the four Diátaxis values. Omit everywhere else |
| `status` | all files | `draft` \| `review` \| `stable` \| `deprecated` |
| `updated` | all files | ISO 8601 (`YYYY-MM-DD`), refreshed on **every** edit |
| `owner` | all files | Single accountable person |

Outside `docs/**` — README, ADR, tickets — drop `type` and keep the other four.

Never invent the date. Read it from the session context; if it is not available, ask.

## Diátaxis — one type per file

| `type` | Serves | Forbidden in that file |
| --- | --- | --- |
| `tutorial` | Learning by doing | Options, alternatives, theory |
| `how-to` | Solving one precise problem | Pedagogy, explaining the why |
| `reference` | Looking up a fact | Advice, narration, tutorial |
| `explanation` | Understanding the why | Step-by-step instructions |

**YOU MUST** never mix two types in one file. When the content drifts — a reference page
starts giving advice, a how-to starts teaching — create a second file and link it.

## Picking the type

Ask what the reader is doing when they open the file.

| Reader's situation | Type |
| --- | --- |
| New to the subject, wants a guided first success | `tutorial` |
| Knows the domain, has a specific goal right now | `how-to` |
| Needs one exact fact — a flag, a schema, an endpoint | `reference` |
| Wants to understand a decision or a trade-off | `explanation` |

A file that answers two of these questions is two files.
