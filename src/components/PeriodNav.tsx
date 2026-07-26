import type { Period } from '../types';

interface DayOption {
  iso: string;
  label: string;
}

interface Props {
  period: Period;
  hasWeekly: boolean; // hide the Weekly toggle when the metro has no aggregate
  days: DayOption[]; // the metro's available days, newest first
  selectedIso: string;
  onPeriodChange: (p: Period) => void;
  onDaySelect: (iso: string) => void;
}

// "Today" is the daily view with a chip row of the metro's ≤4 available days;
// "Weekly" is the single editorial aggregate and shows no day chips. Toggling
// back to Daily restores the selected/newest day (the date is held upstream).
export default function PeriodNav({ period, hasWeekly, days, selectedIso, onPeriodChange, onDaySelect }: Props) {
  return (
    <>
      <nav className="oneb-tabs" role="tablist" aria-label="Digest period">
        <button
          type="button"
          role="tab"
          aria-selected={period === 'daily'}
          className={`oneb-tab${period === 'daily' ? ' oneb-tab--active' : ''}`}
          onClick={() => onPeriodChange('daily')}
        >
          Today
        </button>
        {hasWeekly && (
          <button
            type="button"
            role="tab"
            aria-selected={period === 'weekly'}
            className={`oneb-tab${period === 'weekly' ? ' oneb-tab--active' : ''}`}
            onClick={() => onPeriodChange('weekly')}
          >
            Weekly
          </button>
        )}
      </nav>
      {period === 'daily' && (
        <div className="oneb-day-chips" role="tablist" aria-label="Choose a day">
          {days.map((d) => (
            <button
              key={d.iso}
              type="button"
              role="tab"
              aria-selected={d.iso === selectedIso}
              className={`oneb-day-chip${d.iso === selectedIso ? ' oneb-day-chip--active' : ''}`}
              onClick={() => onDaySelect(d.iso)}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
