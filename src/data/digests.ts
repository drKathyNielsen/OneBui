import type { RawCity, RawWeekly } from '../types';

// One day of digest for a metro: the ISO date plus the loaded RawCity.
export interface MetroDay {
  date: string;
  data: RawCity;
}

// One metro's worth of digests: up to the newest 4 days (newest-first) plus the
// single weekly aggregate (null for a new feed that has no weekly.json yet).
export interface Metro {
  slug: string;
  metroCode: string;
  shortName: string;
  days: MetroDay[];
  weekly: RawWeekly | null;
}

// How many daily files per metro enter the bundle. Older days are never
// imported, so the bundle doesn't grow with history (contract intent, review #7).
const DAILY_WINDOW = 4;

// Lazy glob: a path -> dynamic-import map. Without `eager`, no JSON is inlined
// up front; we import only the files we actually ingest below.
const loaders = import.meta.glob('/digests/**/*.json') as Record<
  string,
  () => Promise<{ default: unknown }>
>;

type ClassifiedPath =
  | { kind: 'daily'; slug: string; metroCode: string; date: string }
  | { kind: 'weekly'; slug: string; metroCode: string };

// Classify a digest path by filename (processor logic, not displayed data):
//   /digests/<slug>/<metroCode>.weekly.json      -> the weekly aggregate
//   /digests/<slug>/<metroCode>.<date>.json      -> a daily brief
function classifyPath(path: string): ClassifiedPath | null {
  const weekly = path.match(/\/digests\/([^/]+)\/([^/.]+)\.weekly\.json$/);
  if (weekly) return { kind: 'weekly', slug: weekly[1], metroCode: weekly[2] };
  const daily = path.match(/\/digests\/([^/]+)\/([^/.]+)\.(\d{4}-\d{2}-\d{2})\.json$/);
  if (daily) return { kind: 'daily', slug: daily[1], metroCode: daily[2], date: daily[3] };
  return null;
}

// Minimal shape checks: skip a malformed file rather than breaking the whole
// app. Upstream, the generator validates against the contract.
function isValidCity(data: unknown): data is RawCity {
  const c = data as Partial<RawCity> | null;
  return (
    !!c &&
    typeof c.shortName === 'string' &&
    typeof c.date === 'string' &&
    Array.isArray(c.are_you_ok) &&
    Array.isArray(c.conversation_starters) &&
    Array.isArray(c.you_should_know) &&
    Array.isArray(c.sports)
  );
}

function isValidWeekly(data: unknown): data is RawWeekly {
  const w = data as Partial<RawWeekly> | null;
  return (
    !!w &&
    w.period === 'weekly' &&
    typeof w.shortName === 'string' &&
    !!w.range &&
    typeof w.range.start === 'string' &&
    typeof w.range.end === 'string' &&
    Array.isArray(w.are_you_ok) &&
    Array.isArray(w.conversation_starters) &&
    Array.isArray(w.you_should_know) &&
    Array.isArray(w.sports)
  );
}

interface Group {
  slug: string;
  metroCode: string;
  dailies: { date: string; load: () => Promise<{ default: unknown }> }[];
  weeklyLoad: (() => Promise<{ default: unknown }>) | null;
}

async function buildManifest(): Promise<Metro[]> {
  // Group loaders by directory slug (path grouping is processor logic).
  const groups = new Map<string, Group>();
  for (const [path, load] of Object.entries(loaders)) {
    const c = classifyPath(path);
    if (!c) continue;
    let g = groups.get(c.slug);
    if (!g) {
      g = { slug: c.slug, metroCode: c.metroCode, dailies: [], weeklyLoad: null };
      groups.set(c.slug, g);
    }
    if (c.kind === 'weekly') g.weeklyLoad = load;
    else g.dailies.push({ date: c.date, load });
  }

  const built = await Promise.all([...groups.values()].map(buildMetro));
  const metros = built.filter((m): m is Metro => m !== null);
  metros.sort((a, b) => a.shortName.localeCompare(b.shortName));
  return metros;
}

async function buildMetro(g: Group): Promise<Metro | null> {
  // Newest DAILY_WINDOW by filename date; only these are imported.
  const newest = [...g.dailies].sort((a, b) => b.date.localeCompare(a.date)).slice(0, DAILY_WINDOW);
  const loaded = await Promise.all(
    newest.map(async (d) => {
      const mod = await d.load();
      return isValidCity(mod.default) ? { date: d.date, data: mod.default } : null;
    })
  );
  const days = loaded.filter((d): d is MetroDay => d !== null);
  if (days.length === 0) return null; // e.g. an empty digests/columbus-oh/

  let weekly: RawWeekly | null = null;
  if (g.weeklyLoad) {
    const mod = await g.weeklyLoad();
    if (isValidWeekly(mod.default)) weekly = mod.default;
  }

  // Displayed values come from the body, not the filename.
  return { slug: g.slug, metroCode: g.metroCode, shortName: days[0].data.shortName, days, weekly };
}

// Async because ingestion is lazy: consumers await this. App renders a loading
// state until it resolves.
export const metrosPromise: Promise<Metro[]> = buildManifest();
