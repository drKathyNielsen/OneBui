## Context

`period-digests` centralized all view state in `App`: `metroIdx`, `period: 'daily' | 'weekly'`,
and the selected daily `date`, over an **async** manifest (`metrosPromise`) that resolves before
any metro can be indexed. Today that state is memory-only — a refresh resets to the first metro's
newest daily, and no view is linkable. This change lifts the same three values into the URL query
string. There is no router in the app and no reason to add one for three flat params.

## Goals / Non-Goals

**Goals:**
- Make metro + period + date a shareable, bookmarkable, refresh-safe URL.
- Support Back/Forward across selections.
- Keep `App` the single owner of the state; the URL is a mirror, not a second source of truth.
- Validate incoming params against the resolved manifest and canonicalize the URL.

**Non-Goals:**
- A routing library or path-based routes (`/minneapolis-mn/weekly`). Query params suffice.
- Persisting appearance (style/theme) or scroll position in the URL.
- Server-side rendering or pre-rendering of per-metro URLs.
- Cross-tab state sync beyond what the URL naturally gives.

## Decisions

- **Query params, slug-keyed: `?metro=<slug>&period=<daily|weekly>&date=<yyyy-mm-dd>`.**
  Slug over `metroCode` — it is the human-readable directory key already used as the React key,
  so URLs read as `?metro=minneapolis-mn`, not `?metro=33460`. `date` is present only in the daily
  view; the weekly view drops it (there is no day to select).
  *Alternative considered:* path segments via a router — rejected as overkill for three flat params.

- **`App` owns state; the URL is derived and re-derived.** Selection handlers update React state
  and then write the URL; `popstate` reads the URL back into state. One direction at a time avoids
  a write→popstate→write loop. State remains the render source; the URL is I/O at the edges.
  *Alternative considered:* URL as the sole source (`useSyncExternalStore` over `location`) —
  more churn given the async manifest and the existing state; deferred.

- **Initialization runs after the manifest resolves.** Slugs/dates can only be validated once
  `metrosPromise` has produced the metro list, so the URL is parsed inside the same resolution
  path that sets initial state — not on first mount.

- **Validate then canonicalize with `replaceState`.** Unknown metro → first metro; `weekly` with
  no aggregate → `daily`; `date` outside the ingested window → newest day. When any incoming value
  is corrected, rewrite the URL with `replaceState` so a shared bad link doesn't leave a mismatched
  address and doesn't add a spurious history entry.

- **`pushState` for user selections, `replaceState` for corrections.** A metro/period/day change is
  a navigable step (Back should undo it); a canonicalization is not.

- **A small pure helper (`viewParams.ts`) does parse/serialize/validate.** `parseViewParams(search)`
  → raw strings; `resolveViewParams(raw, metros)` → `{ metroIdx, period, date }` plus a `changed`
  flag for canonicalization; `toSearch(state, metros)` → the query string. Keeping it pure keeps
  `App` thin and the rules unit-testable without a DOM.

## Risks / Trade-offs

- [Risk] Write/read feedback loop (a state write triggers `popstate`, which writes again).
  → Mitigation: only `popstate` reads the URL; selection handlers only write. `popstate` is not
  fired by `push`/`replaceState`, so programmatic writes don't re-enter.
- [Risk] Parsing before the async manifest resolves would index an undefined metro.
  → Mitigation: parse/validate strictly inside the manifest-resolved path; the loading state already
  guards render until then.
- [Risk] A stale/shared link points at a dropped day or a removed weekly.
  → Mitigation: the validate-and-canonicalize step degrades gracefully and fixes the address.
- [Trade-off] Query params over pretty paths are slightly less elegant but need zero routing
  infrastructure and no dependency — proportionate to a three-field view.

## Open Questions

- None blocking. Whether to also encode appearance (style/theme) can be a later, separate change.
