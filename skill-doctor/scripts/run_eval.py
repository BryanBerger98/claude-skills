#!/usr/bin/env python3
"""Run trigger evaluation for a skill or subagent description.

Tests whether the target's description causes Claude to trigger (load the skill
or delegate to the subagent) for a set of queries. Outputs results as JSON.

Only target_kind in {skill, subagent} supports trigger eval. Other kinds raise.
"""

import argparse
import json
import os
import select
import shutil
import subprocess
import sys
import tempfile
import time
import uuid
from concurrent.futures import ProcessPoolExecutor, as_completed
from pathlib import Path

from scripts.target_adapter import get_adapter
from scripts.utils import detect_target_kind


def run_single_query(
    query: str,
    target_kind: str,
    target_name: str,
    description: str,
    timeout: int,
    model: str | None = None,
) -> bool:
    """Run a single query, return True iff the target was triggered.

    Each worker creates an isolated tempdir as project_root and installs the
    stub there at project scope. Project-level skills/agents override user-level
    ones of the same name, so the stub's description is what Claude sees for
    {target_name} — even if the real target also exists in ~/.claude/.

    For target_kind='skill', stub goes to <tempdir>/.claude/skills/<target_name>/SKILL.md.
    For target_kind='subagent', stub goes to <tempdir>/.claude/agents/<target_name>.md.
    Detection watches stream events for Skill/Read/Agent/Task tool calls that
    reference {target_name}.
    """
    project_root = tempfile.mkdtemp(prefix=f"skill-doctor-eval-{uuid.uuid4().hex[:8]}-")
    proj = Path(project_root)

    if target_kind == "skill":
        artifact_dir = proj / ".claude" / "skills" / target_name
        artifact_file = artifact_dir / "SKILL.md"
        indented = "\n  ".join(description.split("\n"))
        artifact_content = (
            f"---\n"
            f"name: {target_name}\n"
            f"description: |\n"
            f"  {indented}\n"
            f"---\n\n"
            f"# {target_name}\n\n"
            f"This skill handles: {description}\n"
        )
    elif target_kind == "subagent":
        artifact_dir = proj / ".claude" / "agents"
        artifact_file = artifact_dir / f"{target_name}.md"
        indented = "\n  ".join(description.split("\n"))
        artifact_content = (
            f"---\n"
            f"name: {target_name}\n"
            f"description: |\n"
            f"  {indented}\n"
            f"---\n\n"
            f"You are the {target_name} specialist. {description}\n"
        )
    else:
        raise ValueError(f"trigger eval not supported for target_kind={target_kind!r}")

    try:
        artifact_dir.mkdir(parents=True, exist_ok=True)
        artifact_file.write_text(artifact_content)

        cmd = [
            "claude",
            "-p", query,
            "--output-format", "stream-json",
            "--verbose",
            "--include-partial-messages",
        ]
        if model:
            cmd.extend(["--model", model])

        env = {k: v for k, v in os.environ.items() if k != "CLAUDECODE"}

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            cwd=project_root,
            env=env,
        )

        triggered = False
        start_time = time.time()
        buffer = ""
        pending_tool_name = None
        accumulated_json = ""

        # Tool names that count as "triggering" for each target kind
        trigger_tools = {
            "skill": ("Skill", "Read"),
            "subagent": ("Agent", "Task"),
        }[target_kind]

        try:
            while time.time() - start_time < timeout:
                if process.poll() is not None:
                    remaining = process.stdout.read()
                    if remaining:
                        buffer += remaining.decode("utf-8", errors="replace")
                    break

                ready, _, _ = select.select([process.stdout], [], [], 1.0)
                if not ready:
                    continue

                chunk = os.read(process.stdout.fileno(), 8192)
                if not chunk:
                    break
                buffer += chunk.decode("utf-8", errors="replace")

                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        event = json.loads(line)
                    except json.JSONDecodeError:
                        continue

                    if event.get("type") == "stream_event":
                        se = event.get("event", {})
                        se_type = se.get("type", "")
                        if se_type == "content_block_start":
                            cb = se.get("content_block", {})
                            if cb.get("type") == "tool_use":
                                tn = cb.get("name", "")
                                if tn in trigger_tools:
                                    pending_tool_name = tn
                                    accumulated_json = ""
                                else:
                                    return False
                        elif se_type == "content_block_delta" and pending_tool_name:
                            delta = se.get("delta", {})
                            if delta.get("type") == "input_json_delta":
                                accumulated_json += delta.get("partial_json", "")
                                if target_name in accumulated_json:
                                    return True
                        elif se_type in ("content_block_stop", "message_stop"):
                            if pending_tool_name:
                                return target_name in accumulated_json
                            if se_type == "message_stop":
                                return False

                    elif event.get("type") == "assistant":
                        message = event.get("message", {})
                        for content_item in message.get("content", []):
                            if content_item.get("type") != "tool_use":
                                continue
                            tn = content_item.get("name", "")
                            ti = content_item.get("input", {})
                            blob = json.dumps(ti)
                            if tn in trigger_tools and target_name in blob:
                                triggered = True
                            return triggered

                    elif event.get("type") == "result":
                        return triggered
        finally:
            if process.poll() is None:
                process.kill()
                process.wait()

        return triggered
    finally:
        shutil.rmtree(project_root, ignore_errors=True)


