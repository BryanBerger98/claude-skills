#!/usr/bin/env node
/**
 * @file scripts/check-markdown.js
 * @description Deterministic conformance checker for the `markdown-style` writing
 * contract. Verifies what a machine can verify: front-matter completeness, Diátaxis
 * typing, heading structure, emoji placement, GFM callout hygiene, code-block tags,
 * table shape, Mermaid palette, and banned phrasings.
 *
 * Two severities:
 *  - `error` — mechanical, unambiguous. A violation is always a violation.
 *  - `warn`  — judgement rules where a legitimate exception exists (paragraph length,
 *              table cell length, code-block length, diagram node count).
 *
 * Exit 1 on any error. Add `--strict` to also exit 1 on warnings.
 * Typographic mechanics (spacing, list markers, trailing whitespace) are deliberately
 * NOT checked here — they belong to `markdownlint-cli2`.
 *
 * @example Usage
 *   node scripts/check-markdown.js docs/specs/auth.md
 *   node scripts/check-markdown.js docs/**\/*.md --json
 *   node scripts/check-markdown.js README.md --strict
 *   node scripts/check-markdown.js README.md --ignore=TBL002,PRO002
 *
 * @exits 0 clean · 1 violations found · 2 usage or I/O error
 */

'use strict';

const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ contract */

/** @type {string[]} Front-matter keys required on every file. */
const REQUIRED_KEYS = ['title', 'status', 'updated', 'owner'];

/** @type {string[]} Accepted `status` values. */
const STATUS_VALUES = ['draft', 'review', 'stable', 'deprecated'];

/** @type {string[]} Accepted Diátaxis `type` values (docs/** only). */
const TYPE_VALUES = ['tutorial', 'how-to', 'reference', 'explanation'];

/** @type {string[]} Banned French phrasings, matched accent- and apostrophe-insensitively. */
const BANNED_PHRASES = [
  'il est important de noter',
  "n'hésitez pas à",
  'dans ce document nous allons',
  'en effet',
  'de manière générale',
  'comme vous pouvez le voir',
  'il convient de',
];

/** @type {RegExp} Section headings the contract forbids outright. */
const BANNED_SECTIONS = /^(conclusion|en resume|pour aller plus loin)$/;

/** @type {RegExp} GFM callout opener, e.g. `> [!WARNING]`. */
const CALLOUT_RE = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/;

/** @type {RegExp} Any emoji / pictographic character. */
const EMOJI_RE = /\p{Extended_Pictographic}/u;

/** @type {Set<string>} Mermaid keywords that must not be counted as flowchart nodes. */
const MERMAID_KEYWORDS = new Set([
  'flowchart', 'graph', 'subgraph', 'end', 'classDef', 'class', 'click', 'style',
  'linkStyle', 'direction', 'LR', 'RL', 'TD', 'TB', 'BT', 'fill', 'stroke', 'color',
]);

/* ------------------------------------------------------------------- helpers */

/**
 * Normalize a string for accent-, case-, and apostrophe-insensitive matching.
 * @param {string} s - Raw text.
 * @returns {string} Lowercased, de-accented, straight-apostrophe text.
 */
function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’ʼ]/g, "'")
    .toLowerCase();
}

/**
 * Split a Markdown document into its YAML front-matter and body.
 * @param {string[]} lines - Full document, one entry per line.
 * @returns {{fm: string[]|null, bodyStart: number}} Front-matter lines (without the
 *   `---` fences) and the zero-based index at which the body begins.
 */
function splitFrontmatter(lines) {
  if (lines[0] !== '---') return { fm: null, bodyStart: 0 };
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') return { fm: lines.slice(1, i), bodyStart: i + 1 };
  }
  return { fm: null, bodyStart: 0 };
}

/**
 * Parse flat `key: value` pairs from front-matter lines. Nested mappings and
 * multi-line values are out of contract scope and ignored.
 * @param {string[]} fmLines - Front-matter body.
 * @returns {Record<string, string>} Key/value map with trimmed values.
 */
function parseFrontmatter(fmLines) {
  /** @type {Record<string, string>} */
  const out = {};
  for (const line of fmLines) {
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_-]*):\s*(.*)$/);
    if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

