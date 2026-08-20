import type { RawArticle, RawCity, RawWeekly } from '../types';
// Explicit .ts extension: scripts/gen-pa11y-urls.mjs imports this module directly
// under Node, which strips types but does not resolve extensionless specifiers.
import { DAILY_WINDOW } from './window.ts';

// Which application states the accessibility gate covers, expressed as predicates
// over the digest data rather than as a checked-in list of URLs. Pure: the caller
// (scripts/gen-pa11y-urls.mjs) does the file reading, so this stays testable.

export interface DigestDoc {
  tree: 'live' | 'fixture';
  slug: string;
  kind: 'daily' | 'weekly';
  date: string | null; // ISO day for a daily; null for a weekly
  data: RawCity | RawWeekly;
}

export interface SelectedUrl {
  query: string; // canonical query string, e.g. '?metro=boulder-co&period=weekly'
  tier: 'fixture' | 'live';
  shapes: string[]; // required shapes this page covers ([] for a live sweep page)
}

// The largest section page size in the UI; a section deeper than this is what
// makes a pager appear, so it is what the gate needs to see.
const MAX_PAGE_SIZE = 3;

function sections(d: RawCity | RawWeekly): RawArticle[][] {
  return [d.are_you_ok, d.conversation_starters, d.you_should_know];
}

export interface RequiredShape {
  id: string;
  /** What to restore when this shape goes uncovered — quoted in the failure. */
  fix: string;
  matches: (doc: DigestDoc) => boolean;
}

export const REQUIRED_SHAPES: RequiredShape[] = [
  {
    id: 'stacked-weather-alerts',
    fix: 'a fixture daily carrying three or more entries in weather_alert',
    matches: (doc) =>
      doc.kind === 'daily' && ((doc.data as RawCity).weather_alert?.length ?? 0) >= 3,
  },
  {
    id: 'empty-sections',
    fix: 'a fixture daily whose article sections and sports are all empty',
    matches: (doc) =>
      sections(doc.data).every((s) => s.length === 0) && doc.data.sports.length === 0,
  },
  {
    id: 'imageless-article',
    fix: 'a fixture digest carrying an article with "image": null',
    matches: (doc) => sections(doc.data).some((s) => s.some((a) => a.image === null)),
  },
  {
    id: 'pageable-section',
    fix: `a fixture digest with a section deeper than ${MAX_PAGE_SIZE} items`,
    matches: (doc) => sections(doc.data).some((s) => s.length > MAX_PAGE_SIZE),
  },
];

function queryFor(doc: DigestDoc): string {
  return doc.kind === 'weekly'
    ? `?metro=${doc.slug}&period=weekly`
    : `?metro=${doc.slug}&period=daily&date=${doc.date}`;
}

// The days the app will actually load for a metro: the newest DAILY_WINDOW.
// Anything older canonicalizes to the newest day, so checking it would silently
// check the wrong page — the defect this selection exists to prevent.
function inWindow(docs: DigestDoc[]): DigestDoc[] {
  const bySlug = new Map<string, DigestDoc[]>();
  for (const doc of docs) {
    if (doc.kind !== 'daily') continue;
    const list = bySlug.get(doc.slug) ?? [];
    list.push(doc);
    bySlug.set(doc.slug, list);
  }
  const kept = new Set<DigestDoc>();
  for (const list of bySlug.values()) {
    for (const doc of [...list].sort((a, b) => b.date!.localeCompare(a.date!)).slice(0, DAILY_WINDOW)) {
      kept.add(doc);
    }
  }
  return docs.filter((doc) => doc.kind === 'weekly' || kept.has(doc));
}

export class UncoveredShapeError extends Error {}

// Fixture pages first (required shapes, later crossed with the appearance
// matrix), then one newest-day and one weekly page per live metro.
export function selectA11yUrls(docs: DigestDoc[]): SelectedUrl[] {
  const loadable = inWindow(docs);
  const selected = new Map<string, SelectedUrl>();

  const add = (doc: DigestDoc, shape?: string) => {
    const query = queryFor(doc);
    const existing = selected.get(query);
    if (existing) {
      if (shape) existing.shapes.push(shape);
      return;
    }
    selected.set(query, { query, tier: doc.tree, shapes: shape ? [shape] : [] });
  };

  for (const shape of REQUIRED_SHAPES) {
    const doc = loadable.find((d) => d.tree === 'fixture' && shape.matches(d));
    if (!doc) {
      throw new UncoveredShapeError(
        `accessibility coverage unsatisfied: ${shape.id}. No fixture digest matches it — ` +
          `restore ${shape.fix} under digests-fixtures/ (see digests-fixtures/README.md).`
      );
    }
    add(doc, shape.id);
  }

  const liveSlugs = [...new Set(loadable.filter((d) => d.tree === 'live').map((d) => d.slug))].sort();
  for (const slug of liveSlugs) {
    const days = loadable
      .filter((d) => d.tree === 'live' && d.slug === slug && d.kind === 'daily')
      .sort((a, b) => b.date!.localeCompare(a.date!));
    if (days[0]) add(days[0]);
    const week = loadable.find((d) => d.tree === 'live' && d.slug === slug && d.kind === 'weekly');
    if (week) add(week);
  }

  return [...selected.values()];
}
