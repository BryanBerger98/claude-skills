# 03 — Audit doc

Report contract violations across one or more files. Change nothing.

## Inputs

- `paths` (required) — string or glob, the files to inspect. Expand globs before calling the checker; it takes explicit paths.
- `include_warnings` (optional, default: `true`) — boolean, whether judgement-level findings appear in the report.

## Outputs

A report table grouped by file, most severe first. The files on disk are untouched.

| Fichier | Ligne | Code | Sévérité | Constat |
| --- | ---: | --- | --- | --- |
| `docs/api.md` | 1 | `FM005` | error | `type` Diátaxis absent |
| `docs/api.md` | 42 | `EMO004` | error | Emoji dans un callout |
| `README.md` | 18 | `TBL002` | warn | Cellule de 9 mots |

## Process

1. Expand the glob yourself — `Glob` on `**/*.md` or the pattern the user gave. Exclude what the skill does not govern: `SKILL.md`, agent and command files, `node_modules/`, generated output.
2. Run the checker over the whole set in one call, with `--json` so the output is parseable.
3. Parse the JSON. Group findings by file, errors before warnings.
4. Read the offending lines for anything you intend to explain — the code alone is a label, not a diagnosis. Never quote a line you have not read.
5. Add what the script cannot see: Diátaxis drift (a `reference` file giving advice), a diagram that replaces no text, a table that should be prose. These are judgement calls — state them as such, separately from the machine findings.
6. Deliver the table. Propose `revise-doc` on the worst file. **Do not edit anything** — this action is read-only by contract.

## Test

**Pattern A — JS script:**

```bash
node scripts/check-markdown.js <paths...> --json
```

The JSON carries `errors`, `warnings`, and a `files[]` array of `{code, severity, line, message}`.
Assert that the delivered table contains exactly those findings — none dropped, none invented —
plus any judgement calls, clearly labelled as such.

Then prove the audit changed nothing:

```bash
git status --porcelain
```

Any modified file in that output means the action overstepped.
