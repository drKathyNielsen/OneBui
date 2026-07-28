import { useState } from 'react';
import type { Style, Theme } from '../types';

interface Props {
  style: Style;
  theme: Theme;
  onStyleChange: (s: Style) => void;
  onThemeChange: (t: Theme) => void;
  onHome: () => void; // brand click returns to the home (About) view
}

// Reading style now has three options, so it's a dropdown rather than a toggle.
const STYLES: Style[] = ['classic', 'modern', 'friendly'];
const STYLE_LABELS: Record<Style, string> = { classic: 'Classic', modern: 'Modern', friendly: 'Friendly' };

// Persistent utility bar: app-wide controls that apply no matter which metro
// is selected (appearance, account, add-cities) -- kept out of the digest
// masthead so the editorial identity there stays uncluttered.
export default function TopNavBar({ style, theme, onStyleChange, onThemeChange, onHome }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  return (
    <header className="oneb-topnav">
      <button type="button" className="oneb-topnav-brand" onClick={onHome} aria-label="One B — home">One B</button>
      <div className="oneb-topnav-right">
        <div className="oneb-topnav-menu-wrap">
          <button
            type="button"
            className="oneb-pill-btn"
            aria-haspopup="menu"
            aria-expanded={styleOpen}
            onClick={() => setStyleOpen((v) => !v)}
            aria-label={`Reading style: ${style}. Click to choose.`}
          >
            {STYLE_LABELS[style]} ▾
          </button>
          {styleOpen && (
            <ul className="oneb-topnav-menu" role="menu" aria-label="Reading style">
              {STYLES.map((s) => (
                <li role="none" key={s}>
                  <button
                    type="button"
                    role="menuitemradio"
                    aria-checked={s === style}
                    aria-label={STYLE_LABELS[s]}
                    className={`oneb-topnav-menu-item oneb-topnav-menu-item--choice${s === style ? ' oneb-topnav-menu-item--active' : ''}`}
                    onClick={() => { onStyleChange(s); setStyleOpen(false); }}
                  >
                    {STYLE_LABELS[s]}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="oneb-pill-btn"
          onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
          aria-label={`Color theme: ${theme}. Click to switch.`}
        >
          {theme === 'light' ? 'Light' : 'Dark'}
        </button>

        <div className="oneb-topnav-links d-none d-lg-flex">
          <button type="button" className="oneb-topnav-link" disabled title="Coming soon">Add cities</button>
          <button type="button" className="oneb-topnav-link" disabled title="Coming soon">Account</button>
        </div>

        <div className="oneb-topnav-menu-wrap d-lg-none">
          <button
            type="button"
            className="oneb-topnav-burger"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="More menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          {menuOpen && (
            <ul className="oneb-topnav-menu" role="menu">
              <li role="none"><button type="button" role="menuitem" className="oneb-topnav-menu-item" disabled title="Coming soon">Add cities</button></li>
              <li role="none"><button type="button" role="menuitem" className="oneb-topnav-menu-item" disabled title="Coming soon">Account</button></li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
