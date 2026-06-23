# 01 — Frame the problem

Turn a vague topic into a sharp, brainstormable challenge before any idea is generated. This phase is pure dialogue.

## Inputs

- `topic` (required) — the raw challenge the user wants to brainstorm (a product/feature area or a technical/architecture problem).

## Outputs

A short framing brief, confirmed by the user, that the divergence phase will run against.

```
Challenge (How Might We): How might we cut first-week onboarding drop-off for solo users?
Goal / definition of success: 30-day retention of new signups up from 22% to 35%.
Constraints: no new paid tooling; ship within one quarter; mobile-first.
Hard boundaries (out of scope): pricing changes, the referral program.
Whose problem: brand-new solo users in days 0–7.
Assumptions to challenge: "users churn because the product is too complex."
```

## Process

1. Restate the topic in one sentence and confirm you understood it.
2. Ask, one at a time (always offering your recommended answer), enough to fill the brief: what does success look like and how is it measured; what are the hard constraints and out-of-scope boundaries; whose problem is this; what's the timebox/appetite.
3. Surface the implicit assumption baked into the topic and name it explicitly — divergence will later attack it.
4. Reframe the topic as one or more "How Might We …" questions. A good HMW is not too broad (solve world hunger) nor too narrow (a pre-baked solution). Offer 2–3 framings and let the user pick or merge.
5. If the topic is actually two unrelated challenges, split it and ask which to run first.
6. Echo the final framing brief back. Get an explicit "yes" before handing off to `diverge` with: "Framing locked. Switching to divergence — no judging from here."

## Test

**Pattern C — LLM assertion with example:**
Assert: "The phase ends only after the user confirms a framing brief that contains a How-Might-We question, a measurable definition of success, and explicit constraints — and at least one baked-in assumption was named for later challenge." Example of a correct closing brief:
```
Challenge (HMW): How might we let teams reuse past brainstorm outputs without manual copy-paste?
Success: 50% of sessions start from a prior artifact within 2 months.
Constraints: no schema migration; reuse existing storage.
Assumption to challenge: "users want a template gallery."
```
