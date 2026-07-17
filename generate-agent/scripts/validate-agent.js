#!/usr/bin/env node
/**
 * @file scripts/validate-agent.js
 * @description Validates a generated Claude Code agent file (.md) against
 * the official anatomy (code.claude.com/docs/en/sub-agents) and the
 * generate-agent transversal rules A1–A4.
 *
 * Checks performed:
 *  - YAML frontmatter present and well-formed (delimited by `---` lines).
 *  - `name`: present, lowercase letters/digits/hyphens, ≤ 64 chars, no
 *    reserved words (`anthropic`, `claude`), identical to the file basename
 *    (house convention — evals resolve by name).
 *  - `description`: present, non-empty, ≤ 1024 chars, contains a delegation
 *    trigger ("use ...") and a boundary clause (never / do not / read-only) — A2.
 *  - `tools` / `disallowedTools` (optional): well-formed comma-separated
 *    lists (parentheses-aware for `Agent(a, b)`); no tools that are never
 *    available to subagents (AskUserQuestion, ScheduleWakeup, ...).
 *  - Read-only coherence (A3): a description claiming "read-only" fails if
 *    `tools` includes Write/Edit/NotebookEdit — or if `tools` is omitted
 *    entirely (omitted = inherits ALL tools, contradicting the claim).
 *  - `model` (optional): sonnet | opus | haiku | fable | inherit | full
 *    model ID (`claude-...`).
 *  - Body (system prompt): at least 3 non-empty lines, ≤ 500 lines.
 *
 * @example Usage
 *   node validate-agent.js <path-to-agent.md>
 *
 * @exits 0 on success, 1 on validation failure or bad invocation.
 */

const fs = require('fs');
const path = require('path');

/** @type {string|undefined} */
const target = process.argv[2];
if (!target) {
  console.error('FAIL (validate-agent): missing argument.\n  Usage: node validate-agent.js <path-to-agent.md>');
  process.exit(1);
}

/** @type {string} Resolved absolute path of the agent file. */
const AGENT_PATH = path.resolve(target);

/**
 * Print a failure diagnostic and exit non-zero.
 * @param {string} msg - Human-readable diagnostic; line-breaks are preserved with indentation.
 * @returns {never}
 */
function fail(msg) {
  console.error(`FAIL (validate-agent @ ${AGENT_PATH}):\n  ${msg.split('\n').join('\n  ')}`);
  process.exit(1);
}

if (!fs.existsSync(AGENT_PATH)) fail('file not found');
if (!AGENT_PATH.endsWith('.md')) fail('agent file must be a .md file');

const content = fs.readFileSync(AGENT_PATH, 'utf8');
if (!content.startsWith('---\n')) fail('missing YAML frontmatter');

const parts = content.split('---\n');
if (parts.length < 3) fail('malformed frontmatter — expected opening and closing `---`');

const fm = parts[1];
const body = parts.slice(2).join('---\n');

/**
 * Extract a single-line-or-folded frontmatter field value.
 * @param {string} key - Frontmatter key.
 * @returns {string|null} Trimmed value, or null when absent.
 */
function field(key) {
  const re = new RegExp(`^${key}:\\s*([\\s\\S]+?)(?=\\n[A-Za-z_][A-Za-z0-9_]*:|$)`, 'm');
  const m = fm.match(re);
  return m ? m[1].trim() : null;
}

/**
 * Split a tools list on commas that are not inside parentheses,
 * so `Agent(planner, developer)` stays one token.
 * @param {string} value - Raw field value.
 * @returns {string[]} Trimmed, non-empty tokens.
 */
function splitTools(value) {
  const tokens = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      tokens.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  tokens.push(current.trim());
  return tokens.filter(Boolean);
}

/** @type {string[]} */
const errors = [];

