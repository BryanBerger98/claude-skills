# 05 — Synthesize the specification

Merge the interview and the agent reports into one decision-ready document: what to change, in what order, and why. This is the deliverable.

## Inputs

- `scope_brief` (required) — object. From `01-scope-need`.
- `ux_report` (required) — object. From `03-critique-ux`.
- `ui_report` (required) — object. From `04-critique-ui`.
- `code_report` (optional) — object. From `02-analyze-code` (redesign only).
- `out_path` (optional, default: `.claude/docs/design/spec-<slug>.md`) — string. Where to write the doc.

## Outputs

A single French markdown file at `out_path`, copied from `assets/spec-template.md` and filled. The heart is the prioritized change table:

```text
| # | élément | état actuel | changement | raison (besoin / heuristique) | effort | priorité |
|---|---------|-------------|------------|-------------------------------|--------|----------|
| 1 | KPI tiles | hardcoded blue, no hierarchy | ledger-style tiles, token palette | goal "modernize" + Hierarchy principle | M | P0 |
```

## Depends on

- `01-scope-need`
- `03-critique-ux`
- `04-critique-ui`

## Process

1. Copy `assets/spec-template.md` to `out_path` (create `.claude/docs/design/` if missing).
2. Fill the metadata block, including `**Mode** : creation | redesign` — the test script keys off this line.
3. **Audit de l'existant** (redesign only): merge `code_report` + UX/UI findings into one severity-ranked synthesis. Omit this section entirely in creation mode.
4. **Direction de design cible**: consolidate the UX proposed experience + the UI token system into one coherent direction. Resolve conflicts between the two agents here; do not paste two opinions side by side.
5. **Spécifications de changement**: build the prioritized table. Every row traces to a `goal`/`success_criterion` or a named heuristic. Rank P0 → P2 by impact on the stated goals.
6. **Accessibilité**: state the WCAG 2.2 AA targets to reach (contrast, focus, keyboard, semantics).
7. **Mise en œuvre / handoff**: ordered steps; point implementation to `frontend-design`. Never write production UI code here.
8. Run the test script on the produced file; fix until it passes; then deliver the path to the user.

## Test

**Pattern A — JS script (preferred):**
```bash
node .claude/skills/audit-my-design/scripts/validate-spec-doc.js <out_path>
```
Checks the doc has all required sections, a valid `Mode` line, the audit section when `Mode = redesign`, and a change table carrying the expected columns. Exits non-zero with an actionable diagnostic on any miss.
