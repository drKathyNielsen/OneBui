#!/usr/bin/env node
// Generates .pa11yci.json from the digest files actually present, so the
// accessibility gate can never drift into checking a page that no longer exists.
// See openspec/specs/a11y-url-coverage and digests-fixtures/README.md.
//
// Two tiers, because the gate has two jobs:
//   fixtures — required render shapes, crossed with every style×theme combination
//              (appearance tokens are what these pages exist to stress)
//   live     — one newest day + one weekly per metro, default appearance only
//              (their job is detecting content drift, not re-testing tokens)
//
// Imports the selection logic and DAILY_WINDOW straight from src/ (Node 24 strips
// TS types natively) so "which pages are reachable" has exactly one definition.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { selectA11yUrls, UncoveredShapeError } from '../src/data/a11yUrls.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = 'http://localhost:4173/';
const OUT = join(ROOT, '.pa11yci.json');

// Which tier to emit. The pre-push hook narrows by what a push touched
// (.githooks/pre-push); CI and a bare local run emit everything. The required-shape
// check runs in every tier, so narrowing can never turn a missing fixture into a pass.
const TIER = process.env.A11Y_TIER ?? 'all';
if (!['all', 'fixture', 'live'].includes(TIER)) {
  console.error(`gen-pa11y-urls: unknown A11Y_TIER "${TIER}" (expected all, fixture or live)`);
  process.exit(1);
}

const TREES = [
  { tree: 'live', dir: 'digests' },
  { tree: 'fixture', dir: 'digests-fixtures' },
];

// Mirrors src/styles/theme.css, which defines one token set per style×theme.
const STYLES = ['classic', 'modern', 'friendly'];
const THEMES = ['light', 'dark'];

// Theme and style are client-side state, not routes, so each combination is
// reached by clicking the appearance toggles (targeted by aria-label prefix).
function appearanceActions(style, theme) {
  const actions = [];
  if (theme === 'dark') actions.push('click element [aria-label^="Color theme"]');
  if (style !== 'classic') {
    const label = style[0].toUpperCase() + style.slice(1);
    actions.push('click element [aria-label^="Reading style"]');
    actions.push(`wait for element [aria-label="${label}"] to be visible`);
    actions.push(`click element [aria-label="${label}"]`);
  }
  if (actions.length === 0) return null; // classic/light is the default render
  actions.push(`wait for element .oneb-root[data-style="${style}"][data-theme="${theme}"] to be visible`);
  return actions;
}

function readTree(tree, dir) {
  const root = join(ROOT, dir);
  let slugs;
  try {
    slugs = readdirSync(root, { withFileTypes: true }).filter((e) => e.isDirectory());
  } catch {
    return []; // an absent tree is a missing shape, reported by selection below
  }
  const docs = [];
  for (const slugDir of slugs) {
    for (const name of readdirSync(join(root, slugDir.name))) {
      const weekly = name.match(/^([^.]+)\.weekly\.json$/);
      const daily = name.match(/^([^.]+)\.(\d{4}-\d{2}-\d{2})\.json$/);
      if (!weekly && !daily) continue;
      const path = join(root, slugDir.name, name);
      let data;
      try {
        data = JSON.parse(readFileSync(path, 'utf8'));
      } catch (err) {
        // A malformed fixture must surface as an uncovered shape, not as a
        // half-built matrix, so skip the file and let selection do the failing.
        console.warn(`skipping unparseable digest ${path}: ${err.message}`);
        continue;
      }
      docs.push({
        tree,
        slug: slugDir.name,
        kind: weekly ? 'weekly' : 'daily',
        date: daily ? daily[2] : null,
        data,
      });
    }
  }
  return docs;
}

const docs = TREES.flatMap(({ tree, dir }) => readTree(tree, dir));

let selected;
try {
  selected = selectA11yUrls(docs);
} catch (err) {
  if (err instanceof UncoveredShapeError) {
    console.error(`\ngen-pa11y-urls: ${err.message}\n`);
    process.exit(1);
  }
  throw err;
}

const emitted = selected.filter((sel) => TIER === 'all' || sel.tier === TIER);

const urls = [];
for (const sel of emitted) {
  const url = BASE + sel.query;
  if (sel.tier === 'fixture') {
    for (const style of STYLES) {
      for (const theme of THEMES) {
        const actions = appearanceActions(style, theme);
        urls.push(actions ? { url, actions } : { url });
      }
    }
  } else {
    urls.push({ url });
  }
}

const config = {
  defaults: {
    standard: 'WCAG2AA',
    timeout: 30000,
    concurrency: 4,
    chromeLaunchConfig: { args: ['--no-sandbox'] },
  },
  urls,
};

writeFileSync(OUT, JSON.stringify(config, null, 2) + '\n');

// Print the selection: the generated config is gitignored, so this run log is
// what makes the covered pages legible.
for (const sel of emitted) {
  const runs = sel.tier === 'fixture' ? STYLES.length * THEMES.length : 1;
  const shapes = sel.shapes.length ? ` [${sel.shapes.join(', ')}]` : '';
  console.log(`  ${sel.tier.padEnd(7)} ×${runs}  ${sel.query}${shapes}`);
}
console.log(`gen-pa11y-urls: tier=${TIER}, ${emitted.length} pages -> ${urls.length} pa11y runs (.pa11yci.json)`);
