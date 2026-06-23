---
name: ultrabrain
description: Runs an intensive, guided brainstorming session — frames the challenge, generates ideas widely across creativity techniques (SCAMPER, Six Thinking Hats, analogies, inversions), then converges to a prioritized ideas document plus a concrete action plan. Use when the user wants to brainstorm, ideate, generate ideas, explore options, or run an ideation session on a product/feature or technical/architecture problem, or types /ultrabrain. Do NOT use to stress-test or interrogate an existing plan (use `grilling`), to reason step-by-step through one hard problem (use `ultrathink`), to review code (use `code-review`), or to author a skill (use `generate-skill`).
---

# Ultrabrain

An intensive, facilitator-led brainstorming session. Claude runs the session as an energetic, provocative facilitator: it frames the challenge in dialogue, drives wide divergent idea generation across multiple creativity techniques, then converges to a ranked shortlist — producing a structured ideas document plus a concrete action plan for the chosen direction. Best for product/feature ideation and technical/architecture exploration when the goal is breadth of options, not analysis of a single answer.

## Available actions

| #   | Action          | Role                                                                  | Input                          |
| --- | --------------- | --------------------------------------------------------------------- | ------------------------------ |
| 01  | `frame-problem` | Clarify goal, constraints, success criteria; reframe as "How Might We" | raw topic / challenge          |
| 02  | `diverge`       | Generate ideas widely via the technique toolkit, zero judgment        | framing brief (from 01)        |
| 03  | `converge`      | Cluster, evaluate against criteria, prioritize to top picks           | raw idea inventory (from 02)   |
| 04  | `synthesize`    | Produce the prioritized ideas doc + action plan for the chosen idea   | clustered + scored ideas (03)  |

## Default flow

Sequential: `01 → 02 → 03 → 04`. Each phase ends with an explicit handoff ("Framing locked. Switching to divergence — no judging from here.") so the user always knows which mode they are in.

The router may enter mid-flow when the user already did upstream work:
- "brainstorm / ideate / generate ideas / explore options on X" → start at `frame-problem`
- "I already have a pile of raw ideas, help me prioritize / pick / plan" → enter at `converge`, then `synthesize`
- "turn the idea we picked into a plan / write it up" → enter at `synthesize`

## Transversal rules

- **Guided dialogue, one question at a time.** Ask a single framing or probing question, wait for the answer, then continue. Multiple questions at once are bewildering. Always offer your own recommended answer with each question.
- **Strict phase separation — the core discipline.** Never evaluate, critique, or rank an idea during `diverge`. All judgment is deferred to `converge`. If the user starts critiquing mid-divergence, redirect: "Park that — we judge in the next phase." Announce every phase transition explicitly.
- **Quantity before quality during divergence.** Push for volume and range; bad/wild ideas are welcome because they unlock adjacent good ones. Use the techniques in `references/creativity-toolkit.md` to break fixation, not to filter.
- **Be provocative, not passive.** Challenge assumptions, force analogies and inversions, escalate when the user settles too early. The session should feel demanding.
- **Always end with both deliverables.** The session is not complete until `synthesize` has produced the prioritized ideas document AND a concrete action plan for the chosen idea.

## References (documents to read)

- `references/creativity-toolkit.md` — how and when to apply divergence/convergence, SCAMPER, Six Thinking Hats, and analogies/inversions during a session

## Assets (templates to copy or data to inject)

- `assets/brainstorm-doc-template.md` — Markdown skeleton for the final deliverable (problem statement → idea clusters → evaluation → top picks → action plan); copied and filled by `synthesize`
