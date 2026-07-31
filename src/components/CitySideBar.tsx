import { useState } from 'react';
import type { Metro } from '../data/digests';

interface Props {
  metros: Metro[];
  activeIdx: number | null; // selected metro, or null on the home/About view
  onSelect: (idx: number) => void;
}

// Renders twice via CSS: a vertical "Your Cities" column on tablet/desktop, a
// compact dropdown on phone (scales past a handful of cities without a scroll
// rail). Same data and behavior either way. On the home view no city is active
// (activeIdx null): nothing is highlighted and the phone trigger prompts.
export default function CitySideBar({ metros, activeIdx, onSelect }: Props) {
  const [cityOpen, setCityOpen] = useState(false);
  const current = activeIdx != null ? metros[activeIdx] : null;
  return (
    <>
      <nav className="oneb-sidebar d-none d-md-block" aria-label="Your Cities">
        <h2 className="oneb-section-heading oneb-sidebar-heading"><span className="oneb-section-heading-badge">Your Cities</span></h2>
        <div className="oneb-sidebar-list">
          {metros.map((m, i) => (
            <button
              key={m.slug}
              type="button"
              className={`oneb-sidebar-item${i === activeIdx ? ' oneb-sidebar-item--active' : ''}`}
              aria-current={i === activeIdx ? 'true' : undefined}
              onClick={() => onSelect(i)}
            >
              {m.shortName}
            </button>
          ))}
        </div>
        <button type="button" className="oneb-sidebar-add" disabled title="Coming soon">+ Add cities</button>
      </nav>

      <nav className="oneb-city-rail d-md-none" aria-label="Your Cities">
        <div className="oneb-city-select">
          <button
            type="button"
            className="oneb-city-select-trigger"
            aria-haspopup="menu"
            aria-expanded={cityOpen}
            aria-label={current ? `Selected city: ${current.shortName}. Click to choose.` : 'Choose a city.'}
            onClick={() => setCityOpen((v) => !v)}
          >
            <span>{current ? current.shortName : 'Choose a city'}</span>
            <span aria-hidden="true">▾</span>
          </button>
          {cityOpen && (
            <ul className="oneb-city-menu" role="menu" aria-label="Your Cities">
              {metros.map((m, i) => (
                <li role="none" key={m.slug}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={i === activeIdx}
                    className={`oneb-city-menu-item${i === activeIdx ? ' oneb-city-menu-item--active' : ''}`}
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
