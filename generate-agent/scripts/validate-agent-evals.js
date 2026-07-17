#!/usr/bin/env node
/**
 * @file scripts/validate-agent-evals.js
 * @description Validates an agent's invocation eval suite
 * (`<dest>/evals/<agent-name>.json`) against rules A5/A6.
 *
 * Checks performed:
 *  - File exists and parses as a JSON array.
 *  - At least 3 `should_delegate`, 3 `should_not_delegate`, 1 `ambiguous`.
 *  - Per-scenario shape:
 *      every scenario        → non-empty string `prompt`, known `type`.
 *      `should_not_delegate` → `competing_agent` set (use `"none"` if none).
 *      `ambiguous`           → non-empty `note` (the expected clarification).
 *  - No two scenarios share the exact same prompt.
 *
 * The target may be the evals .json itself, or the agent .md file — in the
 * latter case the evals path is derived as `<agent-dir>/evals/<name>.json`
 * using the frontmatter `name`.
 *
 * @example Usage
 *   node validate-agent-evals.js <dest>/evals/<agent-name>.json
 *   node validate-agent-evals.js <dest>/<agent-name>.md
 *
 * @exits 0 on success, 1 on validation failure or bad invocation.
 */

const fs = require('fs');
const path = require('path');

/** @type {string|undefined} */
const target = process.argv[2];
if (!target) {
  console.error('FAIL (validate-agent-evals): missing argument.\n  Usage: node validate-agent-evals.js <evals.json | agent.md>');
  process.exit(1);
}

/** @type {string} Resolved path of whichever target was passed. */
let evalsPath = path.resolve(target);

/**
 * Print a failure diagnostic and exit non-zero.
 * @param {string} msg - Human-readable diagnostic; line-breaks are preserved with indentation.
 * @returns {never}
 */
function fail(msg) {
  console.error(`FAIL (validate-agent-evals @ ${evalsPath}):\n  ${msg.split('\n').join('\n  ')}`);
  process.exit(1);
}

if (evalsPath.endsWith('.md')) {
  if (!fs.existsSync(evalsPath)) fail('agent file not found');
  const fmMatch = fs.readFileSync(evalsPath, 'utf8').match(/^---\n[\s\S]*?^name:\s*(.+)$/m);
  if (!fmMatch) fail('cannot derive evals path: agent file has no `name` in frontmatter');
  evalsPath = path.join(path.dirname(evalsPath), 'evals', `${fmMatch[1].trim()}.json`);
}

if (!fs.existsSync(evalsPath)) {
  fail('evals file not found — invocation evals are mandatory (A6); write them with action 03-design-evals');
}

/** @type {Array<object>} */
let scenarios;
try {
  scenarios = JSON.parse(fs.readFileSync(evalsPath, 'utf8'));
} catch (e) {
  fail(`not valid JSON: ${e.message}`);
}

if (!Array.isArray(scenarios)) fail('scenarios must be a JSON array');

/** @type {{should_delegate:number, should_not_delegate:number, ambiguous:number}} */
const counts = { should_delegate: 0, should_not_delegate: 0, ambiguous: 0 };

/** @type {string[]} */
const errors = [];

scenarios.forEach((s, i) => {
  const loc = `scenario #${i}`;
  if (!s.type) { errors.push(`${loc}: missing "type"`); return; }
  counts[s.type] = (counts[s.type] || 0) + 1;

  if (!s.prompt || typeof s.prompt !== 'string' || !s.prompt.trim()) {
    errors.push(`${loc}: "prompt" missing or not a non-empty string`);
  }

  switch (s.type) {
    case 'should_delegate':
      break;
    case 'should_not_delegate':
      if (!s.competing_agent) {
        errors.push(`${loc}: "should_not_delegate" scenarios must declare competing_agent (use "none" if none exists)`);
      }
      break;
    case 'ambiguous':
      if (!s.note || typeof s.note !== 'string' || !s.note.trim()) {
        errors.push(`${loc}: "ambiguous" scenarios must carry a "note" stating the expected clarification`);
      }
      break;
    default:
      errors.push(`${loc}: unknown type "${s.type}" — expected should_delegate | should_not_delegate | ambiguous`);
  }
});

if (counts.should_delegate < 3) errors.push(`at least 3 "should_delegate" scenarios required, got ${counts.should_delegate}`);
if (counts.should_not_delegate < 3) errors.push(`at least 3 "should_not_delegate" scenarios required, got ${counts.should_not_delegate}`);
if (counts.ambiguous < 1) errors.push(`at least 1 "ambiguous" scenario required, got ${counts.ambiguous}`);

const seen = new Set();
for (const s of scenarios) {
  const p = (s.prompt || '').trim().toLowerCase();
  if (p && seen.has(p)) errors.push(`duplicate prompt: "${p}"`);
  seen.add(p);
}

if (errors.length) fail(errors.join('\n'));

console.log(`OK (${path.basename(evalsPath)}): ${scenarios.length} scenarios (${counts.should_delegate} should_delegate, ${counts.should_not_delegate} should_not_delegate, ${counts.ambiguous} ambiguous)`);
