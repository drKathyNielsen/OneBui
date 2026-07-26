import type { Metro } from '../data/digests';
import type { Period } from '../types';

// The three pieces of view state we mirror in the URL query string:
//   ?metro=<slug>&period=<daily|weekly>&date=<yyyy-mm-dd>
// `date` appears only in the daily view.
export interface RawViewParams {
  metro?: string;
  period?: string;
  date?: string;
}

export interface ResolvedViewParams {
  metroIdx: number;
  period: Period;
  date: string; // the selected daily date (kept even in weekly, for restore)
  changed: boolean; // incoming params were corrected → canonicalize the URL
}

// Parse raw (unvalidated) params out of a `location.search` string.
export function parseViewParams(search: string): RawViewParams {
  const p = new URLSearchParams(search);
  return {
    metro: p.get('metro') ?? undefined,
    period: p.get('period') ?? undefined,
    date: p.get('date') ?? undefined,
  };
}

// Validate raw params against the resolved manifest, falling back to safe
// defaults. `changed` is true when the canonical form differs from the input
// (unknown/missing metro, weekly without an aggregate, out-of-window date, or a
// bare/partial URL) so the caller can canonicalize with replaceState.
export function resolveViewParams(raw: RawViewParams, metros: Metro[]): ResolvedViewParams {
  // metro: slug → index; unknown or missing falls back to the first metro.
  let metroIdx = metros.findIndex((m) => m.slug === raw.metro);
  if (metroIdx < 0) metroIdx = 0;
  const metro = metros[metroIdx];

  // period: weekly only when this metro has an aggregate; otherwise daily.
  let period: Period = raw.period === 'weekly' ? 'weekly' : 'daily';
  if (period === 'weekly' && !metro.weekly) period = 'daily';

  // date: must be one of the ingested days; otherwise the newest.
  const date = raw.date && metro.days.some((d) => d.date === raw.date) ? raw.date : metro.days[0].date;

  // Canonical iff every value round-trips what the URL carried. `date` is only
  // part of the daily URL, so in weekly mode a present `date` is a change (strip).
  const changed =
    metro.slug !== raw.metro ||
    period !== raw.period ||
    (period === 'daily' ? date !== raw.date : raw.date !== undefined);

  return { metroIdx, period, date, changed };
}

// Serialize view state to a canonical query string (with leading '?').
export function toSearch(state: { metroIdx: number; period: Period; date: string }, metros: Metro[]): string {
  const p = new URLSearchParams();
  p.set('metro', metros[state.metroIdx].slug);
  p.set('period', state.period);
  if (state.period === 'daily') p.set('date', state.date);
  return '?' + p.toString();
}
