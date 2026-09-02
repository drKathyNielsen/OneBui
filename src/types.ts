export type Style = 'classic' | 'modern' | 'friendly';
export type Theme = 'light' | 'dark';

// Mirrors docs/schema/digest.schema.json (#/$defs/Article, DailyDigest). Treat
// as a stable interface: additive fields are safe; renames/removals are breaking.
// The generator also emits an incidental `metro` (CBSA) field not modeled here.
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
  topics_secondary?: string[]; // additional topics the item spans, same vocabulary
  // as `topic`; absent/empty when the item has none
  url: string;
  summary?: string; // optional editorial line (weekly narrates the arc here; daily
  // now also gets a fuller summary that supersedes `description` when present)
  published_at?: string; // optional ISO 8601 with offset
  logo?: string; // outlet logo URL (joined by source); absent when the outlet has no known logo
  thread?: RawArticle[]; // weekly-only: contributing articles, oldest→newest (additive)
  uid?: string; // stable per-article feedback id. The contract now requires one on
  // every article (fetch refuses to emit an item without one); kept optional here
  // until every bundled file is confirmed to carry one.
  questions?: string[]; // 2–3 conversational openers. Emitted by the generator but
  // NOT modelled in docs/schema/digest.schema.json, so treated as an optional
  // additive field: absence renders normally rather than failing.
}

// A significance-filtered weather alert. Mirrors docs/schema/digest.schema.json
// #/$defs/WeatherAlert (authoritative). The generator emits only allow-listed
// alerts that clear the bar, already ordered most-severe first, so every entry
// renders in array order. Multi-day alerts appear on every day of their window.
export interface RawAlert {
  event: string; // canonical NWS event name, e.g. "Heat Advisory"; rendered verbatim
  area: string; // collapsed county label, e.g. "Atascosa & Wilson"; may be ''
  severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'; // drives upstream order
  summary: string; // pre-composed one-liner; redundant with event/area/ends — not rendered
  description: string; // full NWS product text (WHAT/WHERE/WHEN/IMPACTS) — not rendered
  ends: string | null; // ISO 8601 with numeric offset, or null when open-ended
  uid?: string; // emitted by the generator but NOT modelled in
  // docs/schema/digest.schema.json; optional here for the same reason as
  // RawArticle.questions. Not rendered today.
}

// A per-day daily brief. See docs/schema/digest.schema.json #/$defs/DailyDigest.
export interface RawCity {
  shortName: string;
  metroCode: string;
  date: string; // ISO yyyy-mm-dd
  are_you_ok: RawArticle[]; // complete ordered candidate set, no upper bound — the
  // UI applies the display count (see section-pagination)
  conversation_starters: RawArticle[];
  sports: { team: string; scores: string[] }[];
  you_should_know: RawArticle[];
  weather_alert?: RawAlert[]; // 0+ active alerts; sits above are_you_ok (additive)
}

// The editorially aggregated weekly brief. See docs/schema/digest.schema.json
// #/$defs/WeeklyDigest.
// Shares RawArticle with the daily; differs in `period`, `range`, and item counts.
export interface RawWeekly {
  period: 'weekly';
  shortName: string;
  metroCode: string;
  range: { start: string; end: string }; // ISO yyyy-mm-dd, inclusive
  are_you_ok: RawArticle[]; // complete ordered candidate set; bounded upstream by
  // prioritize's weekly selection, which may move without a schema change
  conversation_starters: RawArticle[];
  you_should_know: RawArticle[];
  sports: { team: string; scores: string[] }[];
  // No weather_alert: the weekly highlight reel has no live-status surface
  // (see docs/schema/digest.schema.json #/$defs/WeeklyDigest).
}

export interface Article {
  title: string;
  description: string;
  source: string;
  topic: string;
  url: string;
  image?: string; // resolved thumbnail URL
  alt?: string; // image alt text ('' when decorative/unknown)
  logo?: string; // source/station logo URL; thumb fallback when image is absent
  summary?: string; // editorial arc narration (weekly grouped items only); omitted otherwise
  dateLabel?: string; // short published date, e.g. "Jul 24"; set on weekly items so
  // readers know *when* each story happened (daily items share the masthead date)
  uid?: string; // passed to ArticleFeedback for thumbs up/down; absent on older items
  questions?: string[]; // conversational openers, rendered under the body when present
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
