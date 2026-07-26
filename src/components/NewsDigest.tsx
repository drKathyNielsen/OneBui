import { useMemo } from 'react';
import type { DigestViewModel, Period } from '../types';
import type { MetroDay } from '../data/digests';
import { dayChipLabel } from '../utils/format';
import PeriodNav from './PeriodNav';
import AreTheyOk from './AreTheyOk';
import ArticleList from './ArticleList';
import Sports from './Sports';

interface Props {
  vm: DigestViewModel; // the day's brief or the weekly aggregate, already mapped
  days: MetroDay[]; // the metro's available days, newest first (Daily chips)
  hasWeekly: boolean; // whether the metro has a weekly aggregate to toggle to
  period: Period;
  selectedDate: string;
  onPeriodChange: (p: Period) => void;
  onDaySelect: (iso: string) => void;
}

// Renders the masthead + content for one metro. Layout is responsive via
// Bootstrap's grid: stacked on phone (<768px), hero-then-two-columns on
// tablet (>=768px), three columns side by side on desktop (>=992px).
export default function NewsDigest({ vm, days, hasWeekly, period, selectedDate, onPeriodChange, onDaySelect }: Props) {
  const dayOptions = useMemo(() => days.map((d) => ({ iso: d.date, label: dayChipLabel(d.date) })), [days]);
  const mastheadDate = vm.period === 'weekly' ? vm.rangeLabel : vm.dateLong;

  return (
    <div className="oneb-digest">
      <header className="oneb-masthead">
        <p className="oneb-kicker">Section 1B — Local brief</p>
        <h1 className="oneb-city-name">{vm.shortName}</h1>
        <p className="oneb-date">{mastheadDate}</p>
      </header>

      <PeriodNav
        period={period}
        hasWeekly={hasWeekly}
        days={dayOptions}
        selectedIso={selectedDate}
        onPeriodChange={onPeriodChange}
        onDaySelect={onDaySelect}
      />

      <main className="container-fluid oneb-main">
        {vm.areOk.map((article) => (
          <div className="row mb-4" key={article.url}>
            <div className="col-12">
              <AreTheyOk article={article} />
            </div>
          </div>
        ))}

        <div className="row gy-4">
          <div className="col-12 col-md-6">
            {vm.starters.length > 0 && <ArticleList heading="Conversation starters" items={vm.starters} />}
          </div>
          <div className="col-12 col-md-6 oneb-col-divider">
            {vm.know.length > 0 && <ArticleList heading="You should know" items={vm.know} />}
          </div>
        </div>

        {vm.sports.length > 0 && (
          <div className="row mt-4">
            <div className="col-12">
              <Sports sports={vm.sports} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
