import type { RawArticle, Article, RawCity, CityViewModel } from '../types';

export function sourceLabel(url: string): string {
  if (url.includes('cbsnews.com/colorado')) return 'CBS Colorado';
  if (url.includes('cbsnews.com/minnesota')) return 'CBS Minnesota';
  if (url.includes('9news.com')) return '9NEWS';
  if (url.includes('fox9.com')) return 'FOX 9';
  if (url.includes('kare11.com')) return 'KARE 11';
  if (url.includes('kens5.com')) return 'KENS 5';
  if (url.includes('sanantonioreport.org')) return 'San Antonio Report';
  if (url.includes('wvmetronews.com')) return 'WV MetroNews';
  if (url.includes('wtrf.com')) return 'WTRF';
  return 'Source';
}

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
  return { title: it.title, description: it.description, url: it.url, image: it.image, source: sourceLabel(it.url), topic: topicLabel(it.topic) };
}

// Weekly period nav: the 7 days ending on the city's current date. Real per-day
// content isn't in the sample feed yet (each city only has one day of stories) --
// selecting a day here re-labels the masthead date; wire real per-day data into
// cities.ts (keyed by iso date) to make the list content change with it too.
export function getWeekDays(iso: string): { iso: string; label: string }[] {
  const base = new Date(iso + 'T12:00:00');
  const out: { iso: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(d.getDate() - i);
    out.push({ iso: d.toISOString().slice(0, 10), label: DOW[d.getDay()].slice(0, 3) });
  }
  return out;
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