// --- name ---
const name = field('name');
if (!name) errors.push('missing `name` in frontmatter');
else {
  if (name.length > 64) errors.push(`name too long: ${name.length} > 64`);
  if (!/^[a-z0-9-]+$/.test(name)) errors.push(`name must be lowercase letters/digits/hyphens only: "${name}"`);
  for (const reserved of ['anthropic', 'claude']) {
    if (name.includes(reserved)) errors.push(`name contains reserved word "${reserved}": ${name}`);
  }
  const basename = path.basename(AGENT_PATH, '.md');
  if (basename !== name) {
    errors.push(`filename "${basename}.md" does not match name "${name}" (house convention: keep them identical — evals resolve by name)`);
  }
}

// --- description (A2) ---
const description = field('description');
if (!description) errors.push('missing `description` in frontmatter');
else {
  if (description.length === 0) errors.push('description is empty');
  if (description.length > 1024) errors.push(`description too long: ${description.length} > 1024`);
  if (!/\buse\b/i.test(description)) {
    errors.push('description missing a delegation trigger (A2): expected phrasing like "Use when ..." or "Use proactively ..."');
  }
  if (!/never|do\s*not|don['’]t|read-?only/i.test(description)) {
    errors.push('description missing a boundary clause (A2): expected "Never ...", "Do NOT use for ...", or a read-only statement');
  }
}

// --- tools / disallowedTools (A3) ---
/** Tools the platform never exposes to subagents even if listed. */
const NEVER_AVAILABLE = ['AskUserQuestion', 'EnterPlanMode', 'ExitPlanMode', 'ScheduleWakeup', 'WaitForMcpServers'];
const permissionMode = field('permissionMode');
const tokenRe = /^[A-Za-z][\w*-]*(\(.*\))?$/;

/** @type {string[]|null} */
let toolTokens = null;
for (const key of ['tools', 'disallowedTools']) {
  const raw = field(key);
  if (raw === null) continue;
  const tokens = splitTools(raw);
  if (key === 'tools') toolTokens = tokens;
  if (tokens.length === 0) errors.push(`${key} is present but empty — remove the line or list tools`);
  for (const t of tokens) {
    if (!tokenRe.test(t)) errors.push(`${key}: malformed tool token "${t}"`);
  }
  if (key === 'tools') {
    for (const t of tokens) {
      const bare = t.replace(/\(.*\)$/, '');
      if (bare === 'ExitPlanMode' && permissionMode === 'plan') continue;
      if (NEVER_AVAILABLE.includes(bare)) {
        errors.push(`tools: "${bare}" is never available to subagents — remove it (see references/agent-best-practices.md §Tool scoping)`);
      }
    }
  }
}

// --- read-only coherence (A3) ---
if (description && /read-?only/i.test(description)) {
  if (toolTokens === null) {
    errors.push('description claims read-only but `tools` is omitted — omitted tools inherit ALL tools (including Write/Edit); add an explicit allowlist');
  } else {
    const writers = toolTokens.map(t => t.replace(/\(.*\)$/, '')).filter(t => ['Write', 'Edit', 'NotebookEdit'].includes(t));
    if (writers.length) errors.push(`description claims read-only but tools include: ${writers.join(', ')} (A3)`);
  }
}

// --- model ---
const model = field('model');
if (model !== null && !/^(sonnet|opus|haiku|fable|inherit)$/.test(model) && !/^claude-[a-z0-9.-]+$/.test(model)) {
  errors.push(`invalid model "${model}" — expected sonnet | opus | haiku | fable | inherit | a full model ID (claude-...)`);
}

// --- body = system prompt ---
const bodyLines = body.split('\n');
const meaningful = bodyLines.filter(l => l.trim().length > 0);
if (meaningful.length < 3) errors.push(`system prompt too thin: ${meaningful.length} non-empty lines (< 3) — the body is the agent's ENTIRE system prompt`);
if (bodyLines.length > 500) errors.push(`system prompt too long: ${bodyLines.length} > 500 lines — split responsibilities into separate agents (A1)`);

if (errors.length) fail(errors.join('\n'));

console.log(`OK (${path.basename(AGENT_PATH)}): name="${name}" (${name.length}ch), description=${description.length}ch, tools=${toolTokens ? toolTokens.length : 'inherit-all'}, model=${model || 'inherit'}, prompt=${bodyLines.length} lines`);
