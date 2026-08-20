## Why

The digest generator now ships **complete ordered candidate sets** rather than
pre-trimmed lists. The updated contract states it outright: *"Render applies NO
per-appeal display count… the consuming UI owns how many of each a reader sees and
must bound them itself."* `are_you_ok` lost its `maxItems: 1`; weeklies carry up to
15 starters and 15 you-should-know items.

The UI is not holding up its end. `ArticleList` reveals 3 at a time through a one-way
"more" link with no way back, `AreTheyOk` renders **every** lead as a full-width hero
(six stacked heroes on the Boulder weekly), and `Sports` renders every team unbounded.

This matters beyond tidiness. The extra candidates exist to feed a future
person-centric model: the nav pivots from metros to people, and per-article thumbs
feedback learns each person's topic affinity, so two people in the same metro see
different stories. Deep candidates are the signal source. Burying them behind a
one-way reveal — or dumping all 15 at once — both starve it. Reaching a candidate and
being able to thumb it is the point.

Separately, articles now carry a `questions` array (2–3 conversational prompts) that
nothing renders.

The accessibility gate that must vouch for all of this cannot currently be trusted.
`.pa11yci` pins two San Antonio URLs to calendar dates (`2026-07-28`, `2026-07-29`)
whose digest files no longer exist. Those URLs canonicalize to the newest day and the
suite still reports `0 errors` — four of twelve checks silently duplicate another page.
The dates were never the point: commit `e0a9d1c` added them as a *3-alert fixture*, and
that stacked-alert coverage is now gone with nothing reporting its loss. Adding pager
states to cover makes a gate that quietly degrades a liability.

## What Changes

- Add a shared, bidirectional pagination control used by every digest section, with
  the full candidate set reachable in both directions.
- **BREAKING (UX):** replace `ArticleList`'s one-way `PAGE_SIZE = 3` reveal. The
  "More articles" / "More stories 👀" label is superseded by pager controls.
- Paginate `AreTheyOk`: page through leads one hero at a time instead of stacking all
  of them, keeping the section's visual weight fixed regardless of candidate count.
- Paginate `Sports` by team.
- Render `questions` on are-you-ok and conversation-starter items.
- Every item keeps its `topic` label and `ArticleFeedback` thumbs control **at every
  page depth** — no item is reachable without its feedback affordance.
- Reset paging to the first page when the underlying period/day/metro changes.
- Model `questions?: string[]` and `uid` on alerts in `src/types.ts`, noting both are
  emitted by the generator but **absent from `docs/schema/digest.schema.json`**.
- Cover the accessibility gate's required render shapes with committed fixture digests
  (excluded from production builds) rather than hoping live data contains them, sweep the
  real metros separately for content drift, and generate the URL list from both instead of
  pinning calendar dates — with the six-way appearance matrix applied to the fixture pages
  it exists to stress, not to every live page, so the gate stays fast enough to leave on.

## Capabilities

### New Capabilities
- `section-pagination`: how every digest section bounds its candidate set for display,
  pages through it in both directions, preserves per-item feedback affordances at any
  depth, and resets on document change.
- `conversation-questions`: rendering the per-article `questions` prompts, including
  which sections carry them and how absence is handled.
- `a11y-url-coverage`: which application states the accessibility gate covers, which of
  them are guaranteed by fixtures versus swept from live data, and how lost coverage
  surfaces as a failure rather than a silent pass.

### Modified Capabilities
- `digest-data`: **Uniform Array Sections** currently fixes `are_you_ok` at "daily 0–1,
  weekly 0–2" and says an empty array omits the section — the contract now makes it
  unbounded, so the requirement must move the display bound to the UI. **Contract-Aligned
  Article Schema** must cover `uid` becoming required and `questions` being an optional
  additive field the contract does not yet model.

## Impact

- **Code:** new `src/components/Pager.tsx`; `ArticleList.tsx`, `AreTheyOk.tsx`,
  `Sports.tsx`, `NewsDigest.tsx` (stops mapping `areOk` into N rows), `types.ts`,
  `data/strings.ts` (pager microcopy per style), `styles/newsDigest.css`.
- **Accessibility:** pager is interactive and gates content — needs accessible names,
  disabled-state handling, and a live announcement of page changes, and must keep
  `npm run test:a11y:ci` clean. The URL list moves from the checked-in `.pa11yci` to a
  generated, gitignored config produced by a new `scripts/gen-pa11y-urls.mjs`, in two tiers:
  fixture pages across all six style×theme combinations, live pages in the default
  appearance only. `DAILY_WINDOW` moves to `src/data/window.ts` so the generator and the
  loader share one definition of which days are reachable. New `digests-fixtures/` tree,
  loaded only under `VITE_A11Y_FIXTURES` so it never ships. `.githooks/pre-push` becomes
  path-scoped and `CLAUDE.md`'s Accessibility section is updated to match.
- **Data:** none. Digest JSON is read-only and unchanged.
- **Upstream:** `render/` owns a schema that omits two fields it emits (`questions`,
  alert `uid`). Worth reporting; does not block this change, since the contract declares
  objects open and additive fields safe.
- **Not in scope:** the person model, topic preference storage, and any ranking of
  candidates. This change only makes the pool reachable and feedback-able.
