# Checklist: CLAUDE.md audit

Apply to any `CLAUDE.md` (user `~/.claude/CLAUDE.md`, project root, or subdirectory).

## Purpose & content type

- [ ] Contains conventions, rules, decisions — NOT architecture docs or file listings
- [ ] States preferences, not code structure (code is in code; conventions belong here)
- [ ] Each rule has clear scope (when does it apply?)
- [ ] No rule that will rot when a file is renamed

## Voice & style

- [ ] Imperative voice ("Always do X", "Never do Y")
- [ ] Specific verbs ("use trash, never rm"), not vague ("be careful with deletions")
- [ ] No hedging ("we generally tend to prefer..." → "use X")
- [ ] No filler ("just", "really", "basically", "actually")

## Length

- [ ] Single file under ~200 lines
- [ ] If longer, split via `@import.md` syntax
- [ ] Total CLAUDE.md hierarchy (user + project + nested) under ~500 lines sum
- [ ] No section dominates (one topic ≤ 50% of file)

## Override clarity

- [ ] `IMPORTANT:` / override language used only when actually overriding defaults
- [ ] No redundant emphasis on every rule
- [ ] Hard requirements clearly flagged

## Structure

- [ ] H2 headers group related rules
- [ ] Each rule self-contained (no "see below" cross-refs that rot)
- [ ] Code examples short and illustrative, not exhaustive
- [ ] No giant file trees or directory listings

## Rot risk

- [ ] No references to specific file paths that might be renamed
- [ ] No references to functions/classes by name (these rot)
- [ ] No hardcoded version numbers without refresh date
- [ ] Conventions described declaratively, not by example-of-the-week

## Coherence with rest of .claude/

- [ ] No rule contradicts a skill or agent
- [ ] No rule contradicts settings.json permissions
- [ ] No rule overrides a hook silently

## Project vs. user split

- [ ] Project-specific rules in project `CLAUDE.md`
- [ ] User-wide preferences in user `~/.claude/CLAUDE.md`
- [ ] No project file repeating user-level rules
- [ ] No user file containing project-specific knowledge

## Imports (`@file.md`)

- [ ] Each `@import` resolves to existing file
- [ ] Imported files are themselves CLAUDE.md-style (rules, not code)
- [ ] No circular imports
- [ ] Import depth reasonable (≤ 2 levels)

## Common anti-patterns

- File full of architecture diagrams → move to `docs/`
- Rules stated as suggestions ("you might want to...") → restate as imperatives
- "TODO: document X" inline → either document or remove
- Examples that mention specific PRs/issues → those rot
- Emoji clutter → strip unless project explicitly uses

## Output

For each section: keep / rewrite / remove recommendation. Provide rewritten version inline for sections needing edits.
