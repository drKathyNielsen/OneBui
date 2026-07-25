import { useState } from 'react';
import { getWeekDays } from '../utils/format';

interface Props {
  dateIso: string;
  onDaySelect?: (iso: string) => void;
}

// "Today" is the single-day view; "Weekly" reveals a day-chip row so the reader
// can page through the metro's last 7 days of coverage.
export default function PeriodNav({ dateIso, onDaySelect }: Props) {
  const [period, setPeriod] = useState<'today' | 'weekly'>('today');
  const [selectedIso, setSelectedIso] = useState(dateIso);
  const days = getWeekDays(dateIso);

  return (
    <>
      <nav className="oneb-tabs" role="tablist" aria-label="Digest period">
        <button type="button" role="tab" aria-selected={period === 'today'} className={`oneb-tab${period === 'today' ? ' oneb-tab--active' : ''}`} onClick={() => setPeriod('today')}>
          Today
        </button>
        <button type="button" role="tab" aria-selected={period === 'weekly'} className={`oneb-tab${period === 'weekly' ? ' oneb-tab--active' : ''}`} onClick={() => setPeriod('weekly')}>
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
              onClick={() => { setSelectedIso(d.iso); onDaySelect?.(d.iso); }}
            >
              {d.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
