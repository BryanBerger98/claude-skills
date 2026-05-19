---
name: skill-doctor
description: Audit, diagnose, evaluate, or benchmark existing Claude Code skills, subagents, prompts, .mcp.json, CLAUDE.md, or .claude/ trees. Triggers on verbs like audit/review/diagnose/debug/analyze/benchmark/test plus a named target — e.g. "review this skill", "why isn't this agent activating", "audit my .claude folder". Do NOT use to create primitives from scratch — route to prompt-creator / subagent-creator instead.
---

# skill-doctor

Diagnose, iteratively improve, and empirically eval existing Claude Code primitives: skills, subagents, prompts, `.mcp.json`, `CLAUDE.md`, full `.claude/` trees.

**Analyzer + orchestrator, never executor.** Assumes a target exists. Produces structured findings (audit reports, eval scores, trigger measurements, benchmark comparisons). After report, user picks which fixes to apply; skill-doctor then **dispatches the rewriting to its bundled builder agents** (`prompt-builder` for prompts, `subagent-builder` for Claude Code subagents), passing audit findings + chosen fixes as briefing.

## When this skill fires

User says **analytical verb** + names a skill, agent, prompt, `.mcp.json`, `CLAUDE.md`, or `.claude` directory:

- ✅ Trigger verbs: audit, review, diagnose, evaluate, benchmark, test, analyze, debug, measure, score, "why isn't X working/triggering/firing".
- ✅ Also fires on improve/optimize/fix/rewrite **when an existing target is named** — skill-doctor audits first, then dispatches to its bundled builder agents. Don't skip the audit step.
- ❌ Do NOT trigger when user wants to CREATE a new primitive from scratch with no existing target. Those route to `prompt-creator` (new prompt) or `subagent-creator` (new subagent).
- Gray zone: "improve trigger accuracy" — measurement intent → skill-doctor fires (audit-then-dispatch workflow).

If user just says "look at this skill" without an analytical intent, still load — first response should confirm goal ("audit for what? trigger accuracy, structure, tokens, all?") before doing work.

## Operating mode: interactive iterative

Default loop. Never silently rewrite. Each cycle:

1. **Identify target** — file path? raw content? whole directory? Ask if ambiguous.
2. **Set focus** — full audit, single axis (trigger / structure / tokens / coherence / quality), or specific complaint ("it never activates").
3. **Gather context** in parallel (one assistant message, multiple tool calls):
   - `Explore` subagent: scan `.claude/` tree, list siblings, find references.
   - WebFetch official docs (only if cache stale — see `references/official-docs.md`).
   - `Context7` MCP if target touches Anthropic SDK.
   - Read target file + adjacent files (settings.json, hooks, CLAUDE.md).
   - Note: `code-review-graph` MCP does not cover `.claude/` markdown artifacts — for skill/agent/MCP audits use `Explore`/`Read` directly even if project CLAUDE.md mandates graph-first for source code.
4. **Audit** — apply checklist from `references/checklists/<target-type>.md` and `references/analysis-criteria.md`. Produce scored report.
5. **Propose** — present scored report with findings + 2-3 fix options per finding. **Wait for user input.** Never apply without confirmation.
6. **Dispatch apply** — after user picks fixes, invoke the appropriate bundled builder agent via the `Agent` tool (`subagent_type: general-purpose`), inlining the builder's full prompt as briefing along with `target_path`, `target_field`, `audit_findings`, and `chosen_fixes`:
   - Prompt or `SKILL.md` description rewrite → `agents/prompt-builder.md`
   - Claude Code subagent rewrite → `agents/subagent-builder.md`
   - `.mcp.json` / `CLAUDE.md` / structural `.claude/` fixes → edit directly (no builder owns these).
   skill-doctor does NOT write the rewrite itself. The builder agent returns a JSON change-report.
7. **Re-measure** — re-run relevant checklist + eval after rewrite to confirm fix worked and didn't break other axes.
8. **Loop** — ask "next axis?" or "ship?". Don't stop early; don't churn endlessly. 2-4 cycles typical.

## Target types

| Target                   | Checklist                        | Axes                                          | Trigger eval | Benchmark | Improve loop            |
| ------------------------ | -------------------------------- | --------------------------------------------- | ------------ | --------- | ----------------------- |
| Skill (`SKILL.md`)       | `checklists/skill.md`            | trigger, structure, tokens, examples          | yes          | yes       | description optimizer   |
| Subagent (`agents/*.md`) | `checklists/agent.md`            | tool scope, description, system prompt        | yes          | yes       | description optimizer   |
| Raw prompt               | `checklists/skill.md` (sections) | structure, specificity, output shape          | no           | yes       | manual diff w/ grader   |
| `.mcp.json`              | `checklists/mcp.md`              | server scope, auth, env vars, redundancy      | no           | no        | static checklist        |
| `CLAUDE.md`              | `checklists/claudemd.md`         | conciseness, override clarity, no-rot risk    | no           | no        | static checklist        |
| `.claude/` tree          | `checklists/structure.md`        | coherence, duplication, conflicts, dead files | no           | no        | structure-auditor agent |