/**
 * Map every line to the fenced code block it belongs to, if any.
 * @param {string[]} lines - Full document.
 * @returns {{inFence: boolean[], blocks: Array<{start: number, end: number, lang: string}>}}
 *   `inFence[i]` is true for fence delimiters and their content; `blocks` lists each
 *   block with zero-based delimiter indices and its declared language (empty if none).
 */
function scanFences(lines) {
  const inFence = new Array(lines.length).fill(false);
  /** @type {Array<{start: number, end: number, lang: string}>} */
  const blocks = [];
  let open = null;

  lines.forEach((line, i) => {
    const m = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (!m) {
      if (open !== null) inFence[i] = true;
      return;
    }
    if (open === null) {
      open = { start: i, marker: m[2][0], len: m[2].length, lang: m[3].trim().split(/\s+/)[0] || '' };
      inFence[i] = true;
    } else if (m[2][0] === open.marker && m[2].length >= open.len && m[3].trim() === '') {
      inFence[i] = true;
      blocks.push({ start: open.start, end: i, lang: open.lang });
      open = null;
    } else {
      inFence[i] = true;
    }
  });

  if (open !== null) blocks.push({ start: open.start, end: lines.length - 1, lang: open.lang });
  return { inFence, blocks };
}

/**
 * Strip inline code spans so their contents never trigger prose rules.
 * @param {string} line - Source line.
 * @returns {string} Line with `` `...` `` spans blanked out.
 */
