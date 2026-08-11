# GATE — does the skill load when writing, and stay out when reading?

This is the one experiment that justifies the whole architecture.
A rule scoped with `paths:` loads on **read**, which would drag the writing contract into every
plan execution and runbook. A skill loads on the model's judgement of its `description`.
If the skill also loads while merely reading Markdown, it has bought nothing and costs context
on every run.

Run it in **three separate fresh sessions**. A single session carries the first load forward and
proves nothing about the second.

## Preparation

One throwaway repository, outside any existing project, with a git history so the last check
can read a real diff.

```bash
mkdir -p ~/tmp/md-gate/docs/plans ~/tmp/md-gate/docs/specs
cd ~/tmp/md-gate && git init -q

printf '# Projet de test\n\nLe service redemarre automatiquement apres un echec.\n' > README.md

cat > docs/plans/migration-db.md <<'EOF'
# Migration de la base

## Étapes

1. Créer `db/backup.sql` avec un export complet des tables existantes.
2. Écrire `db/schema-v2.sql` contenant la nouvelle table `sessions`.
3. Ajouter `db/rollback.sql` qui restaure le schéma précédent.
EOF

git add -A && git commit -qm "fixtures"
```

> [!WARNING]
> Every step of the plan fixture must produce something **other than Markdown**.
> A plan that asks for a `README.md` would legitimately load the skill at the moment the model
> starts authoring it, and session 2 could no longer tell a trigger leak from correct behaviour.
> Keep the three steps on `.sql` files.

## Calibrating the signal — session 1

Session 1 is the expected positive. Use it to learn what a loaded skill looks like on this
machine, then reuse that exact signal for sessions 2 and 3.

| Signal | How to read it |
| --- | --- |
| `/context` | The skills section names `markdown-style`. This is the primary signal. |
| Transcript | `grep -c 'markdown-style' ~/.claude/projects/<slug>/<session-uuid>.jsonl` on the loaded-skill entry, once session 1 has shown you its shape. |

> [!IMPORTANT]
> Do not assume the transcript marker's shape before session 1 shows it to you.
> A skill invoked through a slash command and a skill loaded by the model's own judgement do
> not leave the same trace.

## The three sessions

| # | Fresh session prompt | Expected | Meaning if it fails |
| --- | --- | --- | --- |
| 1 | `Rédige la spec de l'authentification dans docs/specs/` | loads | The `description` does not read as an authoring trigger. |
| 2 | `Exécute le plan docs/plans/migration-db.md` | **does not load** | The exclusion clause is too weak. **Stop here.** |
| 3 | `Corrige la coquille dans le README` | loads | A one-word edit is not being recognised as authoring. |

## Checks on what session 1 produced

Run these against the file session 1 wrote under `docs/specs/`.

```bash
cd ~/tmp/md-gate
SPEC=$(ls docs/specs/*.md | head -1)

# Front-matter complete, `updated` on today's date, no emoji inside a callout.
# EMO004 is the emoji-in-callout rule; FM00x cover the front-matter keys.
node ~/.claude/skills/markdown-style/scripts/check-markdown.js "$SPEC"
grep -n "^updated: $(date +%F)$" "$SPEC"
```

Then the diff-proportionality check, which is what semantic linefeeds exist for:

```bash
# In session 3, after the README typo fix:
git diff --numstat -- README.md    # expect: 1 line added, 1 removed
```

A typo fix that reports more than one changed line means the file was reflowed, and every future
review of this repository pays for it.

## Results

| DoD | Result | Note |
| --- | --- | --- |
| S1 loads the skill | ☐ | |
| S2 does **not** load the skill | ☐ | |
| S3 loads the skill | ☐ | |
| S1 front-matter complete, `updated` = today | ☐ | |
| S1 has no emoji inside a callout (`EMO004`) | ☐ | |
| S3 diff repaints exactly one line | ☐ | |

## If session 2 loads the skill

Stop. Do not continue to C6.

Harden the negative half of the `description` in `SKILL.md` — name the reading situations
explicitly rather than describing them in the abstract — and replay all three sessions.
Shipping an approximate trigger means paying the contract's context cost on every plan
execution, forever, which is exactly the failure the skill was built to avoid.
