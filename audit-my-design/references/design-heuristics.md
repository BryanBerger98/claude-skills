# Design heuristics — UX, UI, accessibility

The shared vocabulary the agents and the synthesis must use. Name the heuristic/principle verbatim in every finding so the spec is auditable.

## Severity rubric (all axes)

- **blocker** — the user cannot complete the primary job, or a legal/accessibility floor is breached.
- **major** — significant friction, confusion, or rework; the job is harder than it should be.
- **minor** — polish; noticeable to a designer, low impact on the job.

## UX heuristics (Nielsen's 10)

1. Visibility of system status — the interface keeps the user informed.
2. Match between system and the real world — speak the user's language, not jargon.
3. User control and freedom — clear exits, undo/redo.
4. Consistency and standards — same words/actions mean the same thing.
5. Error prevention — design out the error before it happens.
6. Recognition over recall — show options; don't make users remember.
7. Flexibility and efficiency — accelerators for experts, simple paths for novices.
8. Aesthetic and minimalist design — no irrelevant information competing for attention.
9. Help users recognize, diagnose, recover from errors — plain-language, constructive messages.
10. Help and documentation — discoverable, task-focused when needed.

**States to always check**: empty, loading, partial/slow, error, success, permission-denied, zero-results, first-run. Missing states is the most common UX defect.

## UI principles

- **Visual hierarchy** — size, weight, color, and position encode importance; the primary action is unmistakable.
- **Typography** — deliberate display/body/utility pairing; a clear type scale; line length 45–75 chars for body.
- **Color & contrast** — a small, intentional palette; color is never the only signal; meets WCAG (see below).
- **Spacing & grid** — a single base unit and scale; consistent rhythm; an actual layout grid.
- **Consistency** — components, spacing, and language reused, not reinvented per screen.
- **Component states** — default / hover / focus / active / disabled all designed, focus always visible.
- **Iconography & imagery** — consistent set and metaphors; images earn their space.
- **Motion** — purposeful (feedback, continuity); never decorative noise; respect `prefers-reduced-motion`.
- **Anti-templated** — see `../../frontend-design/SKILL.md`. Don't spend a free axis on the generic AI look; choose for the subject.

## Accessibility checklist (WCAG 2.2 AA — the floor)

- **Contrast**: normal text ≥ 4.5:1; large text (≥ 24px, or ≥ 19px bold) ≥ 3:1; UI components/graphics ≥ 3:1.
- **Keyboard**: every interactive element reachable and operable by keyboard; no traps; logical tab order.
- **Focus**: visible focus indicator on every focusable element (WCAG 2.2 focus-appearance).
- **Semantics**: native HTML elements first; ARIA only to fill gaps; one `h1`, ordered headings.
- **Forms**: every input has a programmatic label; errors identified in text, not color alone.
- **Media**: meaningful `alt`; captions/transcripts for audio/video.
- **Targets**: pointer target ≥ 24×24px (WCAG 2.2 target-size).
- **Motion**: honor `prefers-reduced-motion`; no content flashing > 3×/sec.

Every recommendation that touches color, focus, or interaction must state the AA target it meets.
