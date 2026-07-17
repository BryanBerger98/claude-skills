# 04 — Critique and propose UI

The UI agent. In redesign it critiques the existing visual design; in creation it proposes the visual direction from the brief. Runs in parallel with `03-critique-ux` (and `02` in redesign).

## Inputs

- `scope_brief` (required) — object. From `01-scope-need`.
- `code_report` (optional) — object. From `02-analyze-code` (redesign only); grounds critiques in real tokens/components.

## Outputs

A UI report (markdown). Shape:

```text
## Findings (redesign) — ranked by severity
| # | area | principle | severity | evidence (element/`file:line`) | recommendation |
|---|------|-----------|----------|--------------------------------|----------------|
(areas: hierarchy, typography, color & contrast, spacing & grid, consistency, states, iconography, motion)

## Proposed UI direction
- Token system: 4–6 named hex values (with WCAG contrast notes for text pairings)
- Type: display / body / utility roles — families, scale, weights
- Spacing & grid: base unit + scale, layout grid
- Signature: the one element this design is remembered by, tied to the subject
- Component states: default / hover / focus / active / disabled
```

## Depends on

- `01-scope-need`

## Process

1. Read `assets/agent-ui-critic.md` and the UI + accessibility sections of `references/design-heuristics.md`.
2. Spawn a read-only UI agent. Inject the fragment, the `scope_brief`, and `code_report` if present.
3. Mode branch:
   - **redesign** → critique the existing visuals (hierarchy, type, color/contrast, spacing/grid, consistency, states, iconography, motion), each with a named principle + severity + evidence; THEN propose the token system.
   - **creation** → propose the UI direction directly from the brief.
4. Anti-templated stance: follow the aesthetic doctrine of `../frontend-design/SKILL.md` (point to it, do not copy). If a free axis would default to the generic AI look, call it out and choose deliberately for this subject.
5. Every color pairing used for text must state its WCAG contrast ratio and the AA target it meets (see `references/design-heuristics.md`).
6. Return the report to `05-synthesize-spec`.

## Test

**Pattern C — LLM assertion with example:**
Assert: "The proposed UI direction defines a 4–6 hex token system with contrast notes, type roles with a scale, a spacing scale, and a named signature element; in redesign, each finding has a named principle + severity + concrete evidence."

Example of a correct fragment:
```text
## Proposed UI direction
- Palette: --ink #1A1A2E (text), --surface #F7F6F2, --brand #1F6F5C (brand, on surface = 5.9:1 AA✓),
  --accent #E0533D (alerts only), --muted #6B7280 (meta, on surface = 4.7:1 AA✓).
- Type: display = "Fraunces" 600 (used sparingly), body = "Inter" 400/500, utility = "IBM Plex Mono" for KPIs.
- Signature: KPI tiles framed like ledger entries — a nod to property accounting, not generic stat cards.
```
