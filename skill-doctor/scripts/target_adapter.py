"""Target adapters: per-target-type dispatch for skill-doctor.

Skill-doctor handles 6 target kinds: skill, subagent, prompt, mcp_json,
claude_md, claude_dir. The adapter pattern lets eval/improve/validate
infrastructure stay generic while each target plugs in its own
parsing, field-extraction, and prompt templates.

Trigger-eval capability matrix:
  - skill, subagent      : YES (description triggers Skill/Agent tool)
  - prompt               : NO (no description-based trigger; use comparator/grader)
  - mcp_json             : NO (static config)
  - claude_md            : NO (static rules; adherence-eval is open research)
  - claude_dir           : NO (meta; runs structure-auditor)
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path

from scripts.utils import parse_frontmatter, parse_skill_md, parse_subagent_md


@dataclass
class TargetInfo:
    name: str
    field: str
    content: str
    extra: dict


class TargetAdapter:
    target_kind: str = ""
    supports_trigger_eval: bool = False
    field_label: str = "description"

    def parse(self, path: Path) -> TargetInfo:
        raise NotImplementedError

    def write_field(self, path: Path, new_value: str) -> None:
        raise NotImplementedError

    def validate(self, path: Path) -> tuple[bool, str]:
        raise NotImplementedError

    def improve_prompt(
        self,
        info: TargetInfo,
        current_field: str,
        eval_results: dict,
        history: list[dict],
        test_results: dict | None,
        scores_summary: str,
    ) -> str:
        raise NotImplementedError(f"{self.target_kind} does not support field improvement via eval")


class SkillAdapter(TargetAdapter):
    target_kind = "skill"
    supports_trigger_eval = True
    field_label = "description"

    def parse(self, path: Path) -> TargetInfo:
        name, desc, content = parse_skill_md(path)
        return TargetInfo(name=name, field=desc, content=content, extra={})

    def write_field(self, path: Path, new_value: str) -> None:
        skill_md = path / "SKILL.md"
        content = skill_md.read_text()
        new = re.sub(
            r"(?m)^description:.*$",
            f"description: {new_value}",
            content,
            count=1,
        )
        skill_md.write_text(new)

    def validate(self, path: Path) -> tuple[bool, str]:
        from scripts.quick_validate import validate_skill
        return validate_skill(path)

    def improve_prompt(self, info, current_field, eval_results, history, test_results, scores_summary):
        return _build_description_prompt(
            target_kind="skill",
            target_name=info.name,
            kind_blurb=(
                'A "skill" is a prompt with progressive disclosure — there\'s a name and description Claude sees '
                "when deciding whether to use the skill, and a SKILL.md body it reads if it does. The description "
                'appears in Claude\'s "available_skills" list.'
            ),
            content=info.content,
            current_field=current_field,
            eval_results=eval_results,
            history=history,
            test_results=test_results,
            scores_summary=scores_summary,
        )


class SubagentAdapter(TargetAdapter):
    target_kind = "subagent"
    supports_trigger_eval = True
    field_label = "description"

    def parse(self, path: Path) -> TargetInfo:
        name, desc, content = parse_subagent_md(path)
        return TargetInfo(name=name, field=desc, content=content, extra={})

    def write_field(self, path: Path, new_value: str) -> None:
        content = path.read_text()
        new = re.sub(
            r"(?m)^description:.*$",
            f"description: {new_value}",
            content,
            count=1,
        )
        path.write_text(new)

    def validate(self, path: Path) -> tuple[bool, str]:
        from scripts.quick_validate import validate_subagent
        return validate_subagent(path)

    def improve_prompt(self, info, current_field, eval_results, history, test_results, scores_summary):
        return _build_description_prompt(
            target_kind="subagent",
            target_name=info.name,
            kind_blurb=(
                "A Claude Code subagent is a specialist Claude can delegate to via the Agent tool. The description "
                "in the agent's frontmatter is the routing hint Claude uses to decide whether to delegate. Your "
                "goal: trigger for queries that should delegate to this agent, not trigger for queries that should "
                "stay in the main conversation."
            ),
            content=info.content,
            current_field=current_field,
            eval_results=eval_results,
            history=history,
            test_results=test_results,
            scores_summary=scores_summary,
        )


class PromptAdapter(TargetAdapter):
    target_kind = "prompt"
    supports_trigger_eval = False
    field_label = "content"

    def parse(self, path: Path) -> TargetInfo:
        if path.is_file():
            content = path.read_text()
        else:
            raise ValueError(f"Prompt target must be a file: {path}")
        return TargetInfo(name=path.stem, field=content, content=content, extra={})

    def write_field(self, path: Path, new_value: str) -> None:
        path.write_text(new_value)

    def validate(self, path: Path) -> tuple[bool, str]:
        if not path.is_file():
            return False, f"Prompt file does not exist: {path}"
        if path.stat().st_size == 0:
            return False, "Prompt file is empty"
        return True, "Prompt is valid (non-empty file)"


class McpJsonAdapter(TargetAdapter):
    target_kind = "mcp_json"
    supports_trigger_eval = False
    field_label = "config"

    def parse(self, path: Path) -> TargetInfo:
        content = path.read_text()
        data = json.loads(content)
        return TargetInfo(name=path.name, field=content, content=content, extra={"parsed": data})

    def write_field(self, path: Path, new_value: str) -> None:
        path.write_text(new_value)

    def validate(self, path: Path) -> tuple[bool, str]:
        from scripts.quick_validate import validate_mcp_json
        return validate_mcp_json(path)


class ClaudeMdAdapter(TargetAdapter):
    target_kind = "claude_md"
    supports_trigger_eval = False
    field_label = "content"

    def parse(self, path: Path) -> TargetInfo:
        content = path.read_text()
        return TargetInfo(name=path.name, field=content, content=content, extra={})

    def write_field(self, path: Path, new_value: str) -> None:
        path.write_text(new_value)

    def validate(self, path: Path) -> tuple[bool, str]:
        from scripts.quick_validate import validate_claude_md
        return validate_claude_md(path)


class ClaudeDirAdapter(TargetAdapter):
    target_kind = "claude_dir"
    supports_trigger_eval = False
    field_label = "tree"

    def parse(self, path: Path) -> TargetInfo:
        if not path.is_dir():
            raise ValueError(f"claude_dir target must be a directory: {path}")
        return TargetInfo(name=path.name, field=str(path), content=str(path), extra={})

    def write_field(self, path: Path, new_value: str) -> None:
        raise NotImplementedError("claude_dir is read-only; edits happen on individual files within")

    def validate(self, path: Path) -> tuple[bool, str]:
        from scripts.quick_validate import validate_claude_dir
        return validate_claude_dir(path)


_ADAPTERS: dict[str, TargetAdapter] = {
    "skill": SkillAdapter(),
    "subagent": SubagentAdapter(),
    "prompt": PromptAdapter(),
    "mcp_json": McpJsonAdapter(),
    "claude_md": ClaudeMdAdapter(),
    "claude_dir": ClaudeDirAdapter(),
}


def get_adapter(target_kind: str) -> TargetAdapter:
    if target_kind not in _ADAPTERS:
        raise ValueError(
            f"Unknown target_kind: {target_kind!r}. "
            f"Valid: {sorted(_ADAPTERS.keys())}"
        )
    return _ADAPTERS[target_kind]


def _build_description_prompt(
    *,
    target_kind: str,
    target_name: str,
    kind_blurb: str,
    content: str,
    current_field: str,
    eval_results: dict,
    history: list[dict],
    test_results: dict | None,
    scores_summary: str,
) -> str:
    failed_triggers = [r for r in eval_results["results"] if r["should_trigger"] and not r["pass"]]
    false_triggers = [r for r in eval_results["results"] if not r["should_trigger"] and not r["pass"]]

    prompt = (
        f'You are optimizing the description for a Claude Code {target_kind} called "{target_name}". '
        f"{kind_blurb}\n\n"
        f"Current description:\n<current_description>\n{current_field}\n</current_description>\n\n"
        f"Current scores ({scores_summary}):\n<scores_summary>\n"
    )
    if failed_triggers:
        prompt += "FAILED TO TRIGGER (should have triggered but didn't):\n"
        for r in failed_triggers:
            prompt += f'  - "{r["query"]}" (triggered {r["triggers"]}/{r["runs"]} times)\n'
        prompt += "\n"
    if false_triggers:
        prompt += "FALSE TRIGGERS (triggered but shouldn't have):\n"
        for r in false_triggers:
            prompt += f'  - "{r["query"]}" (triggered {r["triggers"]}/{r["runs"]} times)\n'
        prompt += "\n"
    if history:
        prompt += "PREVIOUS ATTEMPTS (do NOT repeat these — try something structurally different):\n\n"
        for h in history:
            train_s = f"{h.get('train_passed', h.get('passed', 0))}/{h.get('train_total', h.get('total', 0))}"
            test_s = (
                f"{h.get('test_passed', '?')}/{h.get('test_total', '?')}"
                if h.get("test_passed") is not None else None
            )
            score_str = f"train={train_s}" + (f", test={test_s}" if test_s else "")
            prompt += f"<attempt {score_str}>\n"
            prompt += f'Description: "{h["description"]}"\n'
            if "results" in h:
                prompt += "Train results:\n"
                for r in h["results"]:
                    status = "PASS" if r["pass"] else "FAIL"
                    prompt += f'  [{status}] "{r["query"][:80]}" (triggered {r["triggers"]}/{r["runs"]})\n'
            if h.get("note"):
                prompt += f"Note: {h['note']}\n"
            prompt += "</attempt>\n\n"

    prompt += (
        "</scores_summary>\n\n"
        f"{target_kind.capitalize()} content (for context):\n"
        f"<{target_kind}_content>\n{content}\n</{target_kind}_content>\n\n"
        "Based on the failures, write a new and improved description that is more likely to trigger correctly. "
        "Don't overfit to the specific failed queries — generalize to broader categories of user intent. "
        "Hard limit: 1024 characters. Stay comfortably under it.\n\n"
        "Tips:\n"
        '- Phrase imperatively: "Use this for X" rather than "this does X"\n'
        "- Focus on user intent, not implementation details\n"
        "- Make it distinctive vs. competing skills/agents\n"
        "- Mix up style across iterations\n\n"
        "Respond with only the new description in <new_description> tags."
    )
    return prompt
