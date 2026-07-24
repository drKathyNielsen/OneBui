import { useEffect, useState } from 'react';
import type { Style, Theme } from '../types';

const STYLE_KEY = 'oneb.style';
const THEME_KEY = 'oneb.theme';

// Appearance (style + theme) persists independently in localStorage so users
// can mix classic/modern with light/dark freely, same as the design prototype.
export function useAppearance() {
  const [style, setStyle] = useState<Style>(() => (localStorage.getItem(STYLE_KEY) as Style) || 'classic');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) as Theme) || 'light');

  useEffect(() => { localStorage.setItem(STYLE_KEY, style); }, [style]);
  useEffect(() => { localStorage.setItem(THEME_KEY, theme); }, [theme]);

  return { style, theme, setStyle, setTheme };
}
