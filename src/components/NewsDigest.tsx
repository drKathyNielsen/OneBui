import { useMemo } from 'react';
import type { DigestViewModel, Period, Style } from '../types';
import type { MetroDay } from '../data/digests';
import { dayChipLabel } from '../utils/format';
import { getStrings } from '../data/strings';
import PeriodNav from './PeriodNav';
import WeatherAlert from './WeatherAlert';
import AreTheyOk from './AreTheyOk';
import ArticleList from './ArticleList';

interface Props {
  vm: DigestViewModel; // the day's brief or the weekly aggregate, already mapped
  days: MetroDay[]; // the metro's available days, newest first (Daily chips)
  hasWeekly: boolean; // whether the metro has a weekly aggregate to toggle to
  period: Period;
  selectedDate: string;
  style: Style; // drives per-style section/nav microcopy (see data/strings)
  onPeriodChange: (p: Period) => void;
  onDaySelect: (iso: string) => void;
}

// Renders the masthead + content for one metro. Layout is responsive via
// Bootstrap's grid: stacked on phone (<768px), hero-then-two-columns on
// tablet (>=768px), three columns side by side on desktop (>=992px).
export default function NewsDigest({ vm, days, hasWeekly, period, selectedDate, style, onPeriodChange, onDaySelect }: Props) {
  // The current calendar day (viewer-local) shows "Today" instead of its date.
  const dayOptions = useMemo(() => {
    const todayIso = new Date().toLocaleDateString('en-CA'); // yyyy-mm-dd
    return days.map((d) => ({ iso: d.date, label: d.date === todayIso ? 'Today' : dayChipLabel(d.date) }));
  }, [days]);
  const mastheadDate = vm.period === 'weekly' ? vm.rangeLabel : vm.dateLong;
  const strings = getStrings(style);

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
        weeklyLabel={strings.weeklyLabel}
        onPeriodChange={onPeriodChange}
        onDaySelect={onDaySelect}
      />

      <main className="container-fluid oneb-main">
        {vm.alerts.length > 0 && (
          <div className="row mb-4">
            <div className="col-12">
              <WeatherAlert alerts={vm.alerts} heading={strings.weatherHeading} />
            </div>
          </div>
        )}

        <div className="row mb-4">
          <div className="col-12">
            <AreTheyOk
              articles={vm.areOk}
              eyebrow={strings.areOkEyebrow}
              emptyNote={strings.emptyAreOk}
              pager={strings.pager}
              questionsLabel={strings.questionsLabel}
            />
          </div>
        </div>

        <div className="row gy-4">
          <div className="col-12 col-md-6">
            <ArticleList heading={strings.startersHeading} items={vm.starters} emptyNote={strings.emptyStarters} blurb={strings.startersBlurb} pager={strings.pager} questionsLabel={strings.questionsLabel} />
          </div>
          <div className="col-12 col-md-6 oneb-col-divider">
            <ArticleList heading={strings.knowHeading} items={vm.know} emptyNote={strings.emptyKnow} blurb={strings.knowBlurb} pager={strings.pager} questionsLabel={strings.questionsLabel} />
          </div>
        </div>

      </main>
    </div>
  );
}
