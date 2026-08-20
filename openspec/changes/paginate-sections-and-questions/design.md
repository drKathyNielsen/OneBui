## Context

Three sections render candidate arrays, each wrong in a different way:

| Component | Today | Weekly worst case |
|---|---|---|
| `ArticleList` | one-way reveal, `PAGE_SIZE = 3`, no way back | 15 items = 4 clicks, no return |
| `AreTheyOk` | no bound; `NewsDigest` maps each lead into its own full-width row | 6 stacked heroes |
| `Sports` | no bound; every team, every line | 6 teams |

The contract change that caused this is deliberate: render emits complete ordered
candidate sets and states the UI must bound them. The reason the sets are large is the
planned person-centric model — thumbs feedback on articles teaches per-person topic
affinity, so two readers in one metro diverge. That makes "reachable **and** rateable"
the load-bearing property, not merely "not overwhelming".

Constraints: Bootstrap grid layout, per-style microcopy in `data/strings.ts`, and a
hard accessibility gate (`npm run test:a11y:ci`, WCAG2AA, four style×theme runs, plus a
pre-push hook).

That gate is itself part of the problem. `.pa11yci` hard-codes two San Antonio dates
whose files were deleted; the app canonicalizes the unknown dates to the newest day and
the suite reports `0 errors`, so a third of the matrix is silently checking a duplicate.
The dates encoded an intent — commit `e0a9d1c` added a *3-alert* fixture — that is now
unrepresented, because no loaded day carries more than one alert. This change adds pager
states that need covering, so the gate is fixed first rather than built on.

## Goals / Non-Goals

**Goals:**
- Every candidate reachable in both directions, in generator order.
- Feedback control and topic label present at every depth.
- Fixed visual weight per section regardless of candidate count.
- Render `questions` prompts.
- One paging mechanism, so a future ranker changes ordering in one place.

**Non-Goals:**
- The person model, profile storage, topic preferences, or any ranking/reordering of
  candidates. This change makes the pool reachable; it does not personalize it.
