# 03 — Critique and propose UX

The UX agent. In redesign it critiques the existing experience against heuristics; in creation it proposes the experience from the brief. Runs in parallel with `04-critique-ui` (and `02` in redesign).

## Inputs

- `scope_brief` (required) — object. From `01-scope-need`.
- `code_report` (optional) — object. From `02-analyze-code` (redesign only); grounds critiques in real flows/states.

## Outputs

A UX report (markdown). Shape:

```text
## Findings (redesign) — ranked by severity
| # | area | heuristic | severity | evidence (screen/flow/`file:line`) | recommendation |
|---|------|-----------|----------|-----------------------------------|----------------|

## Proposed experience
- Primary flow: <step → step → step>, with the single primary action per screen
- Information architecture: grouping, hierarchy, what is surfaced vs deferred
- States: empty / loading / error / success / permission-denied
- Microcopy direction: tone, key labels, error messages
- Open questions / risks
```

## Depends on

- `01-scope-need`

## Process

1. Read `assets/agent-ux-critic.md` and the UX section of `references/design-heuristics.md`.
2. Spawn a read-only UX agent. Inject the fragment, the `scope_brief`, and `code_report` if present.
3. Mode branch:
   - **redesign** → critique the existing flows/IA/states against the heuristics, THEN propose the target experience. Every finding cites a named heuristic + a severity (`blocker` / `major` / `minor`) + concrete evidence.
   - **creation** → skip findings; propose the experience directly from the brief (flows, IA, states, microcopy).
4. Anchor every recommendation to a `goal` or `success_criterion` from the brief. Drop suggestions with no traced rationale.
5. Cover the often-missed states explicitly: empty, loading, error, success, permission/edge.
6. Return the report to `05-synthesize-spec`.

## Test

**Pattern C — LLM assertion with example:**
Assert: "In redesign, every finding has area + named heuristic + severity + concrete evidence + a recommendation tied to a brief goal; in creation, the proposed experience covers primary flow, IA, and all of empty/loading/error/success states."

Example of a correct finding row:
```text
| 2 | onboarding | Recognition over recall (#6) | major | signup step 3 asks for the SIRET seen on step 1 | prefill it; never re-ask known data — supports goal "cut time-to-first-action" |
```
