# Analysis criteria & scoring grid

Used by skill-doctor to produce structured audit reports. Each axis scored 0-5.

## Axes

### 1. Trigger accuracy (skills, agents)

- Does `description:` clearly state WHAT + WHEN?
- Are there example trigger phrases?
- Are negative triggers / boundaries with adjacent skills declared?
- Specific vs. vague verbs.
- Length appropriate (1-3 sentences for skills, similar for agents).

**Score**

- 5: precise, names triggers, declares boundaries
- 4: precise but missing negative triggers
- 3: clear but generic verbs
- 2: vague WHAT or vague WHEN
- 1: both vague
- 0: missing or contradictory description

### 2. Structure & completeness

- Sections present and in logical order.
- Examples included where behavior is non-obvious.
- Guardrails explicit.
- File layout matches conventions (`references/`, `scripts/`, `agents/`).

**Score**

- 5: all sections present, well-ordered, examples + guardrails
- 4: minor gap (one section thin)
- 3: missing examples or guardrails
- 2: structural issues (wrong order, mixed concerns)
- 1: barely organized
- 0: unstructured wall of text

### 3. Token efficiency

- Body length proportional to complexity.
- Reference material moved to `references/` not inline.
- No restatement of harness/framework defaults.
- Tables/lists used for dense info.
- No filler ("in order to", "really", "just", etc.).

**Score**

- 5: tight, no waste
- 4: minor verbosity
- 3: ~20% removable without loss
- 2: significant bloat, references inline
- 1: most content could move out or compress
- 0: unusable bloat

### 4. Coherence with surroundings

- For skills: no overlap with sibling skills (same trigger space → activation lottery).
- For agents: tool scope matches stated role.
- For `.claude/` tree: skills/agents/commands cross-reference correctly, no orphan paths.
- For CLAUDE.md: no contradiction with skills/settings.

**Score**

- 5: clean separation, no conflicts
- 4: minor overlap noted but distinguishable
- 3: one ambiguous boundary
- 2: clear duplicate trigger space
- 1: contradictions present
- 0: actively breaks neighbors

### 5. Quality of result

- Does the artifact reliably produce the claimed outcome?
- Output format specified?
- Edge cases addressed?
- Failure modes documented?

**Score**

- 5: output shape explicit, edge cases covered
- 4: output shape clear, edge cases thin
- 3: output shape implicit
- 2: output undefined → variable results
- 1: workflow unclear how it produces outcome
- 0: stated outcome not achievable from given instructions

## Severity mapping (findings)

- **BLOCKER** — skill/agent will not function or will actively misfire on common inputs
- **MAJOR** — visible quality loss in typical use (vague trigger, wrong output format, broken reference)
- **MINOR** — refinement opportunity (tighter wording, better example, dedupe)
- **NIT** — preference / cosmetic (capitalization, table vs. list)

## Decision rule

- If any BLOCKER → propose fix THIS iteration before anything else.
- Otherwise → tackle highest-severity finding on lowest-scoring axis.
- Stop iterating when all axes ≥ 4 AND no BLOCKER/MAJOR remain, unless user wants more.

## Reporting template

```
## Target: <path>
## Focus: <axes evaluated>

### Findings (sorted by severity)
- [BLOCKER] <axis>: <issue> — evidence: <quote/line>
  - Impact: <what fails>
  - Fix: <concrete change>

### Score
| Axis      | Score | Notes |
| --------- | ----- | ----- |
| Trigger   | X/5   | ...   |
| Structure | X/5   | ...   |
| Tokens    | X/5   | ...   |
| Coherence | X/5   | ...   |
| Quality   | X/5   | ...   |

### Recommended next change
<single concrete edit, with proposed diff>
```
