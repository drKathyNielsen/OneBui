import type { RawArticle, Article, RawCity, CityViewModel } from '../types';

export function topicLabel(t: string): string {
  return t.replace(/-/g, ' ');
}

const DOW = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function formatDate(iso: string): { long: string; short: string } {
  const d = new Date(iso + 'T12:00:00');
  const dow = DOW[d.getDay()];
  const mon = MON[d.getMonth()];
  const day = d.getDate();
  const year = d.getFullYear();
  return {
    long: dow + ', ' + mon.toUpperCase() + ' ' + day + ', ' + year,
    short: dow.charAt(0) + dow.slice(1).toLowerCase() + ', ' + mon + ' ' + day
  };
}

function mapItem(it: RawArticle): Article {
  return { title: it.title, description: it.description ?? '', url: it.url, image: it.image?.url, source: it.source, topic: topicLabel(it.topic) };
}

// Compact label for a day chip, e.g. "THU 23". Weekday alone can repeat across a
// metro's available days (coverage can exceed a week), so include the day number.
export function dayChipLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return DOW[d.getDay()].slice(0, 3) + ' ' + d.getDate();
}

export function toCityViewModel(raw: RawCity): CityViewModel {
  const dates = formatDate(raw.date);
  const areOk = raw.are_you_ok ? mapItem(raw.are_you_ok) : null;
  return {
    shortName: raw.shortName,
    dateLong: dates.long,
    dateShort: dates.short,
    hasAreOk: !!raw.are_you_ok,
    areOk,
    hasStarters: raw.conversation_starters.length > 0,
    starters: raw.conversation_starters.map(mapItem),
    hasKnow: raw.you_should_know.length > 0,
    know: raw.you_should_know.map(mapItem),
    hasSports: raw.sports.length > 0,
    sports: raw.sports
  };
}
