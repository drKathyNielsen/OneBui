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
  // Shown in place of items when a section has nothing this period. Every
  // section always renders its header; these fill the body so the absence is
  // stated rather than left as a silent gap.
  emptyAreOk: string;
  emptyStarters: string;
  emptyKnow: string;
  emptySports: string;
}

const NEUTRAL: StyleStrings = {
  areOkEyebrow: 'Are they ok?',
  startersHeading: 'Conversation starters',
  knowHeading: 'You should know',
  sportsHeading: 'Sporting news',
  todayLabel: 'Today',
  weeklyLabel: 'Last week',
  emptyAreOk: 'No urgent local concerns to flag.',
  emptyStarters: 'No conversation starters this time.',
  emptyKnow: 'Nothing else to flag.',
  emptySports: 'No games to report.',
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
    emptyAreOk: 'All clear — nothing urgent to flag. 😌',
    emptyStarters: 'No chat starters this time. 💬',
    emptyKnow: 'Nothing else to flag.',
    emptySports: 'No games to report. 🏆',
  },
};

export function getStrings(style: Style): StyleStrings {
  return STYLE_STRINGS[style];
}
