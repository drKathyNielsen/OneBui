import { useState } from 'react';
import { useAppearance } from './hooks/useAppearance';
import { METROS } from './data/digests';
import TopNavBar from './components/TopNavBar';
import CitySideBar from './components/CitySideBar';
import NewsDigest from './components/NewsDigest';
import Footer from './components/Footer';

export default function App() {
  const { style, theme, setStyle, setTheme } = useAppearance();
  const [metroIdx, setMetroIdx] = useState(0);
  const metro = METROS[metroIdx];
  // Selected day; defaults to the current metro's newest available date.
  const [date, setDate] = useState(metro?.days[0]?.date ?? '');

  // Switching metros clamps the date to the new metro's newest day, since
  // coverage differs (some metros have fewer days than others).
  function selectMetro(idx: number) {
    setMetroIdx(idx);
    setDate(METROS[idx].days[0].date);
  }

  if (!metro) {
    return <div className="oneb-root" data-style={style} data-theme={theme}>No digests available.</div>;
  }

  const day = metro.days.find((d) => d.date === date) ?? metro.days[0];

  return (
    <div className="oneb-root" data-style={style} data-theme={theme}>
      <TopNavBar style={style} theme={theme} onStyleChange={setStyle} onThemeChange={setTheme} />
      <div className="oneb-shell">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 oneb-sidebar-col">
              <CitySideBar metros={METROS} metroIdx={metroIdx} onSelect={selectMetro} />
            </div>
            <div className="col-12 col-md-9 col-lg-10 oneb-content-col">
              <NewsDigest city={day.data} days={metro.days} selectedDate={day.date} onDaySelect={setDate} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
