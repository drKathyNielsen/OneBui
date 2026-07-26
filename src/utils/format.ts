import type { RawArticle, Article, RawCity, RawWeekly, DigestViewModel } from '../types';

export function topicLabel(t: string): string {
  return t.replace(/-/g, ' ');
}

const DOW = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Masthead date, e.g. "THURSDAY, JULY 23, 2026".
function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return DOW[d.getDay()] + ', ' + MON[d.getMonth()].toUpperCase() + ' ' + d.getDate() + ', ' + d.getFullYear();
}

// Weekly coverage label, e.g. "Week of Jul 19–25" (same month) or
// "Week of Jul 28 – Aug 3" (spanning months).
function formatRange(start: string, end: string): string {
  const s = new Date(start + 'T12:00:00');
  const e = new Date(end + 'T12:00:00');
  const startPart = MON_SHORT[s.getMonth()] + ' ' + s.getDate();
  const endPart = s.getMonth() === e.getMonth() ? String(e.getDate()) : MON_SHORT[e.getMonth()] + ' ' + e.getDate();
  const sep = s.getMonth() === e.getMonth() ? '–' : ' – ';
  return 'Week of ' + startPart + sep + endPart;
}

// `summary` is shown only for grouped items — a weekly item that clusters a
// multi-day sequence (carries a `thread`), where the summary narrates the arc.
// Single items (no thread) carry an incidental summary we don't surface.
function mapItem(it: RawArticle): Article {
  const isGroup = Array.isArray(it.thread) && it.thread.length > 0;
  return {
    title: it.title,
    description: it.description ?? '',
    url: it.url,
    image: it.image?.url,
    alt: it.image?.alt ?? '',
    source: it.source,
    topic: topicLabel(it.topic),
    summary: isGroup ? it.summary : undefined,
  };
}

// Compact label for a day chip, e.g. "THU 23". Weekday alone can repeat across a
// metro's available days (coverage can exceed a week), so include the day number.
export function dayChipLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return DOW[d.getDay()].slice(0, 3) + ' ' + d.getDate();
}

// Daily brief -> view model (period 'daily', masthead date, no range label).
export function toCityViewModel(raw: RawCity): DigestViewModel {
  return {
    period: 'daily',
    shortName: raw.shortName,
    dateLong: formatDate(raw.date),
    rangeLabel: '',
    areOk: raw.are_you_ok.map(mapItem),
    starters: raw.conversation_starters.map(mapItem),
    know: raw.you_should_know.map(mapItem),
    sports: raw.sports,
  };
}

// Weekly aggregate -> view model (period 'weekly', coverage range, no date).
export function toWeeklyViewModel(raw: RawWeekly): DigestViewModel {
  return {
    period: 'weekly',
    shortName: raw.shortName,
    dateLong: '',
    rangeLabel: formatRange(raw.range.start, raw.range.end),
    areOk: raw.are_you_ok.map(mapItem),
    starters: raw.conversation_starters.map(mapItem),
    know: raw.you_should_know.map(mapItem),
    sports: raw.sports,
  };
}
