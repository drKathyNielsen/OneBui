import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAppearance } from './hooks/useAppearance';
import { metrosPromise, type Metro } from './data/digests';
import type { Period } from './types';
import { toCityViewModel, toWeeklyViewModel } from './utils/format';
import { parseViewParams, resolveViewParams, toSearch } from './utils/viewParams';
import TopNavBar from './components/TopNavBar';
import CitySideBar from './components/CitySideBar';
import NewsDigest from './components/NewsDigest';
import About from './components/About';
import Footer from './components/Footer';

// The About page is a static view outside the metro/date model, so it rides on
// its own `?view=about` param rather than through resolveViewParams.
function readIsAbout() {
  return new URLSearchParams(window.location.search).get('view') === 'about';
}

export default function App() {
  const { style, theme, setStyle, setTheme } = useAppearance();
  // Ingestion is lazy, so the manifest resolves asynchronously; null = loading.
  const [metros, setMetros] = useState<Metro[] | null>(null);
  const [metroIdx, setMetroIdx] = useState(0);
  const [period, setPeriod] = useState<Period>('daily');
  const [date, setDate] = useState('');
  // Static About view, tracked independently of the metro/date manifest so it
  // works even before the digests resolve.
  const [isAbout, setIsAbout] = useState(readIsAbout);

  // Initialize view state from the URL once the manifest resolves (slugs/dates
  // can only be validated against the loaded metros); canonicalize if corrected.
  useEffect(() => {
    metrosPromise.then((m) => {
      setMetros(m);
      if (m.length === 0) return;
      const resolved = resolveViewParams(parseViewParams(window.location.search), m);
      setMetroIdx(resolved.metroIdx);
      setPeriod(resolved.period);
      setDate(resolved.date);
      // Seed the digest state above (so Back from About lands somewhere valid),
      // but don't rewrite the URL while the About view owns it.
      if (resolved.changed && !readIsAbout()) window.history.replaceState(null, '', toSearch(resolved, m));
    });
  }, []);

  // Apply a selection to state and push it to the URL (a navigable history step).
  const navigate = useCallback(
    (next: { metroIdx: number; period: Period; date: string }) => {
      if (!metros) return;
      setMetroIdx(next.metroIdx);
      setPeriod(next.period);
      setDate(next.date);
      window.history.pushState(null, '', toSearch(next, metros));
    },
    [metros]
  );

  // Back/Forward: re-read the URL into state without writing back.
  useEffect(() => {
    if (!metros) return;
    function onPop() {
      const resolved = resolveViewParams(parseViewParams(window.location.search), metros!);
      setMetroIdx(resolved.metroIdx);
      setPeriod(resolved.period);
      setDate(resolved.date);
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [metros]);

  // Keep the About flag in sync on Back/Forward, independent of the manifest.
  useEffect(() => {
    function onPop() { setIsAbout(readIsAbout()); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  function openAbout() {
    window.history.pushState(null, '', '?view=about');
    setIsAbout(true);
  }
  function closeAbout() {
    // Return to the current digest URL (or a bare path if none resolved yet).
    const target = metros ? toSearch({ metroIdx, period, date }, metros) : window.location.pathname;
    window.history.pushState(null, '', target);
    setIsAbout(false);
  }

  const metro = metros?.[metroIdx];

  // Switching metros clamps the day to the new metro's newest (coverage differs)
  // and falls back to Daily if the new metro has no weekly aggregate.
  function selectMetro(idx: number) {
    const next = metros?.[idx];
    if (!next) return;
    navigate({ metroIdx: idx, period: next.weekly ? period : 'daily', date: next.days[0].date });
  }

  // Period toggle keeps the metro and selected day; day chips (daily-only) set the day.
  const changePeriod = (p: Period) => navigate({ metroIdx, period: p, date });
  const selectDay = (iso: string) => navigate({ metroIdx, period: 'daily', date: iso });

  const day = metro?.days.find((d) => d.date === date) ?? metro?.days[0];

  const vm = useMemo(() => {
    if (!metro || !day) return null;
    return period === 'weekly' && metro.weekly ? toWeeklyViewModel(metro.weekly) : toCityViewModel(day.data);
  }, [metro, day, period]);

  if (isAbout) {
    return (
      <div className="oneb-root" data-style={style} data-theme={theme}>
        <TopNavBar style={style} theme={theme} onStyleChange={setStyle} onThemeChange={setTheme} />
        <About onBack={closeAbout} />
        <Footer onAbout={openAbout} />
      </div>
    );
  }

  if (!metros) {
    return (
      <div className="oneb-root" data-style={style} data-theme={theme}>
        <p className="oneb-loading" role="status">Loading digests…</p>
      </div>
    );
  }

  if (!metro || !day || !vm) {
    return <div className="oneb-root" data-style={style} data-theme={theme}>No digests available.</div>;
  }

  return (
    <div className="oneb-root" data-style={style} data-theme={theme}>
      <TopNavBar style={style} theme={theme} onStyleChange={setStyle} onThemeChange={setTheme} />
      <div className="oneb-shell">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 oneb-sidebar-col">
              <CitySideBar metros={metros} metroIdx={metroIdx} onSelect={selectMetro} />
            </div>
            <div className="col-12 col-md-9 col-lg-10 oneb-content-col">
              <NewsDigest
                vm={vm}
                days={metro.days}
                hasWeekly={metro.weekly !== null}
                period={period}
                selectedDate={day.date}
                style={style}
                onPeriodChange={changePeriod}
                onDaySelect={selectDay}
              />
            </div>
          </div>
        </div>
      </div>
      <Footer onAbout={openAbout} />
    </div>
  );
}
