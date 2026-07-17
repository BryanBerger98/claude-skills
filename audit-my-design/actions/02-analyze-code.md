# 02 — Analyze the frontend code

Redesign only. Spawn a read-only frontend code agent that maps the technical reality the redesign must work with: what exists, what is reusable, and what constrains the design.

## Inputs

- `scope_brief` (required) — object. From `01-scope-need` (needs `target_paths`).
- `code_path` (required) — string[]. Files, routes, or globs of the UI in scope.

## Outputs

A structured code report (markdown) returned by the agent. Shape:

```text
## Component inventory
- <Component> — <role> — reused in <n> places — `path:line`

## Design tokens & theme
- colors/spacing/typography: defined in `path` vs hardcoded literals at `path:line`

## CSS architecture
- methodology (Tailwind / CSS Modules / styled-components / global), specificity traps,
  dead or conflicting rules — each with `path:line`

## Responsive & breakpoints
- breakpoint system, gaps, fixed widths that break — `path:line`

## Accessibility (current state)
- semantic HTML, ARIA, contrast issues, focus/keyboard, alt text — `path:line`

## Constraints that bound the redesign
- framework, design-system lib, i18n, perf budgets, data density requirements
```

## Depends on

- `01-scope-need`

## Process

1. Read `assets/agent-code-analyst.md` — the agent's prompt fragment.
2. Spawn a read-only agent (`subagent_type: codebase-explorer`, or `Explore`/`general-purpose` if unavailable). Inject the fragment, the `scope_brief`, and `code_path`.
3. Instruct the agent: report only, never edit; cite `file:line` for every claim; record negative results ("no design tokens — all colors hardcoded").
4. For TS/JS/TSX targets, the agent should prefer the `LSP` tool (definitions, references, document symbols) over text search for the component inventory and reuse counts.
5. Collect the structured report. If `target_paths` was empty or wrong, return to `01` to re-locate the target rather than guessing.
6. Pass the report to `03-critique-ux`, `04-critique-ui`, and `05-synthesize-spec`.

## Test

**Pattern C — LLM assertion with example:**
Assert: "The code report fills all six sections; every asserted fact carries a `file:line`; at least one constraint that bounds the redesign is named; the agent made no file edits."

Example of a correct fragment:
```text
## Design tokens & theme
- Colors: no token file. Hardcoded hex literals — `src/pages/Dashboard.tsx:42` (#2b6cb0),
  `:58` (#2b6cb0 again), `src/components/widgets/Kpi.tsx:19` (#2B6CB0, casing drift).
- Spacing: ad-hoc px values, no scale — `Kpi.tsx:23,31,44`.
## Constraints that bound the redesign
- React 18 + Tailwind 3; must keep ≥ 20 rows visible per widget (data density, per brief).
```
