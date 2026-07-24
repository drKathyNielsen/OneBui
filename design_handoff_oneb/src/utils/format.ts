import type { RawArticle, Article, RawCity, CityViewModel, Style } from '../types';

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

const NUM_WORDS = ['1', '2', '3', '4', '5'];

function mapItem(it: RawArticle): Article {
  return { title: it.title, description: it.description, url: it.url, source: sourceLabel(it.url), topic: topicLabel(it.topic) };
}

// classic style renders the lead "are they ok" story with a serif drop cap
function withDropCap(a: Article): Article {
  return { ...a, dropCap: a.description.charAt(0), descRest: a.description.slice(1) };
}

export function toCityViewModel(raw: RawCity, style: Style): CityViewModel {
  const dates = formatDate(raw.date);
  const areOkBase = raw.are_you_ok ? mapItem(raw.are_you_ok) : null;
  const areOk = areOkBase && style === 'classic' ? withDropCap(areOkBase) : areOkBase;
  return {
    shortName: raw.shortName,
    dateLong: dates.long,
    dateShort: dates.short,
    hasAreOk: !!raw.are_you_ok,
    areOk,
    hasStarters: raw.conversation_starters.length > 0,
    starters: raw.conversation_starters.map((it, i) => ({ ...mapItem(it), n: NUM_WORDS[i] })),
    hasKnow: raw.you_should_know.length > 0,
    know: raw.you_should_know.map(mapItem),
    hasSports: raw.sports.length > 0,
    sports: raw.sports
  };
}
