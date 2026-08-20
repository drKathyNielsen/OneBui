import type { RawArticle, Article, RawAlert, Alert, RawCity, RawWeekly, DigestViewModel } from '../types';

export function topicLabel(t: string): string {
  return t.replace(/-/g, ' ');
}

// Per-style microcopy carries decorative emoji ("Chat starters 💬"). They read
// fine on screen but a screen reader announces "speech balloon" inside an
// accessible name, so strip pictographic characters (and any variation
// selector or zero-width joiner holding them together) wherever a display
// string is reused as an aria-label.
export function accessibleName(s: string): string {
  return s.replace(/[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu, '').trim();
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

// Short published date for a weekly item, e.g. "Thu, Jul 24" — the weekday
// anchors *when* a story happened across the coverage range. Derived from the
// date portion only (anchored to noon) so a UTC offset can't drift the day.
function formatItemDate(iso: string): string {
  const d = new Date(iso.slice(0, 10) + 'T12:00:00');
  const dow = DOW[d.getDay()][0] + DOW[d.getDay()].slice(1, 3).toLowerCase(); // "Thu"
  return dow + ', ' + MON_SHORT[d.getMonth()] + ' ' + d.getDate();
}

// Weekly keeps its existing shape: `description` renders as-is, and `summary`
// is surfaced only for grouped items — a weekly item that clusters a multi-day
// sequence (carries a `thread`) — as a separate arc-narration line. Daily is
// different: its `summary` is now the fuller, better-written line, so daily
// prefers `summary` over `description` for the one description slot instead of
// rendering both. `isWeekly` also gates the published-date label, since weekly
// items span the coverage range rather than sharing one masthead date.
function mapItem(it: RawArticle, isWeekly = false): Article {
  const isGroup = isWeekly && Array.isArray(it.thread) && it.thread.length > 0;
  const description = isWeekly ? (it.description ?? '') : (it.summary ?? it.description ?? '');
  return {
    title: it.title,
    description,
    url: it.url,
    image: it.image?.url,
    alt: it.image?.alt ?? '',
    logo: it.logo,
    source: it.source,
    topic: topicLabel(it.topic),
    summary: isGroup ? it.summary : undefined,
    dateLabel: isWeekly && it.published_at ? formatItemDate(it.published_at) : undefined,
    uid: it.uid,
    questions: it.questions,
  };
}

// Human "Until…" label for an alert's expiry. The wall-clock time is read
// straight from the ISO string (not via Date/TZ) so it always shows the metro's
// stated local time — matching the NWS product — regardless of the viewer's TZ.
// The end date is appended only when it differs from the digest's own date, so
// a same-day alert reads "Until 7:00 PM" and a multi-day one names the day.
function formatAlertEnds(endsIso: string, refDateIso: string): string {
  const datePart = endsIso.slice(0, 10);
  const [h, m] = endsIso.slice(11, 16).split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const time = `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  if (datePart === refDateIso) return `Until ${time}`;
  const d = new Date(datePart + 'T12:00:00');
  const dow = DOW[d.getDay()][0] + DOW[d.getDay()].slice(1, 3).toLowerCase();
  return `Until ${dow}, ${MON_SHORT[d.getMonth()]} ${d.getDate()}, ${time}`;
}

function mapAlert(a: RawAlert, refDateIso: string): Alert {
  return {
    event: a.event,
    area: a.area,
    endsLabel: a.ends ? formatAlertEnds(a.ends, refDateIso) : undefined,
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
    alerts: (raw.weather_alert ?? []).map((a) => mapAlert(a, raw.date)),
    areOk: raw.are_you_ok.map((it) => mapItem(it)),
    starters: raw.conversation_starters.map((it) => mapItem(it)),
    know: raw.you_should_know.map((it) => mapItem(it)),
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
    alerts: [], // weekly has no weather surface (see digest.schema.json WeeklyDigest)
    areOk: raw.are_you_ok.map((it) => mapItem(it, true)),
    starters: raw.conversation_starters.map((it) => mapItem(it, true)),
    know: raw.you_should_know.map((it) => mapItem(it, true)),
    sports: raw.sports,
  };
}
