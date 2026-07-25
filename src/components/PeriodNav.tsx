import { useState } from 'react';

interface DayOption {
  iso: string;
  label: string;
}

interface Props {
  days: DayOption[]; // the metro's available days, newest first
  selectedIso: string;
  onDaySelect: (iso: string) => void;
}

// "Today" is the single newest-day view; "Weekly" reveals a chip row of the
// metro's actually-available days so the reader can page through real coverage.
export default function PeriodNav({ days, selectedIso, onDaySelect }: Props) {
  const [period, setPeriod] = useState<'today' | 'weekly'>('today');
  const newestIso = days[0]?.iso;

  return (
    <>
      <nav className="oneb-tabs" role="tablist" aria-label="Digest period">
        <button
          type="button"
          role="tab"
          aria-selected={period === 'today'}
          className={`oneb-tab${period === 'today' ? ' oneb-tab--active' : ''}`}
          onClick={() => { setPeriod('today'); if (newestIso) onDaySelect(newestIso); }}
        >
          Today
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={period === 'weekly'}
          className={`oneb-tab${period === 'weekly' ? ' oneb-tab--active' : ''}`}
          onClick={() => setPeriod('weekly')}
        >
          Weekly
        </button>
      </nav>
      {period === 'weekly' && (
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
