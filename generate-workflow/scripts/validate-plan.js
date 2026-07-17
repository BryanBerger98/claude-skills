#!/usr/bin/env node
/**
 * validate-plan.js — structural validator for architecture plans produced by
 * the generate-workflow skill (test of the write-plan action).
 *
 * Usage: node validate-plan.js <plan-file.md>
 *
 * Checks:
 *  1. Title line starts with "# Architecture plan — " and contains no leftover <placeholder>.
 *  2. The 8 required numbered H2 sections are present, in order.
 *  3. Section 3 has a components table with ≥ 1 data row.
 *  4. Every section-3 component name appears in section 6 (Handoff).
 *  5. Section 4 (Rationale) contains ≥ 1 http(s) source URL; warns if fewer URLs than components.
 */
'use strict';

const fs = require('fs');

const SECTIONS = [
  'Need summary',
  'Existing setup',
  'Proposed architecture',
  'Rationale',
  'Build order',
  'Handoff',
  'Risks and costs',
  'Out of scope',
];

function fail(errors) {
  console.error(`FAIL: ${errors.length} error(s)`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error('Usage: node validate-plan.js <plan-file.md>');
  process.exit(2);
}

let md;
try {
  md = fs.readFileSync(file, 'utf8');
} catch (e) {
  console.error(`Cannot read ${file}: ${e.message}`);
  process.exit(2);
}

const errors = [];
const warnings = [];
const lines = md.split('\n');

// 1. Title
const title = lines[0] || '';
if (!title.startsWith('# Architecture plan — ')) {
  errors.push(`Line 1 must start with "# Architecture plan — " (got: "${title.slice(0, 60)}")`);
} else if (/[<>]/.test(title)) {
  errors.push('Title still contains a <placeholder> from the template');
}

// 2. Sections — split by H2 headings "## N. Title"
const sections = {}; // canonical title -> content
let current = null;
let order = [];
for (const line of lines) {
  const m = line.match(/^## (\d+)\.\s+(.+?)\s*$/);
  if (m) {
    current = m[2];
    order.push({ num: Number(m[1]), title: m[2] });
    sections[current] = [];
  } else if (current) {
    sections[current].push(line);
  }
}
SECTIONS.forEach((want, i) => {
  const found = order.find((s) => s.title.toLowerCase() === want.toLowerCase());
  if (!found) errors.push(`Missing section "## ${i + 1}. ${want}"`);
  else if (found.num !== i + 1) errors.push(`Section "${want}" numbered ${found.num}, expected ${i + 1}`);
});
if (errors.length) fail(errors);

const text = (name) => (sections[name] || []).join('\n');

function tableDataRows(sectionText) {
  return sectionText
    .split('\n')
    .filter((l) => /^\s*\|/.test(l)) // table lines
    .filter((l) => !/^\s*\|[\s:|-]+\|?\s*$/.test(l)) // drop separator rows
    .slice(1); // drop header row
}

// 3. Components table
const compRows = tableDataRows(text('Proposed architecture'));
if (compRows.length === 0) {
  errors.push('Section 3 must contain a components table with at least 1 data row');
}
const components = compRows
  .map((r) => r.split('|')[1])
  .map((c) => (c || '').replace(/[`*]/g, '').trim())
  .filter(Boolean);
if (components.some((c) => /[<>]/.test(c))) {
  errors.push('Section 3 still contains <placeholder> component names from the template');
}

// 4. Handoff coverage
const handoff = text('Handoff');
for (const c of components) {
  if (!handoff.includes(c)) errors.push(`Component "${c}" (section 3) is missing from section 6 (Handoff)`);
}

// 5. Sourced rationale
const urls = text('Rationale').match(/https?:\/\/[^\s)>\]]+/g) || [];
if (urls.length === 0) {
  errors.push('Section 4 (Rationale) must cite at least one http(s) source URL');
} else if (urls.length < components.length) {
  warnings.push(`Section 4 has ${urls.length} source URL(s) for ${components.length} component(s) — check every block is sourced`);
}

if (errors.length) fail(errors);
for (const w of warnings) console.warn(`WARN: ${w}`);
console.log(
  `OK (${file}): 8 sections, ${components.length} component(s), all mapped in Handoff, ${urls.length} source URL(s)`
);
