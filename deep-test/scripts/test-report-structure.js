#!/usr/bin/env node
/**
 * @file scripts/test-report-structure.js
 * @description Test for the `report` action (deep-test skill). Verifies that
 * `assets/report-template.md` contains every section the `qa-reporter` agent
 * fills across the pipeline. If a section is missing, the reporter cannot
 * render a valid report, so this fails fast — before any run.
 *
 * Run from the skill root (the directory containing SKILL.md and assets/).
 *
 * @example
 *   node scripts/test-report-structure.js
 *
 * @exits 0 when the template has all required sections, 1 otherwise.
 */

const fs = require('fs');
const path = require('path');

const SKILL_DIR = path.resolve(__dirname, '..');
const TEMPLATE = path.join(SKILL_DIR, 'assets', 'report-template.md');

/** Print a diagnostic and exit non-zero. */
function fail(msg) {
  console.error(`FAIL (test-report-structure): ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE)) fail(`missing template: ${TEMPLATE}`);

const md = fs.readFileSync(TEMPLATE, 'utf8');

/** Sections each pipeline stage relies on, with the action that fills them. */
const REQUIRED = [
  ['## Scope tested', 'report'],
  ['## QA scorecard', 'report'],
  ['## Problems', 'report'],
  ['## Root causes', 'trace-causes'],
  ['## Todolist', 'review'],
  ['## Fix log', 'fix'],
  ['## Retest results', 'retest'],
];

const missing = REQUIRED.filter(([header]) => !md.includes(header));
if (missing.length) {
  fail(
    'template missing sections:\n' +
      missing.map(([h, a]) => `  - "${h}" (filled by ${a})`).join('\n')
  );
}

// The status lifecycle must be documented so qa-reporter advances it correctly.
for (const status of ['draft', 'tested', 'traced', 'in-review', 'fixing', 'retested', 'done']) {
  if (!md.includes(status)) fail(`status lifecycle value not documented in template: "${status}"`);
}

console.log(
  `OK (test-report-structure): report-template.md has all ${REQUIRED.length} sections and the full status lifecycle`
);
