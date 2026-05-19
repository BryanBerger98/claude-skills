# Eval mode

skill-doctor ships its own eval / benchmark / improve loop. Dispatch is via `scripts/target_adapter.py` (one adapter per target_kind). Trigger eval is only meaningful for kinds whose description routes a tool call — currently `skill` (Skill/Read trigger) and `subagent` (Agent/Task delegation). Other kinds use grader / comparator / structural audit instead.

Capability matrix lives in `SKILL.md` (target table).

## Trigger-accuracy loop (skill, subagent)

1. Ask user for 5-10 trigger prompts (mix of should-trigger + should-NOT-trigger) or generate and have user review.
2. Run `scripts/run_loop.py --target-path <path> --eval-set <queries.json> --model <model> --verbose`.
   - Auto-detects target_kind via `scripts/utils.detect_target_kind`; override with `--target-kind`.
   - Splits eval set train/test (default 40% holdout) to avoid overfitting the description.
   - Up to `--max-iterations` (default 5). Stops early when all train queries pass.
   - Live HTML report opens in browser.
3. Inspect best description; if user accepts, write back via `adapter.write_field()` (or apply the edit yourself).

## Benchmark (output quality)

For target kinds that produce output (skill, subagent, prompt):

1. Define 1-3 evals with prompts + expectations (see `schemas.md` → `evals.json`).
2. Run `with_target` vs `without_target` configs ≥ 3 runs each.
3. Grade each run via the `grader` bundled subagent (see `../agents/grader.md`).
4. Aggregate via `scripts/aggregate_benchmark.py --target-name … --target-path … --target-kind …`.
5. Analyze via `../agents/analyzer.md` (post-hoc winner/loser analysis or cross-run pattern detection).

## Static-only target kinds

`mcp_json`, `claude_md`, `claude_dir` get audit via checklists + `quick_validate.py`; no eval loop. Use:

```bash
python scripts/quick_validate.py <path>        # auto-detect
python scripts/quick_validate.py <path> claude_md  # explicit
```
