import type { Style } from '../types';

// Per-style microcopy for recurring UI labels. Real article/city content is
// never forked here — only the small set of section/nav labels whose tone
// should match each visual style's voice. App brand name ("One B") is fixed
// and does NOT vary by style. classic and modern keep the app's existing
// literals verbatim; only friendly restyles the labels.
export interface StyleStrings {
  areOkEyebrow: string;
  startersHeading: string;
  knowHeading: string;
  sportsHeading: string;
  todayLabel: string;
  weeklyLabel: string;
}

const NEUTRAL: StyleStrings = {
  areOkEyebrow: 'Are they ok?',
  startersHeading: 'Conversation starters',
  knowHeading: 'You should know',
  sportsHeading: 'Sporting news',
  todayLabel: 'Today',
  weeklyLabel: 'Last week',
};

export const STYLE_STRINGS: Record<Style, StyleStrings> = {
  classic: NEUTRAL,
  modern: NEUTRAL,
  friendly: {
    areOkEyebrow: 'Heads up! ☀️',
    startersHeading: 'Chat starters 💬',
    knowHeading: 'You should know',
    sportsHeading: 'Your teams 🏆',
    todayLabel: 'Today',
    weeklyLabel: 'Last week',
  },
};

export function getStrings(style: Style): StyleStrings {
  return STYLE_STRINGS[style];
}