def run_eval(
    eval_set: list[dict],
    target_kind: str,
    target_name: str,
    description: str,
    num_workers: int,
    timeout: int,
    runs_per_query: int = 1,
    trigger_threshold: float = 0.5,
    model: str | None = None,
) -> dict:
    results = []
    with ProcessPoolExecutor(max_workers=num_workers) as executor:
        future_to_info = {}
        for item in eval_set:
            for run_idx in range(runs_per_query):
                future = executor.submit(
                    run_single_query,
                    item["query"],
                    target_kind,
                    target_name,
                    description,
                    timeout,
                    model,
                )
                future_to_info[future] = (item, run_idx)

        query_triggers: dict[str, list[bool]] = {}
        query_items: dict[str, dict] = {}
        for future in as_completed(future_to_info):
            item, _ = future_to_info[future]
            query = item["query"]
            query_items[query] = item
            if query not in query_triggers:
                query_triggers[query] = []
            try:
                query_triggers[query].append(future.result())
            except Exception as e:
                print(f"Warning: query failed: {e}", file=sys.stderr)
                query_triggers[query].append(False)

    for query, triggers in query_triggers.items():
        item = query_items[query]
        trigger_rate = sum(triggers) / len(triggers)
        should_trigger = item["should_trigger"]
        if should_trigger:
            did_pass = trigger_rate >= trigger_threshold
        else:
            did_pass = trigger_rate < trigger_threshold
        results.append({
            "query": query,
            "should_trigger": should_trigger,
            "trigger_rate": trigger_rate,
            "triggers": sum(triggers),
            "runs": len(triggers),
            "pass": did_pass,
        })

    passed = sum(1 for r in results if r["pass"])
    total = len(results)

    return {
        "target_kind": target_kind,
        "target_name": target_name,
        "description": description,
        "results": results,
        "summary": {
            "total": total,
            "passed": passed,
            "failed": total - passed,
        },
    }


def main():
    parser = argparse.ArgumentParser(description="Run trigger eval for a skill or subagent")
    parser.add_argument("--eval-set", required=True, help="Path to eval set JSON file")
    parser.add_argument("--target-path", required=True, help="Path to target (skill dir or agent file)")
    parser.add_argument("--target-kind", default=None, help="Override target_kind detection")
    parser.add_argument("--description", default=None, help="Override description to test")
    parser.add_argument("--num-workers", type=int, default=10)
    parser.add_argument("--timeout", type=int, default=30)
    parser.add_argument("--runs-per-query", type=int, default=3)
    parser.add_argument("--trigger-threshold", type=float, default=0.5)
    parser.add_argument("--model", default=None)
    parser.add_argument("--verbose", action="store_true")
    args = parser.parse_args()

    eval_set = json.loads(Path(args.eval_set).read_text())
    target_path = Path(args.target_path)
    kind = args.target_kind or detect_target_kind(target_path)
    adapter = get_adapter(kind)
    if not adapter.supports_trigger_eval:
        print(f"Error: trigger eval not supported for target_kind={kind!r}", file=sys.stderr)
        sys.exit(2)

    info = adapter.parse(target_path)
    description = args.description or info.field

    if args.verbose:
        print(f"Evaluating {kind} {info.name!r}: {description}", file=sys.stderr)

    output = run_eval(
        eval_set=eval_set,
        target_kind=kind,
        target_name=info.name,
        description=description,
        num_workers=args.num_workers,
        timeout=args.timeout,
        runs_per_query=args.runs_per_query,
        trigger_threshold=args.trigger_threshold,
        model=args.model,
    )

    if args.verbose:
        s = output["summary"]
        print(f"Results: {s['passed']}/{s['total']} passed", file=sys.stderr)
        for r in output["results"]:
            status = "PASS" if r["pass"] else "FAIL"
            rate_str = f"{r['triggers']}/{r['runs']}"
            print(f"  [{status}] rate={rate_str} expected={r['should_trigger']}: {r['query'][:70]}", file=sys.stderr)

    print(json.dumps(output, indent=2))


if __name__ == "__main__":
    main()
