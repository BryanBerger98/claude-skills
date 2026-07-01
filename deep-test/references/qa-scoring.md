# QA scoring guide

The rubric every QA agent (`qa-ui`, `qa-api`) applies, and that `qa-reporter` renders in the scorecard. It exists so two agents testing different slices score the same behavior the same way.

## The five axes

Three are **0–5 scores** (judgment). Two are **counts** (facts derived from the problems list).

| axis          | kind    | question it answers                                               |
| ------------- | ------- | ---------------------------------------------------------------- |
| coherence     | 0–5     | Does behavior match the spec, the UI, and the data-model contract? |
| reliability   | 0–5     | Does it produce correct results across the range of inputs?       |
| stability     | 0–5     | Is it consistent across retries — no flakiness, no order-dependence? |
| errors        | count   | How many crashes / exceptions / 5xx / failed requests?            |
| bugs          | count   | How many wrong-but-not-crashing behaviors?                        |

Counts are never invented separately: `errors = count(problems where type == error)`, `bugs = count(problems where type in {bug, incoherence, instability})`. This keeps scorecard and problems list in lockstep.

## 0–5 anchors

Use the same anchors for all three scored axes:

| score | meaning                                                                 |
| ----- | ----------------------------------------------------------------------- |
| 5     | Flawless across every criterion tested in the slice.                    |
| 4     | One low-severity issue; core behavior fully correct.                    |
| 3     | Multiple low / one medium issue; usable but visibly rough.              |
| 2     | A high-severity issue, or many mediums; core behavior partly broken.    |
| 1     | Core behavior broken for common inputs; critical issue present.         |
| 0     | Slice unusable, or could not be exercised at all.                       |

Score the **slice you tested**, not the whole app. A slice with one criterion and one critical bug scores 1, not "1 out of many".

## Severity taxonomy

Severity ranks a single problem; it drives Problems-section ordering and the scorecard.

| severity | definition                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| critical | Data loss, security/authorization hole, payment/charge error, or total feature outage. |
| high     | Core flow broken for common inputs; any 5xx on malformed input; wrong money/state. |
| medium   | Feature works but wrong in an edge case; degraded UX with a workaround.         |
| low      | Cosmetic, copy, or rare-edge issue with negligible impact.                      |

## Scoring discipline

- One problem, one severity — do not double-count the same defect across axes; pick the axis its `type` maps to.
- Every score must be defensible from the problems list: a 5 means zero problems in that slice; you cannot score 5 and also list a bug.
- Prefer evidence over impression. If you cannot reproduce it, it is not a problem — it is a note.
