import { useAppearance } from './hooks/useAppearance';
import { RAW_CITIES } from './data/cities';
import NewsDigest from './components/NewsDigest';

export default function App() {
  const { style, theme, setStyle, setTheme } = useAppearance();
  return (
    <NewsDigest
      cities={RAW_CITIES}
      style={style}
      theme={theme}
      onStyleChange={setStyle}
      onThemeChange={setTheme}
    />
  );
}
