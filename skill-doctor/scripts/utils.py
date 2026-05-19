"""Shared utilities for skill-doctor scripts.

Handles frontmatter parsing for skills + subagents and target-kind detection
for the 6 supported target types.
"""

from __future__ import annotations

import json
from pathlib import Path


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parse YAML-ish frontmatter, return (fields, body).

    Lightweight parser — only handles flat key: value pairs and YAML
    multiline scalars (>, |, >-, |-). Sufficient for SKILL.md / agent files.
    """
    lines = content.split("\n")
    if not lines or lines[0].strip() != "---":
        return {}, content

    end_idx = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_idx = i
            break
    if end_idx is None:
        return {}, content

    fields: dict[str, str] = {}
    frontmatter_lines = lines[1:end_idx]
    i = 0
    while i < len(frontmatter_lines):
        line = frontmatter_lines[i]
        if ":" not in line:
            i += 1
            continue
        key, _, value = line.partition(":")
        key = key.strip()
        value = value.strip()
        if value in (">", "|", ">-", "|-"):
            cont: list[str] = []
            i += 1
            while i < len(frontmatter_lines) and (
                frontmatter_lines[i].startswith("  ")
                or frontmatter_lines[i].startswith("\t")
            ):
                cont.append(frontmatter_lines[i].strip())
                i += 1
            fields[key] = " ".join(cont)
            continue
        fields[key] = value.strip('"').strip("'")
        i += 1

    body = "\n".join(lines[end_idx + 1:])
    return fields, body


def parse_skill_md(skill_path: Path) -> tuple[str, str, str]:
    """Parse SKILL.md, return (name, description, full_content)."""
    content = (skill_path / "SKILL.md").read_text()
    fields, _ = parse_frontmatter(content)
    name = fields.get("name", "")
    desc = fields.get("description", "")
    if not name or not desc:
        raise ValueError(f"SKILL.md missing name or description: {skill_path}")
    return name, desc, content


def parse_subagent_md(agent_file: Path) -> tuple[str, str, str]:
    """Parse subagent .md file, return (name, description, full_content)."""
    content = agent_file.read_text()
    fields, _ = parse_frontmatter(content)
    name = fields.get("name", agent_file.stem)
    desc = fields.get("description", "")
    if not desc:
        raise ValueError(f"Subagent missing description: {agent_file}")
    return name, desc, content


def detect_target_kind(path: Path) -> str:
    """Detect target_kind from path. Returns one of:
    skill, subagent, mcp_json, claude_md, claude_dir, prompt.
    """
    if path.is_dir():
        if (path / "SKILL.md").is_file():
            return "skill"
        if path.name == ".claude" or (path / "settings.json").is_file():
            return "claude_dir"
        raise ValueError(f"Cannot detect target_kind for directory: {path}")

    if not path.is_file():
        raise ValueError(f"Path does not exist: {path}")

    name = path.name
    if name == ".mcp.json" or name.endswith(".mcp.json"):
        return "mcp_json"
    if name == "CLAUDE.md" or name.endswith("CLAUDE.md"):
        return "claude_md"
    if name.endswith(".md"):
        try:
            content = path.read_text()
            fields, _ = parse_frontmatter(content)
            if "description" in fields and (
                "agents/" in str(path) or path.parent.name == "agents"
            ):
                return "subagent"
            if "description" in fields and "name" in fields:
                return "subagent"
        except Exception:
            pass
        return "prompt"

    if name.endswith(".json"):
        try:
            json.loads(path.read_text())
            return "mcp_json"
        except Exception:
            pass

    return "prompt"
