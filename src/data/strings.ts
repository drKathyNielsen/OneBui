import type { Style } from '../types';

// Per-style microcopy for recurring UI labels. Real article/city content is
// never forked here — only the small set of section/nav labels whose tone
// should match each visual style's voice. App brand name ("One B") is fixed
// and does NOT vary by style. classic and modern keep the app's existing
// literals verbatim; only friendly restyles the labels.

// Visible text for a section pager's two controls. The accessible names are
// built from the section heading, so these stay short.
export interface PagerStrings {
  prev: string;
  next: string;
}

export interface StyleStrings {
  weatherHeading: string;
  areOkEyebrow: string;
  startersHeading: string;
  knowHeading: string;
  sportsHeading: string;
  weeklyLabel: string;
  pager: PagerStrings; // section pager controls (see components/Pager)
  questionsLabel: string; // labels an article's conversational openers as a group
  // One line under a section heading saying what the section is for. Shown
  // whether or not the section has items, so the purpose reads even on an
  // empty week.
  startersBlurb: string;
  knowBlurb: string;
  // Shown in place of items when a section has nothing this period. Every
  // section always renders its header; these fill the body so the absence is
  // stated rather than left as a silent gap.
  emptyAreOk: string;
  emptyStarters: string;
  emptyKnow: string;
  emptySports: string;
}

const NEUTRAL: StyleStrings = {
  weatherHeading: 'Weather alert',
  areOkEyebrow: 'Top story',
  startersHeading: 'Conversation starters',
  knowHeading: 'You should know',
  sportsHeading: 'Sporting news',
  weeklyLabel: 'Last week',
  pager: { prev: 'Previous', next: 'Next' },
  questionsLabel: 'Ways to bring it up',
  startersBlurb: 'Local stories safe to start up a converstion.',
  knowBlurb: "Events going on their area, good context even if it doesn't come up.",
  emptyAreOk: 'No urgent local concerns to flag.',
  emptyStarters: 'No conversation starters this time.',
  emptyKnow: 'Nothing else to flag.',
  emptySports: 'No games to report.',
};

export const STYLE_STRINGS: Record<Style, StyleStrings> = {
  classic: NEUTRAL,
  modern: NEUTRAL,
  friendly: {
    weatherHeading: 'Weather alert ⛈️',
    areOkEyebrow: 'Heads up! ☀️',
    startersHeading: 'Chat starters 💬',
    knowHeading: 'You should know',
    sportsHeading: 'Your teams 🏆',
    weeklyLabel: 'Last week',
    pager: { prev: 'Back', next: 'More' },
    questionsLabel: 'Ways to bring it up 💬',
    startersBlurb: 'Little things to chat about.',
    knowBlurb: "Good to know about their area, even if it doesn't come up.",
    emptyAreOk: 'All clear — nothing urgent to flag. 😌',
    emptyStarters: 'No chat starters this time. 💬',
    emptyKnow: 'Nothing else to flag.',
    emptySports: 'No games to report. 🏆',
  },
};

export function getStrings(style: Style): StyleStrings {
  return STYLE_STRINGS[style];
}
