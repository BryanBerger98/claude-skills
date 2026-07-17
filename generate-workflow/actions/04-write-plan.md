# 04 — Write plan

Compose the architecture and write the plan file — the skill's single artifact — with an ROI-ordered build sequence and a builder-skill handoff.

## Inputs

- `need_brief` (required) — from `frame-need`.
- `inventory` (required) — from `audit-setup` (agent-returned table + reuse shortlist).
- `doc_notes` (required) — sourced notes + discarded types from `research-docs`.

This action is the synthesis and is never delegated: it is the only place where brief, inventory, and doc notes meet.

## Outputs

`.claude/docs/architecture/<slug>.md` in the target project, following `assets/plan-template.md`. Excerpt of a correct section 6:

```markdown
## 6. Handoff

| Component        | Builder          | Invocation hint                                            |
| ---------------- | ---------------- | ---------------------------------------------------------- |
| review-workflow  | generate-skill   | "/generate-skill Crée une skill review-workflow qui …"     |
| pr-diff-analyzer | generate-agent | "/generate-agent agent lecture seule qui analyse …"      |
| block-env-edits  | update-config    | "hook PreToolUse bloquant Edit sur .env"                   |
```

## Depends on

- `02-audit-setup`
- `03-research-docs`

## Process

1. Arbitrate reuse-vs-build: for every candidate component, check the inventory first — `reuse` rows replace a build, `extend` rows shrink one, and any `duplication-risk` row must be resolved (reuse it or justify the overlap in section 4). Then assign each remaining component its role and model tier using `doc_notes`.
2. Compute `slug` (kebab-case short name of the need) and the target path `.claude/docs/architecture/<slug>.md` relative to the target project root; create the directory if needed.
3. Copy `assets/plan-template.md` to the target path and fill all 8 sections. Non-negotiables: every section-4 rationale block cites ≥ 1 source URL from `doc_notes`; section-5 phases are ordered by ROI (quick wins first); section 6 maps every section-3 component to its builder per the SKILL.md handoff vocabulary; section 8 lists the discarded types with their reasons.
4. Run `node scripts/validate-plan.js <plan-file>` (path relative to this skill's directory); fix and re-run until it prints OK.
5. Present the user a summary — components, build order, first phase — and ask for validation (validate / amend). Apply amendments, re-run the validator, and repeat until the user validates.

## Test

**Pattern A — JS script (preferred):**

```bash
node scripts/validate-plan.js .claude/docs/architecture/<slug>.md
```
