# Emojis and GFM callouts

Load this reference whenever the document carries headings with emojis or any callout block.

## Emojis — expressive level

| Position | Allowed | Why |
| --- | --- | --- |
| Before an **H2** | Required | Anchors the section visually in a long document |
| Before H1, H3, H4+ | Forbidden | H1 is the title; deeper levels are already nested |
| Leading a bullet | Allowed | Only when the bullet carries a semantic category |
| Inside a table cell | Allowed | As **data**: status, priority |
| Inside a GFM callout | **NEVER** | The platform already injects an SVG icon there |

One emoji per element. Never two in a row.

The no-emoji-in-callout rule is the one people break. GitHub and GitLab render `> [!WARNING]`
with their own icon; adding ⚠️ produces a double icon — a visible anti-pattern.

## GFM callouts

```markdown
> [!NOTE]      Information utile même en lecture rapide
> [!TIP]       Bonne pratique, raccourci
> [!IMPORTANT] Nécessaire au succès de la tâche
> [!WARNING]   Risque, piège
> [!CAUTION]   Conséquence négative, action irréversible
```

- One to two sentences maximum. Beyond that, it is body text.
- Place the callout **before** the instruction or code block it concerns.
- `NOTE` and `TIP` cover 90 % of cases. Reserve `WARNING` and `CAUTION` for real danger.
- Two per document maximum, never consecutive (see the anti-verbosity budget).

## Correct shape

```markdown
> [!WARNING]
> Le hook s'exécute avec tes permissions utilisateur, sans bac à sable.
```

## Wrong shape

```markdown
> [!WARNING] ⚠️
> Attention !!! Ce hook est dangereux et il est important de noter que
> vous devez vraiment faire attention avant de l'activer, car il peut
> potentiellement causer des problèmes.
```

Three defects at once: emoji inside the callout, over two sentences, and a banned phrasing.
