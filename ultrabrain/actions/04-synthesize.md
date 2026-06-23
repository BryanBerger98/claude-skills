# 04 — Synthesize

Write the deliverable: a structured Markdown document capturing the whole session plus a concrete action plan for the chosen idea.

## Inputs

- `session` (required) — the framing brief, full idea inventory, clusters, scoring, and chosen idea from phases 01–03.
- `output_path` (optional, default: `./ultrabrain-<topic-slug>.md`) — where to write the document. Confirm with the user.

## Outputs

A single Markdown file written to disk, following `assets/brainstorm-doc-template.md`. It MUST contain these sections: Problem statement, Idea inventory, Clusters & evaluation, Top picks, and Action plan.

```
ultrabrain-onboarding-dropoff.md
├── # Problem statement        (HMW + success metric + constraints)
├── ## Idea inventory          (all raw ideas, grouped by technique)
├── ## Clusters & evaluation   (themes + scoring table)
├── ## Top picks               (top 2-3 + recommendation)
└── ## Action plan             (chosen idea → concrete next steps, owner, sequencing, first milestone)
```

## Depends on

- `03-converge`

## Process

1. Copy `assets/brainstorm-doc-template.md` and fill every section from the session context. Do not drop the raw inventory — losing rejected ideas loses the session's value.
2. Write the **Problem statement** from the framing brief verbatim (HMW, success metric, constraints).
3. Write the **Action plan** for the chosen idea concretely: the immediate next step, a short sequenced task list, the first measurable milestone tied to the success metric, owners/placeholders, and known risks with mitigations. No vague "explore further".
4. Write the file to `output_path` (confirm the path first).
5. Run the deliverable check (see Test) against the written file and fix any missing section before declaring done.
6. Summarize to the user in chat: chosen idea, where the file is, and the single first action to take.

## Test

**Pattern A — JS script (preferred):**
```bash
node scripts/check-deliverable.js <output_path>
```
Verifies the written document contains all five required sections (Problem statement, Idea inventory, Clusters & evaluation, Top picks, Action plan) and a non-empty action plan. Exits non-zero with a diagnostic if any section is missing or the action plan is empty.
