import { useState } from 'react';
import type { Metro } from '../data/digests';

interface Props {
  metros: Metro[];
  metroIdx: number;
  onSelect: (idx: number) => void;
}

// Renders twice via CSS: a vertical "Your selections" column on tablet/desktop,
// a compact dropdown on phone (scales past a handful of cities without a scroll
// rail). Same data and behavior either way.
export default function CitySideBar({ metros, metroIdx, onSelect }: Props) {
  const [cityOpen, setCityOpen] = useState(false);
  const current = metros[metroIdx];
  return (
    <>
      <nav className="oneb-sidebar d-none d-md-block" aria-label="Your selections">
        <h2 className="oneb-sidebar-heading">Your selections</h2>
        <div className="oneb-sidebar-list">
          {metros.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              className={`oneb-sidebar-item${i === metroIdx ? ' oneb-sidebar-item--active' : ''}`}
              aria-current={i === metroIdx ? 'true' : undefined}
              onClick={() => onSelect(i)}
            >
              {m.shortName}
            </button>
          ))}
        </div>
        <button type="button" className="oneb-sidebar-add" disabled title="Coming soon">+ Add cities</button>
      </nav>

      <nav className="oneb-city-rail d-md-none" aria-label="Your selections">
        <div className="oneb-city-select">
          <button
            type="button"
            className="oneb-city-select-trigger"
            aria-haspopup="menu"
            aria-expanded={cityOpen}
            aria-label={`Selected city: ${current.shortName}. Click to choose.`}
            onClick={() => setCityOpen((v) => !v)}
          >
            <span>{current.shortName}</span>
            <span aria-hidden="true">▾</span>
          </button>
          {cityOpen && (
            <ul className="oneb-city-menu" role="menu" aria-label="Your selections">
              {metros.map((m, i) => (
                <li role="none" key={m.slug}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={i === metroIdx}
                    className={`oneb-city-menu-item${i === metroIdx ? ' oneb-city-menu-item--active' : ''}`}
                    onClick={() => { onSelect(i); setCityOpen(false); }}
                  >
                    {m.shortName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>
    </>
  );
}
