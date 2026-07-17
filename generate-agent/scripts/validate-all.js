#!/usr/bin/env node
/**
 * @file scripts/validate-all.js
 * @description Runs the full validation gate for a generated agent:
 * structure (validate-agent.js) then invocation evals
 * (validate-agent-evals.js, resolved as `<agent-dir>/evals/<name>.json`).
 *
 * @example Usage
 *   node validate-all.js <path-to-agent.md>
 *
 * @exits 0 when both validators pass, 1 otherwise.
 */

const path = require('path');
const { spawnSync } = require('child_process');

/** @type {string|undefined} */
const target = process.argv[2];
if (!target) {
  console.error('FAIL (validate-all): missing argument.\n  Usage: node validate-all.js <path-to-agent.md>');
  process.exit(1);
}

/** @type {string} Resolved absolute path of the agent file. */
const AGENT_PATH = path.resolve(target);

/** @type {Array<{label: string, script: string}>} Validators, in gate order. */
const validators = [
  { label: 'structure', script: path.join(__dirname, 'validate-agent.js') },
  { label: 'evals', script: path.join(__dirname, 'validate-agent-evals.js') },
];

let failed = 0;
for (const v of validators) {
  const res = spawnSync(process.execPath, [v.script, AGENT_PATH], { stdio: 'inherit' });
  if (res.status !== 0) failed++;
}

if (failed) {
  console.error(`\nFAIL (validate-all @ ${AGENT_PATH}): ${failed}/${validators.length} validator(s) failed`);
  process.exit(1);
}
console.log(`\nOK (validate-all): agent ${path.basename(AGENT_PATH)} passed structure + evals`);
