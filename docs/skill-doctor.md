# skill-doctor

Audit, diagnose, and iteratively improve Claude Code primitives. Works on skills, subagents, prompts, `.mcp.json`, `CLAUDE.md`, and full `.claude/` trees.

## When to use

Say an **analytical verb** + name a target:

```
audit my skill-doctor skill
review the subagent-creator agent
why isn't my commit skill triggering?
benchmark this prompt
analyze my .claude/ folder
diagnose the CLAUDE.md
```

**Does NOT create primitives from scratch.** Use `prompt-creator` (new prompt) or `subagent-creator` (new agent) instead.

Gray zone — "improve trigger accuracy" still fires skill-doctor (audit-first, then dispatch to builders).

## Supported target types

| Target | Trigger eval | Benchmark | Checklist |
|---|---|---|---|
| `SKILL.md` | yes | yes | `checklists/skill.md` |
| `agents/*.md` | yes | yes | `checklists/agent.md` |
| Raw prompt | no | yes | `checklists/skill.md` (partial) |
| `.mcp.json` | no | no | `checklists/mcp.md` |
| `CLAUDE.md` | no | no | `checklists/claudemd.md` |
| `.claude/` tree | no | no | `checklists/structure.md` |

## Audit workflow

Each session runs this loop (2-4 cycles typical):

1. **Identify target** — file path, raw content, or whole directory. Asks if ambiguous.
2. **Set focus** — full audit, or a single axis: trigger / structure / tokens / coherence / quality.
3. **Gather context** — parallel: `Explore` subagent scans `.claude/` tree; reads target file + adjacent files (`settings.json`, `CLAUDE.md`, siblings).
4. **Audit** — applies the appropriate checklist, produces a scored report.
5. **Propose** — presents findings with 2-3 fix options each. Waits for user input before touching anything.
6. **Dispatch apply** — after user picks fixes, invokes a bundled builder agent:
   - Prompt or `SKILL.md` description → `agents/prompt-builder.md`
   - Subagent rewrite → `agents/subagent-builder.md`
   - `.mcp.json` / `CLAUDE.md` / structural fixes → edits directly
7. **Re-measure** — re-runs checklist after rewrite to confirm fix landed cleanly.
8. **Loop** — asks "next axis?" or "ship?".

## Scoring

Every audit returns scores across 5 axes (each 0–5):

| Axis | What it measures |
|---|---|
| **Trigger** | `description:` clarity — WHAT + WHEN + negative triggers |
| **Structure** | Section order, examples, guardrails, file layout |
| **Tokens** | Proportional body length, no inline reference dumps, no filler |
| **Coherence** | No overlap with sibling skills/agents, no broken cross-refs |
| **Quality** | Output shape defined, edge cases covered, failure modes documented |

Severity of findings: **BLOCKER** → **MAJOR** → **MINOR** → **NIT**. Blockers are fixed before anything else. Iteration stops when all axes ≥ 4 and no BLOCKER/MAJOR remain.

### Report format

```
## Target: <path>
## Focus: <axes>

### Findings
- [SEVERITY] <axis>: <issue> — evidence: <quote>
  - Impact: <what fails>
  - Fix: <concrete change>

### Score
| Axis      | Score | Notes |
| Trigger   | X/5   | ...   |
| Structure | X/5   | ...   |
| Tokens    | X/5   | ...   |
| Coherence | X/5   | ...   |
| Quality   | X/5   | ...   |

### Recommended next change
<single concrete edit, with proposed diff>
```

## Eval mode (empirical trigger-accuracy)

For skills and subagents, skill-doctor can run an empirical trigger-accuracy loop:

1. Provide (or generate) 5-10 prompts — mix of should-trigger and should-NOT-trigger.
2. Run the loop:
   ```bash
   python scripts/run_loop.py \
     --target-path <path> \
     --eval-set queries.json \
     --model claude-sonnet-4-6 \
     --verbose
   ```
3. Loop auto-detects target kind, splits train/test (40% holdout by default), runs up to `--max-iterations` (default 5), stops early when all train queries pass.
4. Results render live in `eval-viewer/viewer.html`.
5. Accept or reject the improved description — skill-doctor writes it back.

### Benchmark (output quality)

```bash
python scripts/aggregate_benchmark.py \
  --target-name <name> \
  --target-path <path> \
  --target-kind skill
```

Runs `with_target` vs `without_target` ≥ 3 times each, grades via the `grader` subagent, aggregates results.

### Static validation (mcp.json, CLAUDE.md, .claude/)

```bash
python scripts/quick_validate.py <path>            # auto-detect type
python scripts/quick_validate.py <path> claude_md  # explicit
```

## Bundled agents

| Agent | Role |
|---|---|
| `skill-analyzer.md` | Deep skill audit |
| `agent-analyzer.md` | Deep subagent audit |
| `structure-auditor.md` | Full `.claude/` tree coherence check |
| `analyzer.md` | Post-hoc benchmark winner/loser analysis |
| `comparator.md` | Cross-run comparison |
| `grader.md` | Output quality grading |
| `prompt-builder.md` | Rewrites prompts / `SKILL.md` descriptions (builder, needs audit first) |
| `subagent-builder.md` | Rewrites subagent files (builder, needs audit first) |

Builders are invoked only after an explicit audit + user-approved fixes. Never run builders directly.

## Common failure modes flagged

- Description too vague → won't trigger reliably
- Description too narrow → misses adjacent intents
- No trigger examples → model can't infer activation context
- Giant reference material inline in `SKILL.md` → blows context; move to `references/`
- Subagent prompt restates Claude Code base instructions → wasted tokens
- `CLAUDE.md` documents code structure instead of decisions → rots
- Multiple skills with overlapping descriptions → activation lottery
- Skill references files that no longer exist

## Guardrails

- Never edits a file without showing diff and getting explicit confirmation.
- Never deletes files without per-file confirmation.
- Checks symlinks before suggesting renames (`~/.claude/skills/`, `~/.claude/agents/`).
- `code-review-graph` MCP does not index `.claude/` markdown — uses `Explore`/`Read` directly for skill/agent audits even when project `CLAUDE.md` mandates graph-first.
