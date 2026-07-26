import { useMemo } from 'react';
import type { RawCity } from '../types';
import type { MetroDay } from '../data/digests';
import { toCityViewModel, dayChipLabel } from '../utils/format';
import PeriodNav from './PeriodNav';
import AreTheyOk from './AreTheyOk';
import ArticleList from './ArticleList';
import Sports from './Sports';

interface Props {
  city: RawCity;
  days: MetroDay[]; // the metro's available days, newest first
  selectedDate: string;
  onDaySelect: (iso: string) => void;
}

// Renders the masthead + content for one metro. Layout is responsive via
// Bootstrap's grid: stacked on phone (<768px), hero-then-two-columns on
// tablet (>=768px), three columns side by side on desktop (>=992px).
export default function NewsDigest({ city: raw, days, selectedDate, onDaySelect }: Props) {
  const city = useMemo(() => toCityViewModel(raw), [raw]);
  const dayOptions = useMemo(() => days.map((d) => ({ iso: d.date, label: dayChipLabel(d.date) })), [days]);

  return (
    <div className="oneb-digest">
      <header className="oneb-masthead">
        <p className="oneb-kicker">Section 1B — Local brief</p>
        <h1 className="oneb-city-name">{city.shortName}</h1>
        <p className="oneb-date">{city.dateLong}</p>
      </header>

      <PeriodNav days={dayOptions} selectedIso={selectedDate} onDaySelect={onDaySelect} />

      <main className="container-fluid oneb-main">
        {city.hasAreOk && city.areOk && (
          <div className="row mb-4">
            <div className="col-12">
              <AreTheyOk article={city.areOk} />
            </div>
          </div>
        )}

        <div className="row gy-4">
          <div className="col-12 col-md-6">
            {city.hasStarters && <ArticleList heading="Conversation starters" items={city.starters} />}
          </div>
          <div className="col-12 col-md-6 oneb-col-divider">
            {city.hasKnow && <ArticleList heading="You should know" items={city.know} />}
          </div>
        </div>

        {city.hasSports && (
          <div className="row mt-4">
            <div className="col-12">
              <Sports sports={city.sports} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
