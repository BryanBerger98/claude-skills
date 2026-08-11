# 02 — Revise doc

Edit an existing Markdown file without repainting lines the change did not touch.

## Inputs

- `target_path` (required) — string, the file to edit. It already exists; never create it here.
- `change` (required) — string, what the user asked for: a typo fix, a reworded paragraph, a new section, a status bump.
- `scope` (optional, default: minimal) — `minimal` touches only what the change requires; `conform` additionally repairs contract violations already present in the file.

## Outputs

A `git diff` proportional to the change. A one-word fix repaints one line:

```diff
 ---
 title: Guide de déploiement
 status: stable
-updated: 2026-07-02
+updated: 2026-08-11
 owner: bryan
 ---
@@
-Le service redémarre automatiquement aprés un échec.
+Le service redémarre automatiquement après un échec.
```

## Process

1. Read the file. Note its Diátaxis `type` — every addition must stay inside that type. New content of a different type goes in a new file, linked from this one.
2. Apply the requested change with `Edit`, never by rewriting the whole file.
3. Bump `updated` to the current date from session context. This is the one edit that always happens, even for a single character.
4. Keep semantic linefeeds: one sentence per line. If the edited sentence is on a line holding several sentences, split that line — this is the only reflow allowed under `scope: minimal`.
5. Under `scope: minimal`, leave pre-existing violations alone. Report them in your closing summary so the user can decide. Under `scope: conform`, fix them too.
6. If the change adds a section, give it an H2 with one semantic emoji and respect the heading level sequence — no skip from H2 to H4.
7. Run the test below. Compare the violation count against the file's state before your edit: it must not have grown.

## Test

**Pattern A — JS script:**

```bash
node scripts/check-markdown.js <target_path>
```

Then confirm the diff is proportional:

```bash
git diff --numstat -- <target_path>
```

A typo fix that reports more than a handful of changed lines means the file was reflowed —
revert and redo the edit surgically.
