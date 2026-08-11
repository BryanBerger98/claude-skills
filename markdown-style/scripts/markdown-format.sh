#!/usr/bin/env bash
#
# Format Markdown right after Claude Code writes it — PostToolUse hook.
#
# The markdown-style skill owns structure, front-matter and prose. Mechanical
# typography — blank lines around headings, list markers, fence languages,
# emphasis style — belongs here instead, so it never costs the model a token.
# This script runs `markdownlint-cli2 --fix` on the file the tool just touched.
#
# CONVERGENCE — one --fix pass is not enough. MD022 and MD032 both want to
# insert the same blank line, and markdownlint applies one fix per line per
# pass. Measured on markdownlint-cli2 v0.22.1 with a heading followed straight
# by a list: 2 errors left after pass 1, 0 after pass 2. Hence the loop.
#
# CONFIG — markdownlint-cli2 walks up from the file to find its configuration.
# Outside a configured repository it would silently fall back to markdownlint's
# stock defaults, which are NOT the house contract. When the walk finds nothing,
# this script passes the canonical rule set explicitly.
#
# EXIT CODE — always 0. A PostToolUse hook must not turn a successful edit into
# an error the model has to reason about. Every failure path here is a quiet
# exit: no linter, no file, unreadable payload, unwritable file.

set -uo pipefail

MAX_PASSES="${MARKDOWN_FORMAT_PASSES:-3}"
FALLBACK_CONFIG="${HOME}/.claude/skills/markdown-style/assets/markdownlint-rules.jsonc"

# stdin carries the tool payload. No path, malformed JSON, missing jq: nothing to do.
payload="$(cat)"
file="$(printf '%s' "$payload" | jq -r '.tool_input.file_path // empty' 2>/dev/null || true)"

[ -n "$file" ] || exit 0
case "$file" in
  *.md|*.mdx) ;;
  *) exit 0 ;;
esac
[ -f "$file" ] || exit 0

# Locate the CLI: hooks do not inherit an nvm-initialised PATH.
MDL="$(command -v markdownlint-cli2 2>/dev/null || true)"
if [ -z "$MDL" ]; then
  for candidate in "$HOME"/.nvm/versions/node/*/bin/markdownlint-cli2; do
    [ -x "$candidate" ] && MDL="$candidate"
  done
fi
[ -n "$MDL" ] || exit 0

# Does any ancestor directory carry a markdownlint configuration?
has_config() {
  local dir="$1" name
  while [ -n "$dir" ] && [ "$dir" != "/" ]; do
    for name in .markdownlint-cli2.jsonc .markdownlint-cli2.yaml \
                .markdownlint-cli2.cjs .markdownlint-cli2.mjs \
                .markdownlint.jsonc .markdownlint.json \
                .markdownlint.yaml .markdownlint.yml \
                .markdownlint.cjs .markdownlint.mjs; do
      [ -f "$dir/$name" ] && return 0
    done
    dir="$(dirname "$dir")"
  done
  return 1
}

dir="$(cd "$(dirname "$file")" 2>/dev/null && pwd)" || exit 0
config_args=()
if ! has_config "$dir"; then
  [ -f "$FALLBACK_CONFIG" ] && config_args=(--config "$FALLBACK_CONFIG")
fi

# Empty-array expansion guard: macOS ships bash 3.2, where "${a[@]}" under
# `set -u` is an unbound variable error when the array is empty.
pass=1
while [ "$pass" -le "$MAX_PASSES" ]; do
  "$MDL" ${config_args[@]+"${config_args[@]}"} --fix "$file" >/dev/null 2>&1 && break
  pass=$((pass + 1))
done

exit 0
