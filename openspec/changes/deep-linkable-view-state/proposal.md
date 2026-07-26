## Why

The metro, period, and selected day are held only in React state, so a view can't
be linked, bookmarked, or restored after a refresh — and the browser Back button
doesn't step through selections. Readers can't share "my city's brief for this week."
Encoding the view in the URL query string makes every view a first-class, shareable
address.

## What Changes

- Sync three pieces of view state into the URL query string:
  - `metro` — the metro **slug** (e.g. `minneapolis-mn`), the human-readable directory key
  - `period` — `daily` | `weekly`
  - `date` — the selected daily date (`yyyy-mm-dd`); omitted/ignored in the weekly view
- On load, initialize state from the URL (after the async manifest resolves, so slugs can be mapped).
- On selection, write the URL with the History API (no full reload).
- Support Back/Forward via a `popstate` listener that re-reads the URL into state.
- **Validate and canonicalize**: unknown/missing `metro` falls back to the first metro;
  `period=weekly` on a metro with no weekly aggregate falls back to `daily`; a `date` not in
  the ingested window falls back to the newest day. Canonicalize the URL with `replaceState`
  (no extra history entry) when the incoming params are corrected.
- No routing library: `URLSearchParams` + `history.pushState`/`replaceState` + `popstate`, in `App`.

## Capabilities

### New Capabilities
- `view-state-url`: The selected metro, period, and day are reflected in and driven by the URL query string, making views shareable, bookmarkable, refresh-safe, and navigable with Back/Forward.

### Modified Capabilities
<!-- None: this adds a new capability layered on the existing App state. The
     `digest-data` capability (period-digests) is unchanged. -->

## Impact

- `src/App.tsx` — the single owner of `metroIdx`/`period`/`date`; reads them from and writes them to the URL.
- New small helper (e.g. `src/utils/viewParams.ts`) to parse/serialize/validate the query params against the resolved manifest.
- Depends on `period-digests` (async manifest, `period: 'daily' | 'weekly'`, `metro.weekly` nullability). No new runtime dependencies; no changes to the digest files or contracts.
