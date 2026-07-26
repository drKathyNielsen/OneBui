# Weekly Digest Contract — addendum for the digest-generator app

> **Hand this file to the digest-generator repo.** It extends `DIGEST_OUTPUT_CONTRACT.md`
> (the per-day contract). It reuses that file's `Article` shape verbatim; read it first.

## 1. Why this exists

The daily files answer "what happened today." The **weekly** file answers "what mattered this
week" — an *editorially aggregated* brief over the last 7 days, with the most salient stories in an
expanded layout. Choosing what is salient is judgment work, so the **generator** produces this file;
the UI only renders it. The UI never assembles a week from daily files.

## 2. One file per metro, overwritten

- **Path:** `digests/<city-slug>/weekly.json` — **no date in the name**, exactly one per metro.
- **Lifecycle:** **overwrite in place.** There is no weekly history; only the current week is ever
  shown. Regenerate it on your normal cadence (a rolling *last 7 days*, refreshed daily, is the
  intent — a fixed Mon–Sun would be stale midweek).
- The UI ingests this file if present. A metro with no `weekly.json` yet simply has no Weekly view.

## 3. Required output contract (weekly)

```jsonc
{
  "period": "weekly",                 // discriminator; literal "weekly"
  "shortName": "Minneapolis, MN",     // display name (same rules as daily §5.3)
  "metroCode": "33460",               // same as the metro's daily files
  "range": { "start": "2026-07-19", "end": "2026-07-25" },  // ISO yyyy-mm-dd, inclusive 7-day window
  "are_you_ok": Article[],            // up to 2 lead "are they ok" stories (may be empty)
  "conversation_starters": Article[], // up to ~5 (may be empty)
  "you_should_know": Article[],       // up to ~5 (may be empty)
  "sports": [ { "team": string, "scores": string[] } ]   // ALL teams for the week (may be empty)
}
```

- **`Article`** is exactly the shape defined in `DIGEST_OUTPUT_CONTRACT.md` §4 (title, plain-text
  `description`, `image: {url,alt}|null`, `source`, `topic`, `url`, optional `summary`/`published_at`).
  No new article fields.
- **`are_you_ok` is an array here** (unlike the pre-change daily, which was a single object or null).
  See §5 — the daily contract is changing to match.
- **`range`** is data the UI *displays* ("Week of Jul 19–25"); it is not derived from the filename.
- Item counts above are targets/maxima for layout, not hard validation — emit fewer when the week is
  thin.

## 4. Selection guidance (generator's judgment)

- Dedupe across the week: a story that ran multiple days appears once, best version kept.
- Prefer the most consequential / widely-relevant items; the weekly is a highlight reel, not a dump.
- `sports`: include every team's line for the week (the UI shows them all).

## 5. Companion change to the DAILY contract

To give the UI one shape end to end, the **daily** document's `are_you_ok` changes from
`Article | null` to **`Article[]`** (0 or 1 element). Update `DIGEST_OUTPUT_CONTRACT.md` §4
accordingly and **re-emit existing daily files** so `are_you_ok` is `[]` (was `null`) or
`[ {…} ]` (was a single object). Everything else in the daily contract is unchanged.

## 6. Acceptance checklist

- [ ] Exactly one `digests/<slug>/weekly.json` per metro, overwritten (no dated weekly files).
- [ ] `period` is the literal `"weekly"`; `range.start`/`range.end` are ISO `yyyy-mm-dd`, start ≤ end.
- [ ] `are_you_ok` (≤2), `conversation_starters` (≤~5), `you_should_know` (≤~5) are arrays; `sports`
      shape matches the daily contract.
- [ ] Every `Article` validates against `DIGEST_OUTPUT_CONTRACT.md` §4 (no HTML in `description`,
      `source` present, `image` object-or-null, etc.).
- [ ] Daily `are_you_ok` re-emitted as an array across all existing dates.
