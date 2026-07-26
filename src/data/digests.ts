import type { RawCity } from '../types';

// One day of digest for a metro: the ISO date plus the loaded RawCity.
export interface MetroDay {
  date: string;
  data: RawCity;
}

// One metro's worth of digests, with days sorted newest-first.
export interface Metro {
  slug: string;
  metroCode: string;
  shortName: string;
  days: MetroDay[];
}

// Bundle every generator digest at build time. Files live at
// /digests/<slug>/<metroCode>.<date>.json and conform to the output contract.
// Eager glob => no runtime fetch, no async/loading states; the JSON is inlined.
const modules = import.meta.glob('/digests/**/*.json', { eager: true }) as Record<
  string,
  { default: RawCity }
>;

// /digests/<slug>/<metroCode>.<date>.json -> its parts, or null if it doesn't match.
function parsePath(path: string): { slug: string; metroCode: string; date: string } | null {
  const m = path.match(/\/digests\/([^/]+)\/([^/.]+)\.(\d{4}-\d{2}-\d{2})\.json$/);
  return m ? { slug: m[1], metroCode: m[2], date: m[3] } : null;
}

// Minimal shape check: skip a malformed file rather than breaking the whole app.
// Upstream, the generator validates against the contract (contract §7).
function isValidCity(data: unknown): data is RawCity {
  const c = data as Partial<RawCity> | null;
  return (
    !!c &&
    typeof c.shortName === 'string' &&
    typeof c.date === 'string' &&
    'are_you_ok' in c &&
    Array.isArray(c.conversation_starters) &&
    Array.isArray(c.you_should_know) &&
    Array.isArray(c.sports)
  );
}

function buildManifest(): Metro[] {
  const bySlug = new Map<string, Metro>();

  for (const [path, mod] of Object.entries(modules)) {
    const parsed = parsePath(path);
    if (!parsed) continue;
    const data = mod.default;
    if (!isValidCity(data)) continue;
    // The filename date drives navigation while the body date drives the
    // masthead; a mismatch would show a date that disagrees with the chosen
    // day. Skip such a file rather than render an inconsistent digest.
    if (data.date !== parsed.date) {
      console.warn(`Digest date mismatch: ${path} body date ${data.date} != filename ${parsed.date}; skipping.`);
      continue;
    }

    let metro = bySlug.get(parsed.slug);
    if (!metro) {
      metro = { slug: parsed.slug, metroCode: parsed.metroCode, shortName: data.shortName, days: [] };
      bySlug.set(parsed.slug, metro);
    }
    metro.days.push({ date: parsed.date, data });
  }

  // Drop metros with no valid days (e.g. an empty digests/columbus-oh/).
  const metros = [...bySlug.values()].filter((m) => m.days.length > 0);
  for (const m of metros) m.days.sort((a, b) => b.date.localeCompare(a.date)); // newest first
  metros.sort((a, b) => a.shortName.localeCompare(b.shortName));
  return metros;
}

export const METROS: Metro[] = buildManifest();
