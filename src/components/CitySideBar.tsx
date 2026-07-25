import type { Metro } from '../data/digests';

interface Props {
  metros: Metro[];
  metroIdx: number;
  onSelect: (idx: number) => void;
}

// Renders twice via CSS: a vertical "Your selections" column on tablet/desktop,
// a horizontally-scrollable chip rail on phone. Same data and behavior either way.
export default function CitySideBar({ metros, metroIdx, onSelect }: Props) {
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
        <button type="button" className="oneb-sidebar-add" disabled title="Coming soon">+ Add a metro</button>
      </nav>

      <nav className="oneb-city-rail d-md-none" aria-label="Your selections">
        {metros.map((m, i) => (
          <button
            key={m.slug}
            type="button"
            className={`oneb-city-chip${i === metroIdx ? ' oneb-city-chip--active' : ''}`}
            aria-current={i === metroIdx ? 'true' : undefined}
            onClick={() => onSelect(i)}
          >
            {m.shortName}
          </button>
        ))}
        <button type="button" className="oneb-city-chip oneb-city-chip--add" disabled title="Coming soon">+ Add</button>
      </nav>
    </>
  );
}