function stripInlineCode(line) {
  return line.replace(/`[^`]*`/g, '');
}

/* -------------------------------------------------------------------- checks */

/**
 * Run the full contract against one document.
 * @param {string} file - Path used for reporting and for the docs/** rule.
 * @param {string} content - Raw file contents.
 * @returns {Array<{code: string, severity: 'error'|'warn', line: number, message: string}>}
 *   Violations, ordered by the check that produced them.
 */
function checkDocument(file, content) {
  /** @type {Array<{code: string, severity: 'error'|'warn', line: number, message: string}>} */
  const found = [];

  /**
   * Record a violation.
   * @param {string} code - Stable rule identifier.
   * @param {'error'|'warn'} severity - Failure level.
   * @param {number} line - One-based line number (0 when file-scoped).
   * @param {string} message - Actionable diagnostic.
   */
  const add = (code, severity, line, message) => found.push({ code, severity, line, message });

  const lines = content.split('\n');
  const { fm, bodyStart } = splitFrontmatter(lines);
  const { inFence, blocks } = scanFences(lines);
  const isDocs = /(^|[/\\])docs[/\\]/.test(file);

  /* -- front-matter ------------------------------------------------------- */

  if (!fm) {
    add('FM001', 'error', 1, 'front-matter absent — le document doit ouvrir sur un bloc `---`');
  } else {
    const meta = parseFrontmatter(fm);

    for (const key of REQUIRED_KEYS) {
      if (!meta[key]) add('FM002', 'error', 1, `clé de front-matter manquante ou vide : \`${key}\``);
    }
    if (meta.status && !STATUS_VALUES.includes(meta.status)) {
      add('FM003', 'error', 1, `\`status: ${meta.status}\` invalide — attendu ${STATUS_VALUES.join(' | ')}`);
    }
    if (meta.updated && !/^\d{4}-\d{2}-\d{2}$/.test(meta.updated)) {
      add('FM004', 'error', 1, `\`updated: ${meta.updated}\` n'est pas au format ISO 8601 (YYYY-MM-DD)`);
    }
    if (isDocs && !meta.type) {
      add('FM005', 'error', 1, 'fichier sous `docs/` : la clé `type` Diátaxis est obligatoire');
    }
    if (!isDocs && meta.type) {
      add('FM006', 'error', 1, 'la clé `type` n\'existe que sous `docs/` — la retirer ici');
    }
    if (meta.type && !TYPE_VALUES.includes(meta.type)) {
      add('FM007', 'error', 1, `\`type: ${meta.type}\` invalide — attendu ${TYPE_VALUES.join(' | ')}`);
    }

    /* -- H1 must equal title --------------------------------------------- */

    const h1s = [];
    for (let i = bodyStart; i < lines.length; i++) {
      if (!inFence[i] && /^#\s+/.test(lines[i])) h1s.push({ i, text: lines[i].replace(/^#\s+/, '').trim() });
    }
    if (h1s.length === 0) {
      add('STR001', 'error', bodyStart + 1, 'aucun H1 — le document doit porter un titre de niveau 1');
    } else if (h1s.length > 1) {
      add('STR002', 'error', h1s[1].i + 1, `${h1s.length} H1 trouvés — un seul est autorisé`);
    }
    if (h1s.length && meta.title && h1s[0].text !== meta.title) {
      add('STR003', 'error', h1s[0].i + 1, `le H1 « ${h1s[0].text} » diffère du front-matter \`title: ${meta.title}\``);
    }
  }

  /* -- headings: level skip, emoji placement, banned sections, spacing ---- */

  let prevLevel = 0;
  for (let i = bodyStart; i < lines.length; i++) {
    if (inFence[i]) continue;
    const m = lines[i].match(/^(#{1,6})\s+(.*)$/);
    if (!m) continue;

    const level = m[1].length;
    const text = m[2].trim();

    if (prevLevel && level > prevLevel + 1) {
      add('STR004', 'error', i + 1, `saut de niveau H${prevLevel} → H${level} — descendre un niveau à la fois`);
    }
    prevLevel = level;

    const first = Array.from(text)[0] || '';
    const hasEmoji = EMOJI_RE.test(first);
    if (level === 2 && !hasEmoji) {
      add('EMO001', 'error', i + 1, 'H2 sans emoji d\'ouverture — un emoji sémantique est requis devant chaque H2');
    }
    if (level !== 2 && hasEmoji) {
      add('EMO002', 'error', i + 1, `emoji devant un H${level} — réservé aux H2`);
    }
    if (level === 2 && hasEmoji && EMOJI_RE.test(Array.from(text)[1] || '')) {
      add('EMO003', 'error', i + 1, 'deux emojis consécutifs — un seul par élément');
    }
    if (BANNED_SECTIONS.test(normalize(text.replace(/\p{Extended_Pictographic}/gu, '')).trim())) {
      add('PRO001', 'error', i + 1, `section « ${text} » interdite par le budget anti-verbosité`);
    }
    if (i > bodyStart && lines[i - 1].trim() !== '') {
      add('STR005', 'error', i + 1, 'ligne vide manquante avant le titre');
    }
    if (i + 1 < lines.length && lines[i + 1].trim() !== '') {
      add('STR006', 'error', i + 2, 'ligne vide manquante après le titre');
    }
  }

  /* -- callouts: count, adjacency, no emoji, length ----------------------- */

  /** @type {Array<{start: number, end: number}>} */
  const callouts = [];
  for (let i = bodyStart; i < lines.length; i++) {
    if (inFence[i] || !CALLOUT_RE.test(lines[i])) continue;
    let end = i;
    while (end + 1 < lines.length && !inFence[end + 1] && /^>/.test(lines[end + 1])) end++;
    callouts.push({ start: i, end });

    const body = lines.slice(i, end + 1).join(' ');
    if (EMOJI_RE.test(body)) {
      add('EMO004', 'error', i + 1, 'emoji à l\'intérieur d\'un callout — la plateforme y injecte déjà une icône');
    }
    const prose = body.replace(CALLOUT_RE, '').replace(/^>\s?/gm, '').replace(/>/g, ' ').trim();
    const sentences = prose.split(/[.!?]+\s/).filter(s => s.trim().length > 0).length;
    if (sentences > 2) {
      add('CAL001', 'warn', i + 1, `callout de ${sentences} phrases — deux maximum, au-delà c'est du corps de texte`);
    }
    i = end;
  }

  if (callouts.length > 2) {
    add('CAL002', 'error', callouts[2].start + 1, `${callouts.length} callouts — deux maximum par document`);
  }
  for (let k = 1; k < callouts.length; k++) {
    const between = lines.slice(callouts[k - 1].end + 1, callouts[k].start);
    if (between.every(l => l.trim() === '')) {
      add('CAL003', 'error', callouts[k].start + 1, 'callouts consécutifs — les séparer par du contenu');
    }
  }

  /* -- code blocks: language tag, length, fence spacing ------------------- */

  for (const b of blocks) {
    if (!b.lang) {
      add('COD001', 'error', b.start + 1, 'bloc de code sans tag de langage — ajouter ```ts, ```bash, ```json…');
    }
    const len = b.end - b.start - 1;
    if (len > 25) {
      add('COD002', 'warn', b.start + 1, `bloc de code de ${len} lignes — 25 maximum, élider avec « // ... »`);
    }
    if (b.start > bodyStart && lines[b.start - 1].trim() !== '') {
      add('COD003', 'error', b.start + 1, 'ligne vide manquante avant le bloc de code');
    }
  }

  /* -- tables: column count, cell length ---------------------------------- */

  for (let i = bodyStart; i < lines.length; i++) {
    if (inFence[i]) continue;
    if (!/^\s*\|[\s:|-]+\|\s*$/.test(lines[i]) || !/-/.test(lines[i])) continue;

    const cols = lines[i].trim().replace(/^\||\|$/g, '').split('|').length;
    if (cols > 5) {
      add('TBL001', 'error', i + 1, `tableau de ${cols} colonnes — 5 maximum, le découper en deux`);
    }

    let r = i + 1;
    while (r < lines.length && !inFence[r] && /^\s*\|/.test(lines[r])) {
      const cells = lines[r].trim().replace(/^\||\|$/g, '').split('|');
      cells.forEach(cell => {
        const words = stripInlineCode(cell).trim().split(/\s+/).filter(Boolean).length;
        if (words > 6) {
          add('TBL002', 'warn', r + 1, `cellule de ${words} mots — 6 maximum, signale un tableau mal découpé`);
        }
      });
      r++;
    }
    i = r - 1;
  }

  /* -- Mermaid: init theme, classDef color, node budget ------------------- */

  for (const b of blocks.filter(x => x.lang === 'mermaid')) {
    const src = lines.slice(b.start + 1, b.end);
    const joined = src.join('\n');

    if (!/%%\{\s*init:/.test(joined) || !/['"]theme['"]\s*:\s*['"]base['"]/.test(joined)) {
      add('MER001', 'error', b.start + 1, 'bloc mermaid sans `%%{init: {\'theme\':\'base\', …}}%%` — palette imposée');
    }
    src.forEach((l, k) => {
      if (/^\s*classDef\s/.test(l) && !/\bcolor\s*:/.test(l)) {
        add('MER002', 'error', b.start + 2 + k, 'classDef sans `color:` — illisible en mode sombre sur GitHub');
      }
    });

    const classDefs = src.filter(l => /^\s*classDef\s/.test(l)).length;
    if (classDefs > 4) {
      add('MER003', 'error', b.start + 1, `${classDefs} classDef — 4 classes sémantiques maximum`);
    }
    if (src.filter(l => /^\s*subgraph\s/.test(l)).length > 4) {
      add('MER004', 'error', b.start + 1, 'plus de 4 subgraph — regrouper ou remonter d\'un niveau');
    }

    if (/^\s*(flowchart|graph)\s/m.test(joined)) {
      /** @type {Set<string>} */
      const nodes = new Set();
      const idRe = /\b([A-Za-z][A-Za-z0-9_]*)\s*(?:\(\[|\[\[|\[\(|\[\/|\[|\{\{|\{|\(\(|\()/g;
      const edgeRe = /\b([A-Za-z][A-Za-z0-9_]*)\s*(?:-->|---|-\.->|==>)\s*(?:\|[^|]*\|\s*)?([A-Za-z][A-Za-z0-9_]*)/g;
      for (const l of src) {
        if (/^\s*(classDef|class|style|linkStyle|click|%%)/.test(l)) continue;
        let m2;
        while ((m2 = idRe.exec(l))) if (!MERMAID_KEYWORDS.has(m2[1])) nodes.add(m2[1]);
        while ((m2 = edgeRe.exec(l))) {
          if (!MERMAID_KEYWORDS.has(m2[1])) nodes.add(m2[1]);
          if (!MERMAID_KEYWORDS.has(m2[2])) nodes.add(m2[2]);
        }
      }
      if (nodes.size > 12) {
        add('MER005', 'warn', b.start + 1, `${nodes.size} nœuds détectés — 12 maximum, découper le diagramme`);
      }
    }
  }

  /* -- prose: banned phrasings, paragraph length, link text --------------- */

  for (let i = bodyStart; i < lines.length; i++) {
    if (inFence[i]) continue;
    const plain = normalize(stripInlineCode(lines[i]));
    for (const phrase of BANNED_PHRASES) {
      const needle = normalize(phrase);
      const re = new RegExp(`(^|[^a-z0-9])${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z0-9]|$)`);
      if (re.test(plain)) {
        add('PRO002', 'error', i + 1, `expression bannie : « ${phrase} »`);
      }
    }
    if (/\[\s*(cliquez ici|ici|click here|lire la suite)\s*\]\(/i.test(lines[i])) {
      add('PRO003', 'error', i + 1, 'texte de lien non descriptif — nommer la cible');
    }
  }

  let paraStart = -1;
  let paraText = '';
  const flushParagraph = () => {
    if (paraStart < 0) return;
    const sentences = paraText.split(/[.!?]+(?:\s|$)/).filter(s => s.trim().length > 0).length;
    if (sentences > 4) {
      add('PRO004', 'warn', paraStart + 1, `paragraphe de ${sentences} phrases — 4 maximum`);
    }
    paraStart = -1;
    paraText = '';
  };

  for (let i = bodyStart; i < lines.length; i++) {
    const l = lines[i];
    const isProse = !inFence[i] && l.trim() !== '' && !/^\s*([#>|]|[-*+]\s|\d+\.\s)/.test(l);
    if (isProse) {
      if (paraStart < 0) paraStart = i;
      paraText += ' ' + stripInlineCode(l);
    } else {
      flushParagraph();
    }
  }
  flushParagraph();

  return found;
}

/* ---------------------------------------------------------------------- main */

/**
 * Entry point: parse flags, check each file, print a report.
 * @returns {void}
 */
function main() {
  const argv = process.argv.slice(2);
  const asJson = argv.includes('--json');
  const strict = argv.includes('--strict');
  const ignoreArg = argv.find(a => a.startsWith('--ignore='));
  const ignored = new Set(
    (ignoreArg ? ignoreArg.slice('--ignore='.length) : '').split(',').map(s => s.trim()).filter(Boolean)
  );
  const files = argv.filter(a => !a.startsWith('--'));

  if (files.length === 0) {
    console.error('usage: node check-markdown.js <file.md...> [--json] [--strict] [--ignore=CODE,CODE]');
    console.error('       exit 0 = conforme · 1 = violations · 2 = erreur d\'usage');
    process.exit(2);
  }

  /** @type {Array<{file: string, violations: Array<object>}>} */
  const report = [];
  let errors = 0;
  let warnings = 0;

  for (const file of files) {
    let content;
    try {
      content = fs.readFileSync(file, 'utf8');
    } catch (e) {
      console.error(`FAIL: impossible de lire ${file} — ${e.message}`);
      process.exit(2);
    }
    if (!/\.mdx?$/.test(file)) {
      console.error(`FAIL: ${file} n'est pas un fichier .md ou .mdx`);
      process.exit(2);
    }

    const violations = checkDocument(file, content).filter(v => !ignored.has(v.code));
    errors += violations.filter(v => v.severity === 'error').length;
    warnings += violations.filter(v => v.severity === 'warn').length;
    report.push({ file: path.normalize(file), violations });
  }

  if (asJson) {
    console.log(JSON.stringify({ errors, warnings, files: report }, null, 2));
  } else {
    for (const { file, violations } of report) {
      if (violations.length === 0) {
        console.log(`OK ${file} — conforme au contrat`);
        continue;
      }
      console.log(`\n${file}`);
      for (const v of violations) {
        const tag = v.severity === 'error' ? 'ERROR' : 'WARN ';
        console.log(`  ${tag} ${file}:${v.line}  [${v.code}] ${v.message}`);
      }
    }
    console.log(`\n${errors} erreur(s), ${warnings} avertissement(s) sur ${report.length} fichier(s).`);
  }

  process.exit(errors > 0 || (strict && warnings > 0) ? 1 : 0);
}

main();
