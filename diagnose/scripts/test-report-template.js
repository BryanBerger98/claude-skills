#!/usr/bin/env node
/**
 * @file scripts/test-report-template.js
 * @description Deterministic test for the `report` action (R9/R12).
 * Asserts that `assets/report-template.md` — the contract the `reporter`
 * subagent fills at runtime — contains every section a complete diagnosis
 * report must have. Failing here blocks the build before any report is
 * ever generated, which is the whole point of writing the test first.
 *
 * Resolves the template relative to this file, so it passes from any cwd.
 *
 * @example
 *   node scripts/test-report-template.js
 *
 * @exits 0 when the template is complete, 1 with an actionable diagnostic otherwise.
 */

const fs = require('fs');
const path = require('path');

/** @type {string} Template path, resolved from this script's location. */
const TEMPLATE = path.resolve(__dirname, '..', 'assets', 'report-template.md');

/**
 * Print a diagnostic and exit non-zero.
 * @param {string} msg
 * @returns {never}
 */
function fail(msg) {
  console.error(`FAIL (test-report-template): ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(TEMPLATE)) {
  fail(`template not found at ${TEMPLATE} — the report action has nothing to inject`);
}

const content = fs.readFileSync(TEMPLATE, 'utf8');

/** @type {string[]} Top-level sections every report must carry. */
const requiredSections = [
  '## Problem',
  '## Reproduction & context',
  '## Root cause',
  '## Impact analysis',
  '## Proposed solutions',
  '## Decision',
  '## Implementation',
];

/** @type {string[]} The four impact dimensions, as `###` subsections. */
const requiredDimensions = [
  '### Side effects',
  '### Regressions',
  '### Undesirable behaviors',
  '### Inconsistencies',
];

const missing = [...requiredSections, ...requiredDimensions].filter(
  (h) => !content.includes(h),
);

if (missing.length) {
  fail(`template missing required section(s):\n  - ${missing.join('\n  - ')}`);
}

// The report's lifecycle hinges on a `status` field the actions advance.
if (!/\bstatus\b/i.test(content)) {
  fail('template missing a `status` field (draft → awaiting-approval → approved → implemented)');
}

console.log(
  `OK (test-report-template): ${requiredSections.length} sections + ${requiredDimensions.length} impact dimensions + status field present`,
);
