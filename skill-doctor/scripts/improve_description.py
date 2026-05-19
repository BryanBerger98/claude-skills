#!/usr/bin/env python3
"""Improve a skill or subagent description from eval results.

Calls `claude -p` to generate a new description. Uses TargetAdapter to build
the kind-specific prompt and to write the result back.
"""

import argparse
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from scripts.target_adapter import get_adapter
from scripts.utils import detect_target_kind


def _call_claude(prompt: str, model: str | None, timeout: int = 300) -> str:
    cmd = ["claude", "-p", "--output-format", "text"]
    if model:
        cmd.extend(["--model", model])
    env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}
    result = subprocess.run(
        cmd,
        input=prompt,
        capture_output=True,
        text=True,
        env=env,
        timeout=timeout,
    )
    if result.returncode != 0:
        raise RuntimeError(f"claude -p exited {result.returncode}\nstderr: {result.stderr}")
    return result.stdout


def improve_description(
    *,
    adapter,
    info,
    current_description: str,
    eval_results: dict,
    history: list[dict],
    model: str,
    test_results: dict | None = None,
    log_dir: Path | None = None,
    iteration: int | None = None,
) -> str:
    train_score = f"{eval_results['summary']['passed']}/{eval_results['summary']['total']}"
    if test_results:
        test_score = f"{test_results['summary']['passed']}/{test_results['summary']['total']}"
        scores_summary = f"Train: {train_score}, Test: {test_score}"
    else:
        scores_summary = f"Train: {train_score}"

    prompt = adapter.improve_prompt(
        info=info,
        current_field=current_description,
        eval_results=eval_results,
        history=history,
        test_results=test_results,
        scores_summary=scores_summary,
    )

    text = _call_claude(prompt, model)
    match = re.search(r"<new_description>(.*?)</new_description>", text, re.DOTALL)
    description = match.group(1).strip().strip('"') if match else text.strip().strip('"')

    transcript: dict = {
        "iteration": iteration,
        "prompt": prompt,
        "response": text,
        "parsed_description": description,
        "char_count": len(description),
        "over_limit": len(description) > 1024,
    }

    if len(description) > 1024:
        shorten_prompt = (
            f"{prompt}\n\n---\n\n"
            f"A previous attempt produced this description, which at "
            f"{len(description)} characters is over the 1024-character hard limit:\n\n"
            f'"{description}"\n\n'
            f"Rewrite it to be under 1024 characters while keeping the most "
            f"important trigger words and intent coverage. Respond with only "
            f"the new description in <new_description> tags."
        )
        shorten_text = _call_claude(shorten_prompt, model)
        m2 = re.search(r"<new_description>(.*?)</new_description>", shorten_text, re.DOTALL)
        shortened = m2.group(1).strip().strip('"') if m2 else shorten_text.strip().strip('"')
        transcript["rewrite_prompt"] = shorten_prompt
        transcript["rewrite_response"] = shorten_text
        transcript["rewrite_description"] = shortened
        transcript["rewrite_char_count"] = len(shortened)
        description = shortened

    transcript["final_description"] = description

    if log_dir:
        log_dir.mkdir(parents=True, exist_ok=True)
        log_file = log_dir / f"improve_iter_{iteration or 'unknown'}.json"
        log_file.write_text(json.dumps(transcript, indent=2))

    return description


def main():
    parser = argparse.ArgumentParser(description="Improve a description from eval results")
    parser.add_argument("--eval-results", required=True)
    parser.add_argument("--target-path", required=True)
    parser.add_argument("--target-kind", default=None)
    parser.add_argument("--history", default=None)
    parser.add_argument("--model", required=True)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    target_path = Path(args.target_path)
    kind = args.target_kind or detect_target_kind(target_path)
    adapter = get_adapter(kind)
    if not adapter.supports_trigger_eval:
        print(f"Error: improvement via eval not supported for target_kind={kind!r}", file=sys.stderr)
        sys.exit(2)

    info = adapter.parse(target_path)
    eval_results = json.loads(Path(args.eval_results).read_text())
    history = []
    if args.history:
        history = json.loads(Path(args.history).read_text())

    current_description = eval_results["description"]

    if args.verbose:
        print(f"Current: {current_description}", file=sys.stderr)
        print(f"Score: {eval_results['summary']['passed']}/{eval_results['summary']['total']}", file=sys.stderr)

    new_description = improve_description(
        adapter=adapter,
        info=info,
        current_description=current_description,
        eval_results=eval_results,
        history=history,
        model=args.model,
    )

    if args.verbose:
        print(f"Improved: {new_description}", file=sys.stderr)

    output = {
        "description": new_description,
        "history": history + [{
            "description": current_description,
            "passed": eval_results["summary"]["passed"],
            "failed": eval_results["summary"]["failed"],
            "total": eval_results["summary"]["total"],
            "results": eval_results["results"],
        }],
    }
    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
