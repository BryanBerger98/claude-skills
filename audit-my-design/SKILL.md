---
name: audit-my-design
description: Conducts a scoping interview, then audits an existing UI — or frames a new one — through three specialized agents (frontend code, UX, UI) to produce a design/redesign specification document detailing every change to make and why. Use when the user wants to design or redesign a screen/page/app, asks for a UX or UI critique of an existing interface, wants a design audit, or wants a structured spec/plan before building. Do NOT use for executing the visual build or writing UI code (use `frontend-design`), for business-logic analysis of a legacy twimm PHP page (use `analyze-legacy-page`), for diagnosing a rendering bug (use `diagnose`), or for reviewing a pull request (use `code-review`).
---

# Audit My Design

Runs a structured design engagement: a scoping interview to capture the real need, a multi-agent audit (frontend code, UX, UI) of an existing interface — or a from-scratch proposal for a new one — and a single specification document that details every change to make, ranked and justified by need + design expertise. The deliverable is a markdown spec; implementation is a separate phase handed off to `frontend-design`.

## Available actions

| #   | Action            | Role                                                                                              | Input                       |
| --- | ----------------- | ------------------------------------------------------------------------------------------------ | --------------------------- |
| 01  | `scope-need`      | Scoping interview; detect mode (creation vs redesign); locate the target UI/code                 | user request                |
| 02  | `analyze-code`    | Frontend code agent: components, design tokens, CSS architecture, accessibility, tech constraints | scope brief + code path     |
| 03  | `critique-ux`     | UX agent: critique existing flows/IA/heuristics (redesign) and/or propose the target UX          | scope brief (+ code report) |
| 04  | `critique-ui`     | UI agent: critique existing visuals (redesign) and/or propose the UI direction (type, color, space)| scope brief (+ code report) |
| 05  | `synthesize-spec` | Merge interview + agent reports into the design specification document                            | all prior outputs           |

## Default flow

Sequential with a parallel audit fan-out:

`01 scope-need` → `[02 analyze-code (redesign only), 03 critique-ux, 04 critique-ui run in parallel]` → `05 synthesize-spec`.

- **Creation (greenfield)**: `01` → `[03, 04]` → `05`. Skip `02` (no existing code); the UX/UI agents propose rather than critique.
- **Redesign (refonte)**: `01` → `[02, 03, 04]` → `05`. The agents critique the existing UI, then propose.

Standalone entry points (dispatch directly, then stop):

- "critique l'UX de X", "audite l'expérience de ce parcours" → `critique-ux`
- "critique l'UI de X", "donne ton avis sur typo/couleurs/espacements" → `critique-ui`
- "analyse le code frontend / les tokens de design avant refonte" → `analyze-code`
- "rédige le doc de specs, j'ai déjà le brief et les retours" → `synthesize-spec`

## Transversal rules

- **The deliverable is a specification, never the build.** This skill stops at the markdown spec. The implementation handoff section points to `frontend-design`; never start writing production UI code here.
- **Evidence over opinion.** Every audit finding (code, UX, UI) must cite concrete evidence — `file:line` for code, a named screen/element/flow for UX/UI — and tie each recommendation to a stated need or a named heuristic from `references/design-heuristics.md`.
- **Need first, taste second.** Recommendations are ranked by impact on the user's stated goals and success criteria, not by aesthetic preference alone. A change with no traced rationale does not enter the spec.
- **Two modes, one document.** Creation and redesign share `scope-need` and `synthesize-spec`. The difference is `02 analyze-code` (redesign only) and whether the UX/UI agents critique-then-propose or propose-only.
- **Accessibility is non-optional.** Every spec states the WCAG 2.2 AA targets to reach (contrast, focus, semantics, keyboard), per `references/design-heuristics.md`.
- **Subagents are read-only auditors.** The code/UX/UI agents read and report; they never edit files. Spawn them in parallel with the prompt fragments in `assets/`.
- **French output.** The specification document and all user-facing prose are in French (per the user's global rules). Keep code identifiers, token names, and file paths verbatim.

## References (documents to read)

- `references/interview-guide.md` — scoping question bank, organized by theme and by mode (creation vs redesign)
- `references/design-heuristics.md` — UX heuristics, UI principles, accessibility checklist (WCAG 2.2 AA), severity rubric

## Assets (templates to copy or inject)

- `assets/agent-code-analyst.md` — prompt fragment injected when spawning the frontend code analysis agent
- `assets/agent-ux-critic.md` — prompt fragment injected when spawning the UX agent
- `assets/agent-ui-critic.md` — prompt fragment injected when spawning the UI agent
- `assets/spec-template.md` — skeleton of the design specification document to copy and fill

## External data (cross-skill pointers per R7)

- `../frontend-design/SKILL.md` — the downstream execution doctrine (distinctive, non-templated visual build). This skill points to it for the implementation handoff and for the UI agent's anti-templated stance; it does NOT copy that doctrine.
