# Front-matter template

Copy the block that matches the file's location. Fill every placeholder — no key is optional.

## Inside `docs/**`

```yaml
---
title: <titre exact, identique au H1>
type: <tutorial | how-to | reference | explanation>
status: <draft | review | stable | deprecated>
updated: <YYYY-MM-DD — date du jour>
owner: <responsable>
---
```

## Anywhere else — README, ADR, tickets

```yaml
---
title: <titre exact, identique au H1>
status: <draft | review | stable | deprecated>
updated: <YYYY-MM-DD — date du jour>
owner: <responsable>
---
```

The only difference is `type`, which exists solely under `docs/**`.

## Filled example

```yaml
---
title: Authentification par jeton JWT
type: reference
status: draft
updated: 2026-08-11
owner: bryan
---

# Authentification par jeton JWT
```

The H1 repeats `title` character for character. That duplication is intentional: the
front-matter feeds tooling, the H1 feeds the reader.
