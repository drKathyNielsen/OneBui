export type Style = 'classic' | 'modern';
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
  summary?: string; // optional legacy editorial line
  published_at?: string; // optional ISO 8601 with offset
}

export interface RawCity {
  shortName: string;
  metroCode: string;
  date: string; // ISO yyyy-mm-dd
  are_you_ok: RawArticle | null;
  conversation_starters: RawArticle[];
  sports: { team: string; scores: string[] }[];
  you_should_know: RawArticle[];
}

export interface Article {
  title: string;
  description: string;
  source: string;
  topic: string;
  url: string;
  image?: string; // resolved thumbnail URL
  alt?: string; // image alt text ('' when decorative/unknown)
}

export type Period = 'today' | 'weekly';

export interface DayOption {
  iso: string;
  label: string; // MON, TUE, ...
  isSelected: boolean;
}

export interface CityViewModel {
  shortName: string;
  dateLong: string;
  dateShort: string;
  hasAreOk: boolean;
  areOk: Article | null;
  hasStarters: boolean;
  starters: Article[];
  hasKnow: boolean;
  know: Article[];
  hasSports: boolean;
  sports: { team: string; scores: string[] }[];
}
