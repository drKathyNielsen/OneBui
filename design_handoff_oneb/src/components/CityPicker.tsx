import { useRef, useState } from 'react';
import type { RawCity } from '../types';

interface Props {
  cities: RawCity[];
  cityIdx: number;
  onSelect: (idx: number) => void;
  displayName: string;
  headingSize?: 'sm' | 'md' | 'lg';
}

export default function CityPicker({ cities, cityIdx, onSelect, displayName, headingSize = 'md' }: Props) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);

  const close = () => {
    setOpen(false);
    btnRef.current?.focus();
  };

  return (
    <div className="oneb-city-picker">
      <button
        ref={btnRef}
        type="button"
        className={`oneb-city-btn oneb-city-btn--${headingSize}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="oneb-city-name">{displayName}</span>
        <span className="oneb-city-chevron" aria-hidden="true">▾</span>
      </button>
      {open && (
        <ul className="oneb-city-list" role="listbox" aria-label="Choose a metro area">
          {cities.map((c, i) => (
            <li key={c.shortName} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === cityIdx}
                className="oneb-city-option"
                onClick={() => {
                  onSelect(i);
                  close();
                }}
              >
                {i === cityIdx ? '✓ ' : ''}
                {c.shortName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
