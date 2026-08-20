import { describe, it, expect } from 'vitest';
import { selectA11yUrls, REQUIRED_SHAPES, type DigestDoc } from '../../src/data/a11yUrls';
import type { RawArticle, RawCity, RawWeekly } from '../../src/types';

function article(over: Partial<RawArticle> = {}): RawArticle {
  return {
    title: 'A story',
    summary: '',
    source: 'Example News',
    topic: 'other',
    url: 'https://example.test/a',
    published_at: '2026-08-20T12:00:00-05:00',
    image: { url: 'https://example.test/a.jpg', alt: '' },
    uid: 'u1',
    ...over,
  };
}

function city(over: Partial<RawCity> = {}): RawCity {
  return {
    shortName: 'Somewhere, ZZ',
    metroCode: '11111',
    date: '2026-08-20',
    are_you_ok: [],
    conversation_starters: [],
    you_should_know: [],
    sports: [],
    weather_alert: [],
    ...over,
  };
}

function weekly(over: Partial<RawWeekly> = {}): RawWeekly {
  return {
    period: 'weekly',
    shortName: 'Somewhere, ZZ',
    metroCode: '11111',
    range: { start: '2026-08-14', end: '2026-08-20' },
    are_you_ok: [],
    conversation_starters: [],
    you_should_know: [],
    sports: [],
    ...over,
  };
}

const alert = { event: 'Heat Advisory', area: '', severity: 'Moderate', summary: '', description: '', ends: null } as const;

function daily(tree: DigestDoc['tree'], slug: string, date: string, data: Partial<RawCity> = {}): DigestDoc {
  return { tree, slug, kind: 'daily', date, data: city({ date, ...data }) };
}

function week(tree: DigestDoc['tree'], slug: string, data: Partial<RawWeekly> = {}): DigestDoc {
  return { tree, slug, kind: 'weekly', date: null, data: weekly(data) };
}

// A fixture set that satisfies every required shape, mirroring digests-fixtures/.
function fixtureSet(): DigestDoc[] {
  return [
    daily('fixture', 'a11y-fixture', '2026-08-20', { weather_alert: [alert, alert, alert] }),
    daily('fixture', 'a11y-fixture', '2026-08-19'),
    daily('fixture', 'a11y-fixture', '2026-08-18', { you_should_know: [article({ image: null })] }),
    week('fixture', 'a11y-fixture', { conversation_starters: Array.from({ length: 15 }, () => article()) }),
  ];
}

describe('selectA11yUrls', () => {
  it('covers every required shape with a fixture URL', () => {
    const urls = selectA11yUrls(fixtureSet());
    for (const shape of REQUIRED_SHAPES) {
      const hit = urls.find((u) => u.shapes.includes(shape.id));
      expect(hit, `no URL covers ${shape.id}`).toBeDefined();
      expect(hit!.tier).toBe('fixture');
    }
  });

  it('gives every live metro its newest day and its weekly', () => {
    const urls = selectA11yUrls([
      ...fixtureSet(),
      daily('live', 'boulder-co', '2026-08-19'),
      daily('live', 'boulder-co', '2026-08-18'),
      week('live', 'boulder-co'),
      daily('live', 'san-antonio-tx', '2026-08-20'),
    ]);
    const live = urls.filter((u) => u.tier === 'live').map((u) => u.query);
    expect(live).toEqual([
      '?metro=boulder-co&period=daily&date=2026-08-19',
      '?metro=boulder-co&period=weekly',
      '?metro=san-antonio-tx&period=daily&date=2026-08-20',
    ]);
  });

  it('never emits a day outside the load window, which would canonicalize elsewhere', () => {
    const days = ['2026-08-20', '2026-08-19', '2026-08-18', '2026-08-17', '2026-08-16', '2026-08-15'];
    const urls = selectA11yUrls([...fixtureSet(), ...days.map((d) => daily('live', 'boulder-co', d))]);
    expect(urls.some((u) => u.query.includes('2026-08-15'))).toBe(false);
  });

  it('raises naming the shape when its fixture is missing', () => {
    const withoutAlerts = fixtureSet().filter((d) => d.date !== '2026-08-20');
    expect(() => selectA11yUrls(withoutAlerts)).toThrow(/stacked-weather-alerts/);
  });

  it('does not raise when live data happens to carry no alerts at all', () => {
    expect(() => selectA11yUrls([...fixtureSet(), daily('live', 'boulder-co', '2026-08-19')])).not.toThrow();
  });
});
