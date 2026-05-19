# Checklist: skill audit

Apply to `SKILL.md` or raw skill content.

## Frontmatter

- [ ] `name:` present, kebab-case, matches directory name
- [ ] `description:` present
- [ ] Description states WHAT the skill does
- [ ] Description states WHEN to use (trigger contexts)
- [ ] Description includes 2+ example trigger phrases
- [ ] Description declares boundaries with adjacent skills ("Do NOT use for X — delegate to Y")
- [ ] Description ≤ 3 sentences but ≥ 1 sentence
- [ ] First verb is specific (not "helps", "assists", "works with")
- [ ] Optional fields valid if present (`metadata`, `allowed-tools`, etc.)

## Body structure

- [ ] H1 title matches name
- [ ] Workflow/algorithm appears early (within first ~50 lines)
- [ ] Sections in logical order (entry → core workflow → edge cases → guardrails)
- [ ] H2/H3 hierarchy consistent
- [ ] No single section > 100 lines (split or move to references/)
- [ ] Total body < ~500 lines (heavy material → references/)

## Examples & specificity

- [ ] At least 1 concrete input → output example
- [ ] Examples cover non-obvious behavior
- [ ] Anti-patterns explicitly documented
- [ ] Edge cases mentioned

## Guardrails

- [ ] States what the skill must NOT do
- [ ] User confirmation required for destructive actions
- [ ] Delegation boundaries (when to invoke other skills/agents)

## File layout (if multi-file skill)

- [ ] `references/` exists if reference material is substantial
- [ ] `scripts/` exists if skill uses executable helpers
- [ ] `agents/` exists if skill bundles subagent prompts
- [ ] No broken file paths inside SKILL.md
- [ ] Symlink targets (if any) exist

## Token efficiency

- [ ] No restatement of Claude Code base instructions
- [ ] No filler ("in order to", "really", "just", "simply", "basically")
- [ ] Reference material in `references/`, not inline
- [ ] Tables used for dense comparisons
- [ ] Code blocks for code, not for emphasis

## Coherence (cross-skill check)

- [ ] No sibling skill claims same trigger space
- [ ] If overlap exists, this skill or sibling declares the boundary
- [ ] Cross-referenced skills/agents/scripts exist

## Trigger test (quick eval)

Generate 5 prompts likely to fire this skill and 5 prompts that shouldn't. Reason about activation:

- True positives: does description language match?
- False positives: does description bleed into adjacent intents?
- False negatives: missing trigger phrases?

If unsure → run `scripts/run_loop.py --target-path <path>` for empirical trigger-accuracy measurement.
