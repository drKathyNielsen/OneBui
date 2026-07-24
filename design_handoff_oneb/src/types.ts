export type Style = 'classic' | 'modern';
export type Theme = 'light' | 'dark';

export interface RawArticle {
  title: string;
  description: string;
  topic: string;
  url: string;
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
  n?: string;      // ordinal, conversation starters only
  dropCap?: string; // classic style "are they ok" lead, first letter
  descRest?: string; // remainder of description after drop cap
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
