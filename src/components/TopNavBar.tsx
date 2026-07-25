import { useState } from 'react';
import type { Style, Theme } from '../types';

interface Props {
  style: Style;
  theme: Theme;
  onStyleChange: (s: Style) => void;
  onThemeChange: (t: Theme) => void;
}

// Persistent utility bar: app-wide controls that apply no matter which metro
// is selected (appearance, account, add-cities) -- kept out of the digest
// masthead so the editorial identity there stays uncluttered.
export default function TopNavBar({ style, theme, onStyleChange, onThemeChange }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="oneb-topnav">
      <span className="oneb-topnav-brand">One B</span>
      <div className="oneb-topnav-right">
        <button
          type="button"
          className="oneb-pill-btn"
          onClick={() => onStyleChange(style === 'classic' ? 'modern' : 'classic')}
          aria-label={`Reading style: ${style}. Click to switch.`}
        >
          {style === 'classic' ? 'Classic' : 'Modern'}
        </button>
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
