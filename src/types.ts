export type Style = 'classic' | 'modern' | 'friendly';
export type Theme = 'light' | 'dark';

// Mirrors docs/DIGEST_OUTPUT_CONTRACT.md §4. Treat as a stable interface:
// additive fields are safe; renames/removals are breaking. The generator also
// emits an incidental `metro` (CBSA) field not modeled here — safe to ignore.
export interface RawImage {
  url: string;
  alt: string;
}

export interface RawArticle {
  title: string;
  description?: string; // plain-text snippet; omitted when empty
  image: RawImage | null; // lead image, or null
  source: string; // human outlet label, e.g. "9NEWS"
  topic: string; // kebab slug
  url: string;
  summary?: string; // optional editorial line (weekly narrates the arc here)
  published_at?: string; // optional ISO 8601 with offset
  thread?: RawArticle[]; // weekly-only: contributing articles, oldest→newest (additive)
}

// A significance-filtered weather alert. The generator only emits alerts that
// clear the bar, so every entry renders; array order is the display order.
export interface RawAlert {
  event: string; // NWS event name, e.g. "Heat Advisory"
  area?: string; // affected sub-area label, e.g. "Atascosa & Wilson"
  summary?: string; // pre-composed one-line summary
  description?: string; // full NWS product text (WHAT/WHERE/WHEN/IMPACTS)
  ends?: string; // ISO 8601 with offset; when the alert lapses
}

// A per-day daily brief. See docs/DIGEST_OUTPUT_CONTRACT.md §4.
export interface RawCity {
  shortName: string;
  metroCode: string;
  date: string; // ISO yyyy-mm-dd
  are_you_ok: RawArticle[]; // 0–1 lead stories
  conversation_starters: RawArticle[];
  sports: { team: string; scores: string[] }[];
  you_should_know: RawArticle[];
  weather_alert?: RawAlert[]; // 0+ active alerts; sits above are_you_ok (additive)
}

// The editorially aggregated weekly brief. See docs/WEEKLY_DIGEST_CONTRACT.md.
// Shares RawArticle with the daily; differs in `period`, `range`, and item counts.
export interface RawWeekly {
  period: 'weekly';
  shortName: string;
  metroCode: string;
  range: { start: string; end: string }; // ISO yyyy-mm-dd, inclusive
  are_you_ok: RawArticle[]; // 0–2 lead stories
  conversation_starters: RawArticle[];
  you_should_know: RawArticle[];
  sports: { team: string; scores: string[] }[];
  weather_alert?: RawAlert[]; // 0+ active alerts (additive)
}

export interface Article {
  title: string;
  description: string;
  source: string;
  topic: string;
  url: string;
  image?: string; // resolved thumbnail URL
  alt?: string; // image alt text ('' when decorative/unknown)
  summary?: string; // editorial arc narration (weekly items); omitted when absent
  dateLabel?: string; // short published date, e.g. "Jul 24"; set on weekly items so
  // readers know *when* each story happened (daily items share the masthead date)
}

// A weather alert prepared for display. `endsLabel` is the human "Until…" line
// derived from the raw `ends` instant (metro-local wall clock, no viewer drift).
export interface Alert {
  event: string;
  area?: string;
  endsLabel?: string;
}

// Which period document is being shown. Daily is a single day's brief with a
// day-chip rail; weekly is the aggregate with a coverage range and no chips.
export type Period = 'daily' | 'weekly';

// One view model shape for both periods (discriminated by `period`). Daily
// carries `dateLong`; weekly carries `rangeLabel`. Section arrays are uniform.
export interface DigestViewModel {
  period: Period;
  shortName: string;
  dateLong: string; // daily masthead date; '' for weekly
  rangeLabel: string; // weekly coverage label, e.g. "Week of Jul 19–25"; '' for daily
  alerts: Alert[]; // active weather alerts; rendered above areOk when non-empty
  areOk: Article[];
  starters: Article[];
  know: Article[];
  sports: { team: string; scores: string[] }[];
}
