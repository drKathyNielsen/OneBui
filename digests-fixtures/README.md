# Accessibility fixture digests

Deterministic digest files that cover the render shapes the accessibility gate must
check. They are **not** production data: `src/data/digests.ts` loads this tree only when
`VITE_A11Y_FIXTURES` is set, so no reader ever sees the fixture metro.

Live `digests/` is swept separately for content drift, with no shape requirement charged
against it — weather alerts are intermittent, and required coverage must not depend on
the weather (see `openspec/specs/a11y-url-coverage`).

| File | Shape it covers |
|---|---|
| `a11y-fixture/00000.2026-08-20.json` | three stacked weather alerts |
| `a11y-fixture/00000.2026-08-19.json` | every section empty (headings + empty notes) |
| `a11y-fixture/00000.2026-08-18.json` | articles with no image, and one with no logo/description/questions |
| `a11y-fixture/00000.weekly.json` | every section deep enough to page (6 leads, 15 + 15 articles, 6 sports teams) |

Authored by copying real digests and editing, and validated against
`docs/schema/digest.schema.json` like any other digest. `scripts/gen-pa11y-urls.mjs`
exits non-zero naming the shape when one of these goes missing or malformed.
