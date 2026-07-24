import { useMemo, useState } from 'react';
import type { RawCity, Style, Theme } from '../types';
import { toCityViewModel, formatDate } from '../utils/format';
import AppearanceToggle from './AppearanceToggle';
import CityPicker from './CityPicker';
import AreTheyOk from './AreTheyOk';
import ArticleList from './ArticleList';
import Sports from './Sports';

interface Props {
  cities: RawCity[];
  style: Style;
  theme: Theme;
  onStyleChange: (s: Style) => void;
  onThemeChange: (t: Theme) => void;
}

// Renders the full masthead + content. Layout is responsive via Bootstrap's
// grid: stacked on phone (<768px), hero-then-two-columns on tablet (>=768px),
// three columns side by side on desktop (>=992px).
export default function NewsDigest({ cities, style, theme, onStyleChange, onThemeChange }: Props) {
  const [cityIdx, setCityIdx] = useState(1);
  const raw = cities[cityIdx];
  const city = useMemo(() => toCityViewModel(raw, style), [raw, style]);
  const dates = formatDate(raw.date);

  return (
    <div className="oneb-root" data-style={style} data-theme={theme}>
      <div className="oneb-shell">
        <header className="oneb-header">
          <AppearanceToggle style={style} theme={theme} onStyleChange={onStyleChange} onThemeChange={onThemeChange} />
          <div className="oneb-masthead">
            <span className="oneb-badge">One B</span>
            <p className="oneb-kicker">Section 1B — Local brief</p>
            <CityPicker cities={cities} cityIdx={cityIdx} onSelect={setCityIdx} displayName={city.shortName} />
            <p className="oneb-date">{dates.long}</p>
          </div>
          <nav className="oneb-tabs" role="tablist" aria-label="Digest period">
            <button type="button" role="tab" aria-selected="true" className="oneb-tab oneb-tab--active">
              Today
            </button>
            <button type="button" role="tab" aria-selected="false" aria-disabled="true" disabled className="oneb-tab" title="Coming soon">
              Weekly <span className="oneb-tab-soon">(soon)</span>
            </button>
          </nav>
        </header>

        <main className="container-fluid oneb-main">
          <div className="row gy-4">
            <div className="col-12 col-lg-5">
              {city.hasAreOk && city.areOk && <AreTheyOk article={city.areOk} style={style} />}
            </div>
            <div className="col-12 col-md-6 col-lg-4 oneb-col-divider">
              {city.hasStarters && <ArticleList heading="Conversation starters" items={city.starters} variant="numbered" />}
            </div>
            <div className="col-12 col-md-6 col-lg-3 oneb-col-divider">
              {city.hasKnow && <ArticleList heading="You should know" items={city.know} variant="bulleted" />}
              {city.hasSports && <Sports sports={city.sports} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
