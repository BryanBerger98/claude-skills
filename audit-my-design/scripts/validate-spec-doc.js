#!/usr/bin/env node
/**
 * @file scripts/validate-spec-doc.js
 * @description Validates a produced design specification document (the output
 * of action `05-synthesize-spec`). This is functionally specific to the
 * `audit-my-design` skill — it checks the deliverable, not the skill structure.
 *
 * Checks performed (diacritic-insensitive on headings):
 *  - File exists and is non-empty markdown.
 *  - A `Mode` line is present and resolves to `creation` or `redesign`
 *    (placeholders like `<creation | redesign>` are rejected as "not filled").
 *  - All mode-independent sections are present as headings:
 *      Contexte, Périmètre, Direction de design, Spécifications de changement,
 *      Accessibilité, Mise en œuvre.
 *  - When Mode = redesign, the `Audit de l'existant` section is also required;
 *    when Mode = creation, it must be absent (the template says to remove it).
 *  - The change table carries its expected columns:
 *      élément, état actuel, changement, raison, priorité.
 *
 * @example Usage
 *   node validate-spec-doc.js .claude/docs/design/spec-dashboard.md
 *
 * @exits 0 on success, 1 on validation failure (with actionable diagnostics).
 */

const fs = require('fs');
const path = require('path');

/** @type {string|undefined} */
const target = process.argv[2];

/**
 * Print a multi-line failure diagnostic and exit non-zero.
 * @param {string} msg
 * @returns {never}
 */
function fail(msg) {
  console.error(`FAIL (validate-spec-doc): ${msg.split('\n').join('\n  ')}`);
  process.exit(1);
}

if (!target) {
  fail('no path given.\n  Usage: node validate-spec-doc.js <path-to-spec.md>');
}

const docPath = path.resolve(target);
if (!fs.existsSync(docPath)) fail(`file not found: ${docPath}`);

const raw = fs.readFileSync(docPath, 'utf8');
if (raw.trim().length === 0) fail(`file is empty: ${docPath}`);

/**
 * Lowercase and strip diacritics so "Périmètre" matches "perimetre".
 * @param {string} s
 * @returns {string}
 */
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const normDoc = norm(raw);

/** @type {string[]} Heading lines only (markdown ATX headings). */
const headings = raw
  .split('\n')
  .filter((l) => /^#{1,6}\s+/.test(l))
  .map((l) => norm(l));

/** @type {string[]} */
const errors = [];

// --- Mode ---------------------------------------------------------------
// Find the first line that mentions "Mode", then read its filled value.
// A line still carrying an angle-bracket placeholder (e.g. "<creation | redesign>")
// counts as unfilled.
const modeLineMatch = raw.match(/^.*\bmode\b.*$/im);
let mode = null;
const modeErr =
  'missing or unfilled `Mode` line — expected a line like "- **Mode** : redesign". ' +
  'A placeholder such as "<creation | redesign>" does not count.';
if (!modeLineMatch) {
  errors.push(modeErr);
} else if (/<[^>]*>/.test(modeLineMatch[0])) {
  errors.push(modeErr);
} else {
  const v = modeLineMatch[0].match(/\b(creation|cr[ée]ation|redesign|refonte)\b/i);
  if (!v) {
    errors.push(modeErr);
  } else {
    const nv = norm(v[1]);
    mode = nv.startsWith('creation') ? 'creation' : 'redesign'; // "refonte"/"redesign" → redesign
  }
}

// --- Required sections (mode-independent) --------------------------------
/** @type {Array<{label:string, key:string}>} */
const required = [
  { label: 'Contexte & objectifs', key: 'contexte' },
  { label: 'Périmètre', key: 'perimetre' },
  { label: 'Direction de design cible', key: 'direction de design' },
  { label: 'Spécifications de changement', key: 'specifications de changement' },
  { label: 'Accessibilité', key: 'accessibilite' },
  { label: 'Mise en œuvre / handoff', key: 'mise en ' }, // matches "mise en oeuvre"
];

for (const { label, key } of required) {
  if (!headings.some((h) => h.includes(key))) {
    errors.push(`missing required section heading: "${label}"`);
  }
}

// --- Conditional audit section ------------------------------------------
const hasAudit = headings.some((h) => h.includes('audit de l') || h.includes('audit de lexistant'));
if (mode === 'redesign' && !hasAudit) {
  errors.push('Mode = redesign but the "Audit de l\'existant" section is missing.');
}
if (mode === 'creation' && hasAudit) {
  errors.push('Mode = creation but an "Audit de l\'existant" section is present — remove it (nothing to audit).');
}

// --- Change table columns -----------------------------------------------
/** @type {Array<{label:string, key:string}>} */
const columns = [
  { label: 'élément', key: 'element' },
  { label: 'état actuel', key: 'etat actuel' },
  { label: 'changement', key: 'changement' },
  { label: 'raison', key: 'raison' },
  { label: 'priorité', key: 'priorite' },
];
const missingCols = columns.filter((c) => !normDoc.includes(c.key)).map((c) => c.label);
if (missingCols.length) {
  errors.push(
    `change table is missing expected column(s): ${missingCols.join(', ')}. ` +
      'Expected a row like: | # | élément | état actuel | changement | raison (besoin / heuristique) | effort | priorité |'
  );
}

if (errors.length) fail(`${errors.length} problem(s) in ${path.basename(docPath)}:\n` + errors.join('\n'));

console.log(
  `OK (validate-spec-doc): ${path.basename(docPath)} — mode=${mode}, all required sections + change-table columns present`
);
