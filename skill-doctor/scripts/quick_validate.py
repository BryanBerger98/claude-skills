#!/usr/bin/env python3
"""Quick validation for skill-doctor target types.

Each validator returns (ok: bool, message: str). Used by TargetAdapter.validate().
"""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    yaml = None

ALLOWED_SKILL_KEYS = {"name", "description", "license", "allowed-tools", "metadata", "compatibility"}
ALLOWED_AGENT_KEYS = {"name", "description", "tools", "model", "color"}


def _parse_frontmatter_yaml(content: str) -> tuple[dict | None, str]:
    if not content.startswith("---"):
        return None, "No YAML frontmatter found"
    m = re.match(r"^---\n(.*?)\n---", content, re.DOTALL)
    if not m:
        return None, "Invalid frontmatter format"
    text = m.group(1)
    if yaml is None:
        # Fallback: minimal manual parse using utils
        from scripts.utils import parse_frontmatter
        fields, _ = parse_frontmatter(content)
        return fields, ""
    try:
        fm = yaml.safe_load(text)
        if not isinstance(fm, dict):
            return None, "Frontmatter must be a YAML dictionary"
        return fm, ""
    except yaml.YAMLError as e:
        return None, f"Invalid YAML in frontmatter: {e}"


def _validate_name(name, max_len: int = 64) -> tuple[bool, str]:
    if not isinstance(name, str):
        return False, f"Name must be a string, got {type(name).__name__}"
    name = name.strip()
    if not name:
        return False, "Name is empty"
    if not re.match(r"^[a-z0-9-]+$", name):
        return False, f"Name '{name}' must be kebab-case (lowercase, digits, hyphens)"
    if name.startswith("-") or name.endswith("-") or "--" in name:
        return False, f"Name '{name}' cannot start/end with hyphen or have consecutive hyphens"
    if len(name) > max_len:
        return False, f"Name too long ({len(name)} chars, max {max_len})"
    return True, ""


def _validate_description(desc, max_len: int = 1024) -> tuple[bool, str]:
    if not isinstance(desc, str):
        return False, f"Description must be a string, got {type(desc).__name__}"
    desc = desc.strip()
    if not desc:
        return False, "Description is empty"
    if "<" in desc or ">" in desc:
        return False, "Description cannot contain angle brackets"
    if len(desc) > max_len:
        return False, f"Description too long ({len(desc)} chars, max {max_len})"
    return True, ""


def validate_skill(skill_path) -> tuple[bool, str]:
    p = Path(skill_path)
    skill_md = p / "SKILL.md"
    if not skill_md.exists():
        return False, "SKILL.md not found"

    content = skill_md.read_text()
    fm, err = _parse_frontmatter_yaml(content)
    if fm is None:
        return False, err

    unexpected = set(fm.keys()) - ALLOWED_SKILL_KEYS
    if unexpected:
        return False, f"Unexpected frontmatter keys: {sorted(unexpected)}"

    if "name" not in fm:
        return False, "Missing 'name' in frontmatter"
    if "description" not in fm:
        return False, "Missing 'description' in frontmatter"

    ok, msg = _validate_name(fm["name"])
    if not ok:
        return False, msg
    ok, msg = _validate_description(fm["description"])
    if not ok:
        return False, msg

    compat = fm.get("compatibility", "")
    if compat:
        if not isinstance(compat, str):
            return False, f"Compatibility must be a string, got {type(compat).__name__}"
        if len(compat) > 500:
            return False, f"Compatibility too long ({len(compat)} chars, max 500)"

    return True, "Skill is valid"


def validate_subagent(agent_file) -> tuple[bool, str]:
    p = Path(agent_file)
    if not p.is_file():
        return False, f"Agent file not found: {p}"

    content = p.read_text()
    fm, err = _parse_frontmatter_yaml(content)
    if fm is None:
        return False, err

    if "name" not in fm:
        return False, "Missing 'name' in agent frontmatter"
    if "description" not in fm:
        return False, "Missing 'description' in agent frontmatter"

    ok, msg = _validate_name(fm["name"])
    if not ok:
        return False, msg
    ok, msg = _validate_description(fm["description"])
    if not ok:
        return False, msg

    tools = fm.get("tools", "")
    if tools and not isinstance(tools, (str, list)):
        return False, f"tools must be string or list, got {type(tools).__name__}"

    body = content[content.find("---", 3) + 3:].strip() if content.startswith("---") else content
    if len(body) < 50:
        return False, f"Agent system prompt too short ({len(body)} chars) — likely empty"

    return True, "Subagent is valid"


def validate_mcp_json(path) -> tuple[bool, str]:
    p = Path(path)
    if not p.is_file():
        return False, f".mcp.json not found: {p}"
    try:
        data = json.loads(p.read_text())
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    if not isinstance(data, dict):
        return False, "Top-level .mcp.json must be a JSON object"
    servers = data.get("mcpServers", data)
    if not isinstance(servers, dict):
        return False, "'mcpServers' must be an object"
    for name, cfg in servers.items():
        if not isinstance(cfg, dict):
            return False, f"server '{name}' config must be an object"
        if "command" not in cfg and "url" not in cfg and "type" not in cfg:
            return False, f"server '{name}' missing command/url/type"
    return True, f".mcp.json is valid ({len(servers)} server(s))"


def validate_claude_md(path) -> tuple[bool, str]:
    p = Path(path)
    if not p.is_file():
        return False, f"CLAUDE.md not found: {p}"
    content = p.read_text()
    if p.stat().st_size == 0:
        return False, "CLAUDE.md is empty"
    line_count = len(content.splitlines())
    if line_count > 500:
        return True, f"CLAUDE.md valid but very long ({line_count} lines) — consider splitting via @import"
    return True, f"CLAUDE.md is valid ({line_count} lines)"


def validate_claude_dir(path) -> tuple[bool, str]:
    p = Path(path)
    if not p.is_dir():
        return False, f"Not a directory: {p}"
    # heuristics: looks like a .claude tree?
    markers = ["settings.json", "settings.local.json", "skills", "agents", "CLAUDE.md", ".mcp.json"]
    found = [m for m in markers if (p / m).exists()]
    if not found:
        return False, f"Directory has no .claude markers ({markers})"
    return True, f".claude tree present (markers: {found})"


def main():
    if len(sys.argv) < 2:
        print("Usage: quick_validate.py <path> [target_kind]")
        sys.exit(2)
    path = Path(sys.argv[1])
    kind = sys.argv[2] if len(sys.argv) > 2 else None
    if kind is None:
        from scripts.utils import detect_target_kind
        kind = detect_target_kind(path)
    validators = {
        "skill": validate_skill,
        "subagent": validate_subagent,
        "mcp_json": validate_mcp_json,
        "claude_md": validate_claude_md,
        "claude_dir": validate_claude_dir,
    }
    if kind not in validators:
        print(f"No validator for target_kind={kind!r}")
        sys.exit(2)
    ok, msg = validators[kind](path)
    print(f"[{kind}] {msg}")
    sys.exit(0 if ok else 1)


if __name__ == "__main__":
    main()
