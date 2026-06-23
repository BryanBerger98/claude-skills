#!/usr/bin/env node
/**
 * @file scripts/check-deliverable.js
 * @description Validates an ultrabrain deliverable document (the artifact
 * produced by the `synthesize` action). Confirms the five required sections
 * are present and that the Action plan section is non-empty.
 *
 * Required sections (matched case-insensitively as Markdown headings):
 *   - Problem statement
 *   - Idea inventory
 *   - Clusters & evaluation   (matched loosely on "Clusters")
 *   - Top picks
 *   - Action plan
 *
 * The Action plan section must contain at least one non-heading,
 * non-placeholder line of content (a line that is not empty, not a heading,
 * and not solely an unfilled `<...>` placeholder).
 *
 * @example Usage
 *   node check-deliverable.js ./ultrabrain-onboarding.md
 *
 * @exits 0 on success, 1 on validation failure or bad usage.
 */

const fs = require('fs');
const path = require('path');

/** @type {string|undefined} */
const target = process.argv[2];

/**
 * Print a failure diagnostic and exit non-zero.
 * @param {string} msg - Human-readable diagnostic.
 * @returns {never}
 */
function fail(msg) {
  console.error(`FAIL (check-deliverable): ${msg}`);
  process.exit(1);
}

if (!target) fail('usage: node check-deliverable.js <path-to-deliverable.md>');

const filePath = path.resolve(target);
if (!fs.existsSync(filePath)) fail(`file not found: ${filePath}`);

const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

/**
 * Required section headings. Each entry is a label plus a matcher run against
 * heading text (lowercased, leading `#` stripped).
 * @type {Array<{label: string, match: (h: string) => boolean}>}
 */
const required = [
  { label: 'Problem statement', match: (h) => h.includes('problem statement') },
  { label: 'Idea inventory', match: (h) => h.includes('idea inventory') },
  { label: 'Clusters & evaluation', match: (h) => h.includes('cluster') },
  { label: 'Top picks', match: (h) => h.includes('top pick') },
  { label: 'Action plan', match: (h) => h.includes('action plan') },
];

/** @type {Array<{text: string, index: number}>} Heading lines with their position. */
const headings = [];
lines.forEach((line, i) => {
  const m = line.match(/^#{1,6}\s+(.*\S)\s*$/);
  if (m) headings.push({ text: m[1].toLowerCase(), index: i });
});

const missing = required.filter((r) => !headings.some((h) => r.match(h.text)));
if (missing.length) fail(`missing required section(s): ${missing.map((r) => r.label).join(', ')}`);

// Verify the Action plan section has real content.
const actionHeadingPos = headings.find((h) => h.text.includes('action plan')).index;
const actionLevel = (lines[actionHeadingPos].match(/^#+/) || ['#'])[0].length;

let nextHeadingPos = lines.length;
for (const h of headings) {
  if (h.index <= actionHeadingPos) continue;
  const lvl = (lines[h.index].match(/^#+/) || ['#'])[0].length;
  if (lvl <= actionLevel) { nextHeadingPos = h.index; break; }
}

const sectionBody = lines.slice(actionHeadingPos + 1, nextHeadingPos);
const hasContent = sectionBody.some((l) => {
  const t = l.trim();
  if (!t) return false;
  if (/^#{1,6}\s/.test(t)) return false;
  // Reduce the line to its real, filled-in prose:
  //  1. drop `<...>` placeholder spans (unfilled template slots),
  //  2. drop list/numbering markers and markdown emphasis,
  //  3. drop a leading `Label:` prefix (template field names like "First action:"),
  // then require a remaining word of 2+ letters. This treats a filled bold-label
  // line as content while rejecting an untouched template line.
  const real = t
    .replace(/<[^>]*>/g, '')
    .replace(/^([-*]|\d+\.)\s+/, '')
    .replace(/[*_`#]/g, '')
    .replace(/^[^:]{0,40}:\s*/, '')
    .trim();
  return /[A-Za-z]{2,}/.test(real);
});

if (!hasContent) fail('Action plan section is empty or contains only unfilled <placeholders>');

console.log(`OK (check-deliverable): ${path.basename(filePath)} — all 5 sections present, action plan non-empty`);
