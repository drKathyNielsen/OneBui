import type { RawCity } from '../types';

interface Props {
  cities: RawCity[];
  cityIdx: number;
  onSelect: (idx: number) => void;
}

// Renders twice via CSS: a vertical "Your selections" column on tablet/desktop,
// a horizontally-scrollable chip rail on phone. Same data and behavior either way.
export default function CitySideBar({ cities, cityIdx, onSelect }: Props) {
  return (
    <>
      <nav className="oneb-sidebar d-none d-md-block" aria-label="Your selections">
        <h2 className="oneb-sidebar-heading">Your selections</h2>
        <div className="oneb-sidebar-list">
          {cities.map((c, i) => (
            <button
              key={c.shortName}
              type="button"
              className={`oneb-sidebar-item${i === cityIdx ? ' oneb-sidebar-item--active' : ''}`}
              aria-current={i === cityIdx ? 'true' : undefined}
              onClick={() => onSelect(i)}
            >
              {c.shortName}
            </button>
          ))}
        </div>
        <button type="button" className="oneb-sidebar-add" disabled title="Coming soon">+ Add a metro</button>
      </nav>

      <nav className="oneb-city-rail d-md-none" aria-label="Your selections">
        {cities.map((c, i) => (
          <button
            key={c.shortName}
            type="button"
            className={`oneb-city-chip${i === cityIdx ? ' oneb-city-chip--active' : ''}`}
            aria-current={i === cityIdx ? 'true' : undefined}
            onClick={() => onSelect(i)}
          >
            {c.shortName}
          </button>
        ))}
        <button type="button" className="oneb-city-chip oneb-city-chip--add" disabled title="Coming soon">+ Add</button>
      </nav>
    </>
  );
}
