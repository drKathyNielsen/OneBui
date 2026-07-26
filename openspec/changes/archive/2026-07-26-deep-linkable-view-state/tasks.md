## 1. View-params helper (pure)

- [x] 1.1 Add `src/utils/viewParams.ts` with `parseViewParams(search: string)` → raw `{ metro?, period?, date? }` strings from a query string
- [x] 1.2 Add `resolveViewParams(raw, metros)` → `{ metroIdx, period, date, changed }`: map slug→index (fallback first), clamp `period` to `daily` when the metro has no weekly, clamp `date` to the newest ingested day when absent/out-of-window, and set `changed` when any value was corrected
- [x] 1.3 Add `toSearch({ metroIdx, period, date }, metros)` → canonical query string (`metro=<slug>&period=<p>`, plus `date=<iso>` only when `period === 'daily'`)

## 2. Wire App to the URL

- [x] 2.1 On manifest resolve, initialize `metroIdx`/`period`/`date` via `resolveViewParams(parseViewParams(location.search), metros)`; if `changed`, `history.replaceState` to `toSearch(...)`
- [x] 2.2 After each selection (metro/period/day), `history.pushState` to the new `toSearch(...)`; keep React state the render source
- [x] 2.3 Add a `popstate` listener that re-reads the URL into state (parse + resolve, no write-back); remove it on unmount
- [x] 2.4 Ensure metro-switch still clamps day to newest and falls back to daily when the new metro has no weekly, and that the URL reflects the clamped result

## 3. Verify

- [x] 3.1 `npm run build` (Node 20) passes typecheck
- [x] 3.2 Loading a share link (`?metro=…&period=weekly`) restores the exact view; a daily link restores metro + day
- [x] 3.3 Selecting metro/period/day updates the URL without reload; Back/Forward step through selections
- [x] 3.4 Invalid params degrade: unknown metro → first metro; weekly-without-aggregate → daily; out-of-window date → newest day; URL is canonicalized via replaceState (no extra history entry)
