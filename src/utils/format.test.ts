import { describe, it, expect } from 'vitest';
import { toCityViewModel, accessibleName } from './format';
import type { RawArticle, RawCity } from '../types';

function article(over: Partial<RawArticle> = {}): RawArticle {
  return {
    title: 'A story',
    summary: 'A summary',
    source: 'Example News',
    topic: 'civic-events',
    url: 'https://example.test/a',
    published_at: '2026-08-20T12:00:00-05:00',
    image: null,
    uid: 'u1',
    ...over,
  };
}

function city(starters: RawArticle[]): RawCity {
  return {
    shortName: 'Somewhere, ZZ',
    metroCode: '11111',
    date: '2026-08-20',
    are_you_ok: [],
    conversation_starters: starters,
    you_should_know: [],
    sports: [],
    weather_alert: [],
  };
}

describe('mapItem questions', () => {
  it('carries the prompts through to the view model', () => {
    const questions = ['Did that affect your commute?', 'Have you been down there lately?'];
    const vm = toCityViewModel(city([article({ questions })]));
    expect(vm.starters[0].questions).toEqual(questions);
  });

  it('yields undefined when the raw article omits them', () => {
    const vm = toCityViewModel(city([article()]));
    expect(vm.starters[0].questions).toBeUndefined();
  });
});
describe('accessibleName', () => {
  it('strips decorative emoji from friendly-style headings', () => {
    expect(accessibleName('Chat starters 💬')).toBe('Chat starters');
    expect(accessibleName('Heads up! ☀️')).toBe('Heads up!');
    expect(accessibleName('Your teams 🏆')).toBe('Your teams');
  });

  it('leaves plain headings untouched', () => {
    expect(accessibleName('Conversation starters')).toBe('Conversation starters');
  });
});