All checklist paths relative to `references/`.

## Delegation rules

Spawn **in parallel** when work is independent:

- **`Explore` (subagent)** — locate files, list siblings, grep references. Always use for `.claude/` audits.
- **`general-purpose` (subagent)** — deep cross-file consistency audit, duplicate-detection, dead-skill detection. Use when target is whole `.claude/` and analysis exceeds single-context budget.
- **bundled analyzer subagents** — `skill-doctor/agents/structure-auditor.md`, `skill-analyzer.md`, `agent-analyzer.md`, `analyzer.md`, `comparator.md`, `grader.md`. Reference these via Agent tool with `subagent_type: general-purpose` and inline their prompt as briefing, since project-bundled agents aren't auto-registered. Read-only.
- **bundled builder subagents** — `skill-doctor/agents/prompt-builder.md`, `subagent-builder.md`. Invoked during the **Dispatch** phase to apply chosen fixes. Same invocation pattern (Agent tool, `general-purpose`, inline prompt). These have Edit/Write authority; never invoke them without an explicit audit + user-approved `chosen_fixes`. Builder returns JSON change-report; skill-doctor uses it for re-measure.

Never delegate the synthesis. Subagents return findings; you decide what to change.

## Documentation freshness

Authoritative sources cached in `references/official-docs.md` with `last_fetched` timestamps. Before citing a behavior:

- If `last_fetched` ≥ 7 days old for a referenced URL → run `scripts/fetch_docs.py <url>` to refresh, or WebFetch on demand.
- For Anthropic SDK questions (Claude API, prompt caching, tool use) → prefer `mcp__claude_ai_Context7__resolve-library-id` then `query-docs` over WebFetch.
- For "what's new" → fetch `github.com/anthropics/claude-code/releases` latest tag and changelog.

Always state version/date when quoting docs. Never claim a feature exists without verifying current docs say so.

## Output shape (audit report)

Every audit returns this structure to the user:

```
## Target: <path or summary>
## Focus: <axes>

### Findings
- [SEVERITY] <axis>: <one-line issue> — evidence: <line/quote>
  - Why it matters: <impact>
  - Suggested fix: <concrete change>

### Score
- Trigger:     X/5
- Structure:   X/5
- Tokens:      X/5
- Coherence:   X/5
- Quality:     X/5

### Next iteration
<recommended single change to apply now, with diff>
```

Severities: BLOCKER / MAJOR / MINOR / NIT. Don't pad with NITs if MAJORs exist — fix big stuff first.

## Eval mode

Empirical loops live in `references/eval-mode.md`: trigger-accuracy (skill, subagent), benchmark (output quality, skill/subagent/prompt), static-only audit (mcp_json, claude_md, claude_dir). Dispatch via `scripts/target_adapter.py` + `scripts/run_loop.py`. Capability matrix in target-types table above. Results rendered via `eval-viewer/viewer.html` (built by `eval-viewer/generate_review.py`).

## Anti-patterns to flag

When reviewing, watch for these (common Claude Code skill/agent failure modes):

- Description too vague ("helps with code") → won't trigger reliably.
- Description too narrow ("only for React 18.2 hooks") → misses adjacent intents.
- No trigger examples in description → model can't infer activation context.
- Skill bundles giant reference material in `SKILL.md` body → blows context every load; move to `references/` and link.
- Subagent system prompt restates Claude Code base instructions → wasted tokens, conflict risk.
- `CLAUDE.md` documents code structure (rots) instead of conventions/decisions (durable).
- `.mcp.json` includes servers user hasn't enabled, or duplicates global config.
- Multiple skills with overlapping descriptions → activation lottery.
- Skill references files that no longer exist (paths rot after rename).

## Guardrails

- Never edit a file without showing diff and getting "go" / "ok" / "apply" from user.
- Never delete files without explicit confirmation per file.
- Don't suggest renames that break symlinks or references (check `~/.claude/skills/` symlinks, `~/.claude/agents/`, settings.json paths) — `Explore` first.
- When skill lives in `~/.agents/skills/<name>/` with symlink in `~/.claude/skills/<name>` → edit the real file, symlink follows.
