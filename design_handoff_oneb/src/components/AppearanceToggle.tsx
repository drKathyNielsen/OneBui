import type { Style, Theme } from '../types';

interface Props {
  style: Style;
  theme: Theme;
  onStyleChange: (s: Style) => void;
  onThemeChange: (t: Theme) => void;
}

export default function AppearanceToggle({ style, theme, onStyleChange, onThemeChange }: Props) {
  return (
    <div className="oneb-appearance-bar">
      <div className="btn-group oneb-seg" role="group" aria-label="Reading style">
        <button
          type="button"
          className="oneb-seg-btn"
          aria-pressed={style === 'classic'}
          onClick={() => onStyleChange('classic')}
        >
          Classic
        </button>
        <button
          type="button"
          className="oneb-seg-btn"
          aria-pressed={style === 'modern'}
          onClick={() => onStyleChange('modern')}
        >
          Modern
        </button>
      </div>
      <div className="btn-group oneb-seg" role="group" aria-label="Color theme">
        <button
          type="button"
          className="oneb-seg-btn"
          aria-pressed={theme === 'light'}
          aria-label="Light theme"
          onClick={() => onThemeChange('light')}
        >
          <span aria-hidden="true">☀</span>
        </button>
        <button
          type="button"
          className="oneb-seg-btn"
          aria-pressed={theme === 'dark'}
          aria-label="Dark theme"
          onClick={() => onThemeChange('dark')}
        >
          <span aria-hidden="true">☾</span>
        </button>
      </div>
    </div>
  );
}
