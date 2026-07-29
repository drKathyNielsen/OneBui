import type { Period } from '../types';

interface DayOption {
  iso: string;
  label: string;
}

interface Props {
  period: Period;
  hasWeekly: boolean; // hide the Weekly tab when the metro has no aggregate
  days: DayOption[]; // the metro's available days, newest first
  selectedIso: string;
  weeklyLabel: string; // per-style label for the weekly tab
  onPeriodChange: (p: Period) => void;
  onDaySelect: (iso: string) => void;
}

// A single flat tab row: the weekly aggregate ("Last week") followed by one tab
// per available day. With only a handful of days there's no need for the old
// Today-tab-plus-day-chips submenu — every destination sits on one row.
export default function PeriodNav({ period, hasWeekly, days, selectedIso, weeklyLabel, onPeriodChange, onDaySelect }: Props) {
  return (
    <nav className="oneb-tabs" role="tablist" aria-label="Choose a brief">
      {hasWeekly && (
        <button
          type="button"
          role="tab"
          aria-selected={period === 'weekly'}
          className={`oneb-tab${period === 'weekly' ? ' oneb-tab--active' : ''}`}
          onClick={() => onPeriodChange('weekly')}
        >
          {weeklyLabel}
        </button>
      )}
      {days.map((d) => {
        const active = period === 'daily' && d.iso === selectedIso;
        return (
          <button
            key={d.iso}
            type="button"
            role="tab"
            aria-selected={active}
            className={`oneb-tab${active ? ' oneb-tab--active' : ''}`}
            onClick={() => onDaySelect(d.iso)}
          >
            {d.label}
          </button>
        );
      })}
    </nav>
  );
}
