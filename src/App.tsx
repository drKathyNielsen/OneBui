import { useState } from 'react';
import { useAppearance } from './hooks/useAppearance';
import { RAW_CITIES } from './data/cities';
import TopNavBar from './components/TopNavBar';
import CitySideBar from './components/CitySideBar';
import NewsDigest from './components/NewsDigest';
import Footer from './components/Footer';

export default function App() {
  const { style, theme, setStyle, setTheme } = useAppearance();
  const [cityIdx, setCityIdx] = useState(1);

  return (
    <div className="oneb-root" data-style={style} data-theme={theme}>
      <TopNavBar style={style} theme={theme} onStyleChange={setStyle} onThemeChange={setTheme} />
      <div className="oneb-shell">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 oneb-sidebar-col">
              <CitySideBar cities={RAW_CITIES} cityIdx={cityIdx} onSelect={setCityIdx} />
            </div>
            <div className="col-12 col-md-9 col-lg-10 oneb-content-col">
              <NewsDigest city={RAW_CITIES[cityIdx]} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