- Infinite scroll or virtualization — candidate sets are tens of items, not thousands.
- Changing `DAILY_WINDOW`'s *value*, or fixing the schema's missing `questions`/alert-`uid`
  entries (upstream's call).
- Broadening a11y coverage beyond the shapes already intended plus the pager states this
  change introduces. The generator makes coverage honest; it does not expand its remit.

## Decisions

**1. A `usePaging` hook plus a presentational `Pager`, not a wrapper component.**
The three sections render structurally different children — an `<ol>` of articles, a
single hero card, a set of team blocks. A generic paginating wrapper would need a
render-prop or `children` API and would fight all three layouts. A hook returning
`{ visible, page, pageCount, next, prev }` leaves each section's markup untouched, and
`Pager` renders only the controls. Two small pieces, three call sites each — not
speculative abstraction.

*Alternative rejected:* keep per-component `useState`. That triples the reset logic and
the a11y wiring, which is exactly where bugs would hide.

**2. Page size per section, not one global constant.**
`starters` / `know`: **3** (preserves today's density). `areOk`: **1** — it's a hero;
its whole problem is vertical weight. `sports`: **3** teams. Co-located as named
constants so the numbers are reviewable in one place.

*Alternative rejected:* a single `PAGE_SIZE`. Paging heroes 3-at-a-time reintroduces
the stacking problem the change exists to fix.

**3. Reset by array identity, reusing the existing in-render pattern.**
`ArticleList` already resets via `if (items !== prevItems)` during render. `vm` is
`useMemo`'d in `App.tsx:104` on `[metro, day, period]`, and `toCityViewModel` /
`toWeeklyViewModel` build fresh arrays with `.map()`, so identity changes exactly when
the document changes. The hook absorbs this pattern; no `useEffect`, no extra render.

*Alternative rejected:* keying on a `date`/`period` string. It would need threading
through every section and duplicates what identity already tells us.

**4. Clamp `page` on shrink rather than trusting stored state.**
Derive `pageCount` each render and clamp; a section that shrinks can never strand the
reader on an empty page.

**5. Prompts render as a labelled `<ul>` under the article body.**
Placed after `description`/`summary` and before the meta line, so the reading order is
story → what it says → how to bring it up → attribution. `aria-label` (per-style, e.g.
"Ways to bring it up") makes them a named group rather than loose text. Rendered only
when the array has usable entries — belt-and-braces on the one starter and one lead in
the current data that lack the field entirely.

**6. Pager a11y: disabled buttons + a polite live region.**
Each button gets an `aria-label` naming its section ("Previous conversation starters"),
so the three pagers are distinguishable. Ends of the set use `disabled` rather than
removing controls, keeping layout stable and focus from jumping. A status element
("4–6 of 15") carries `aria-live="polite"` so the position is announced without
stealing focus.

**7. Cover required render shapes with committed fixtures; sweep live data separately.**
The a11y gate has two jobs that pull in opposite directions. *Shape coverage* — does a
stacked-alert page pass WCAG2AA? — needs determinism. *Drift coverage* — does today's
real headline blow the layout? — needs real data. One URL list serving both is why the
current config rotted.

So: a `digests-fixtures/` tree, authored to exercise the shapes and committed, supplies
every required shape. Live `digests/` is swept for each metro's newest reachable day and
weekly, with **no shape requirement charged against it**. Weather alerts are intermittent
by nature; a quiet week must not fail the build.

*Alternative rejected:* selecting the shape-covering page out of live data by predicate
("the loaded day with the most alerts"). This was the first design here, and it is wrong:
it makes required coverage contingent on the weather. A week with no alerts anywhere
either hard-fails the build for a non-defect — training everyone to `--no-verify` — or
degrades silently, which is the bug we started with. It also cannot cover a shape live
data has never contained, such as three simultaneous alerts.

**8. The appearance matrix applies to fixtures only; live pages get one combination.**
Crossing every selected page with all four style×theme blocks costs 40 pa11y runs today
(4 fixture + 6 live pages) and 96 at ten metros — serially, since `pa11y-ci` defaults to
`concurrency: 1`, on a pre-push hook. A gate that slow gets bypassed, which is the same
failure as a gate that lies.

The redundancy is on the theme axis. Style and theme vary *token values* from
`theme.css`; they do not vary with data. Running Boulder's weekly through four themes
re-tests the four token sets the fixtures already stress. So the matrix follows what each
tier is for: fixtures × 4 combinations (the contrast matrix, on shapes chosen to stress
it), live pages × the default combination (a structural smoke check per metro). That is
22 runs today, and the fixture half — the expensive half — **does not grow as metros are
added**. The generated config also sets `concurrency: 4`.

The pre-push hook narrows further by what changed: a push touching `src/` or `styles/`
runs the fixture matrix; a push that is only new `digests/` data runs the live sweep. CI
on pull request runs everything, so nothing is permanently exempt.

*Accepted gap:* a brand-new shape appearing in live data whose contrast fails **only** in
a non-default theme slips past the sweep and waits for the next PR run. Narrow, caught
within a day, and worth it for a gate people actually let finish.

**9. Generation is still derived, and still fails loudly — but now only on real defects.**
`scripts/gen-pa11y-urls.mjs` reads both trees, applies the loader's window, expands each
tier by its own appearance blocks, and writes a gitignored `.pa11yci.json`. It exits
non-zero when a required shape has no covering fixture. That signal now means something
actionable — a fixture was deleted or malformed — rather than "it didn't rain."

`DAILY_WINDOW` moves from `src/data/digests.ts` to `src/data/window.ts`, imported by both
the loader and the generator, so "which days are reachable" has exactly one definition.
Node 24 strips TS types natively, so the `.mjs` generator imports the `.ts` constant
directly — no duplicated literal, no build step, no regex-scraping a source file. Note the
window is *relative* ("newest 4 days per metro"), not an absolute cutoff, so a fixture
metro's own days are always in-window — fixtures cannot age out.

*Alternatives rejected:* teaching the app relative selectors (`?day=oldest`) adds permanent
public URL surface that exists only to serve tests; driving the day picker through pa11y
`actions` trades date brittleness for selector brittleness and cannot express "the oldest
day chip" cleanly. Re-pinning fresh dates was rejected outright — it fixes today's symptom
and guarantees the same silent rot returns.

## Risks / Trade-offs

- **Disabled-button contrast fails WCAG2AA in one of the four themes** → the usual
  offenders are `--text-secondary` and `--accent` in dark modes (per `CLAUDE.md`).
  Style the disabled state from an existing token verified at 4.5:1 rather than
  inventing a new grey; run the a11y suite before merge.
- **Three live regions on one page could over-announce** → scope each to its own
  section and keep the message to the position string only.
- **Readers may never page past page 1, so deep candidates get no feedback** → real,
  and not solvable here; it is a ranking problem the person model addresses. Showing
  total count ("of 15") at least advertises that the pool is deeper.
- **Losing the one-way "more" flow is a visible UX change** → intended, and called out
  as BREAKING (UX) in the proposal. `moreLabel` in `data/strings.ts` becomes dead and
  must be removed in the same change, not left orphaned.
- **`questions` is unmodelled upstream** → typed optional, so a generator that stops
  emitting it degrades to today's rendering rather than crashing.
- **A hard-failing generator can block an unrelated push** → acceptable only because the
  failure now indicates a fixture defect, never a quiet news week. The error must name the
  unsatisfied shape and the fix, or it will read as an inscrutable CI break.
- **A path-scoped pre-push hook can skip the tier that mattered** → a change touching both
  `src/` and `digests/` must run both tiers, and anything unrecognized must fall back to
  running everything. Scoping is an optimization; the PR run is the backstop.
- **Fixtures drift from the real contract** → a fixture written by hand can encode a shape
  the generator no longer emits, so the gate passes on markup nothing produces. Author
  fixtures by copying real digests and editing, and keep them validated against
  `docs/schema/digest.schema.json` like any other digest.
- **Fixture data leaking into production** → the failure would be a fake city in the nav.
  Covered by an explicit non-leak check in the task list, not by inspection.
- **The generated config is gitignored, so a11y URLs are no longer reviewable in a diff** →
  the *predicates* become the reviewable artifact instead, which is the more meaningful
  thing to review. Printing the selected URLs during generation keeps the run legible.

## Open Questions

- Should the weekly's larger sets use a bigger page size than the daily's? Starting
  uniform; revisit if the weekly feels slow to page.
- How many fixture metros? Starting with **one**, carrying several days that between them
  cover the shapes. Splitting into several fixture cities would read more clearly in the
  nav during a debugging session, at the cost of more files to keep valid.
- Do `questions` belong on `you_should_know` eventually? Zero of 189 carry them today;
  the renderer handles them if they appear. never
