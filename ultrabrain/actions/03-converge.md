# 03 — Converge

Turn the raw inventory into a ranked shortlist. This is where judgment is allowed and required.

## Inputs

- `idea_inventory` (required) — the numbered output of `diverge` (or a raw idea list the user brings in directly).
- `criteria` (optional, default: impact, effort, confidence) — the dimensions ideas are scored on; adjust to the framing brief's success metric.

## Outputs

Clustered ideas, a scoring table, and an explicit top shortlist with rationale.

```
Clusters:
  A. Reduce time-to-first-value  (#1, #2, #5, #12)
  B. Re-sequence the first session (#4, #13)
  C. Behavioral nudges  (#2, #6)

Scoring (1-5):
| Idea                                   | Impact | Effort(inv) | Confidence | Score |
| -------------------------------------- | ------ | ----------- | ---------- | ----- |
| Seeded starter workspace (#1)          | 5      | 3           | 4          | 12    |
| Day-2 "one tiny win" nudge (#2)        | 4      | 5           | 4          | 13    |
| Defer account creation (#5)            | 4      | 2           | 3          | 9     |

Top picks: #2 (highest score, lowest effort), #1 (highest impact). Recommend starting with #2.
```

## Depends on

- `02-diverge`

## Process

1. Cluster the inventory into 3–6 themes so duplicates and variations collapse together. Name each cluster.
2. Confirm the scoring criteria with the user; tie them to the framing brief's definition of success. Default to impact × effort(inverted) × confidence.
3. Score the strongest candidate from each cluster (don't score all 25 — score representatives, then expand only if two are close). Be honest and direct; this is the phase where critique is welcome.
4. Apply a sanity lens from `references/creativity-toolkit.md` (Six Hats black/yellow): for each top candidate, state the single biggest risk and the single biggest upside.
5. Surface the top 2–3 and give a clear recommendation on where to start, with the one-line reason. Note any "sleeper" idea worth keeping warm.
6. Get the user to commit to one idea to carry into `synthesize`. If they can't choose, recommend the highest score-to-effort ratio.

## Test

**Pattern C — LLM assertion with example:**
Assert: "The phase outputs named clusters, a scoring table over agreed criteria tied to the success metric, and a top 2–3 shortlist with an explicit recommendation and a chosen idea to carry forward." Example of a correct closing line:
```
Recommendation: start with #2 (score 13, lowest effort, ships this sprint). Keep #1 warm as the next bet. Chosen to plan: #2.
```
