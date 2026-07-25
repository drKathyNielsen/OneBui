export type Style = 'classic' | 'modern';
export type Theme = 'light' | 'dark';

export interface RawArticle {
  title: string;
  description: string;
  topic: string;
  url: string;
  image?: string;
}

export interface RawCity {
  shortName: string;
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
  image?: string;
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
