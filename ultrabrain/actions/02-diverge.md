# 02 — Diverge

Generate the widest possible range of ideas against the framing brief. Zero judgment. Quantity and range are the only goals here.

## Inputs

- `framing_brief` (required) — the confirmed output of `frame-problem` (HMW question, success criteria, constraints, assumptions to challenge).

## Outputs

A raw, unfiltered idea inventory — numbered, terse, deduplicated only for exact repeats. No scoring, no ordering by quality.

```
1. Pre-filled starter workspace seeded from the user's signup answers
2. Day-2 "one tiny win" nudge instead of a feature tour
3. Inversion: design the worst onboarding imaginable, then negate each step
4. Analogy (video games): a tutorial level you can't fail
5. SCAMPER/Eliminate: remove the signup form entirely, defer account creation
6. Six Hats/Black: what kills retention even with perfect onboarding?
...
(target: 25+ ideas across ≥3 techniques)
```

## Depends on

- `01-frame-problem`

## Process

1. State the discipline up front: no judging, no "but that won't work", wild ideas welcome. Park every critique for `converge`.
2. Open with a fast free-association round to build momentum, capturing ideas as a numbered list.
3. When the obvious ideas dry up, deliberately switch techniques from `references/creativity-toolkit.md` to break fixation — do not rely on one. Rotate through at least three:
   - **Inversion** — "How would we guarantee this fails?", then negate each failure into an idea.
   - **Analogies** — "How does another domain (games, biology, logistics, nature) solve a structurally similar problem?"
   - **SCAMPER** — push the current best idea through Substitute / Combine / Adapt / Modify / Put-to-other-use / Eliminate / Reverse.
   - **Six Thinking Hats** — rotate angles, using the green/red hats to spawn ideas, not to filter.
4. Drive volume: when the user offers one idea, push for three more. Build on their ideas ("yes, and…") rather than replacing them. Aim for 25+ ideas.
5. Tag each idea with the technique or angle that produced it (helps clustering later), but never with a quality verdict.
6. Stop when the user is tapped out AND at least three techniques have been used. Hand off: "Divergence done — N ideas. Switching to convergence; now we judge."

## Test

**Pattern C — LLM assertion with example:**
Assert: "The phase produces a numbered idea inventory drawn from at least three distinct techniques, with no idea evaluated, ranked, or filtered for quality during this phase; any user critique was explicitly deferred." Example of a correct fragment:
```
12. SCAMPER/Combine: merge the empty-state and the tutorial into one interactive seed
13. Analogy (IKEA): ship a half-assembled workspace the user finishes themselves
14. Inversion-negated: never email the user on day 1  ->  send a single value-first day-1 email
(no scores, no "good/bad" tags present)
```
