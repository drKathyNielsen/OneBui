import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
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

// The About page is the home view — where you land on a first hit — and it needs
// no query string: home is simply the absence of a `metro` selection. A `?metro=…`
// URL is a digest deep link; anything else (a bare URL) is home.
function readIsHome() {
  return !new URLSearchParams(window.location.search).has('metro');
}

export default function App() {
  const { style, theme, setStyle, setTheme } = useAppearance();
  // Ingestion is lazy, so the manifest resolves asynchronously; null = loading.
  const [metros, setMetros] = useState<Metro[] | null>(null);
  const [metroIdx, setMetroIdx] = useState(0);
  const [period, setPeriod] = useState<Period>('daily');
  const [date, setDate] = useState('');
  // Home (About) view, tracked independently of the metro/date manifest so it
  // works even before the digests resolve. Defaults on for a first-hit URL.
  const [isHome, setIsHome] = useState(readIsHome);

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
      // Seed the digest state above (so leaving Home lands somewhere valid),
      // but don't rewrite the URL while the Home view owns it (keeps a bare
      // first-hit URL bare instead of canonicalizing it to a digest link).
      if (resolved.changed && !readIsHome()) window.history.replaceState(null, '', toSearch(resolved, m));
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

  // Keep the Home flag in sync on Back/Forward, independent of the manifest.
  useEffect(() => {
    function onPop() { setIsHome(readIsHome()); }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Go to the home (About) view — from the brand click or the footer link.
  // Home carries no query string: navigate to the bare path.
  function goHome() {
    if (!isHome) window.history.pushState(null, '', window.location.pathname);
    setIsHome(true);
  }

  const metro = metros?.[metroIdx];

  // Switching metros clamps the day to the new metro's newest (coverage differs)
  // and falls back to Daily if the new metro has no weekly aggregate.
  function selectMetro(idx: number) {
    const next = metros?.[idx];
    if (!next) return;
    setIsHome(false); // picking a city from the sidebar leaves the home view
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

  // Both views share one shell: the city sidebar plus a content column. The
  // sidebar only appears once the manifest resolves; on Home no city is active.
  const sidebar = metros ? (
    <CitySideBar metros={metros} activeIdx={isHome ? null : metroIdx} onSelect={selectMetro} />
  ) : null;

  const frame = (content: ReactNode) => (
    <div className="oneb-root" data-style={style} data-theme={theme}>
      <TopNavBar style={style} theme={theme} onStyleChange={setStyle} onThemeChange={setTheme} onHome={goHome} />
      <div className="oneb-shell">
        <div className="container-fluid">
          <div className="row">
            <div className="col-12 col-md-3 col-lg-2 oneb-sidebar-col">{sidebar}</div>
            <div className="col-12 col-md-9 col-lg-10 oneb-content-col">{content}</div>
          </div>
        </div>
      </div>
      <Footer onAbout={goHome} />
    </div>
  );

  // Home renders even before the manifest (and without a selected digest).
  if (isHome) return frame(<About />);

  if (!metros) return frame(<p className="oneb-loading" role="status">Loading digests…</p>);

  if (!metro || !day || !vm) return frame(<p>No digests available.</p>);

  return frame(
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
  );
}
