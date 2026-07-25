# Digest Output Contract — spec for the digest-generator app

> **Hand this file to Claude working inside the digest-generator repo.** It is self-contained:
> it describes exactly what that app must emit. It assumes no knowledge of the consuming UI.

## 1. Why this exists

The digest-generator produces one JSON file per city per day. Those files are consumed by a
separate React UI ("OneB") that renders a local news brief. Today the output is **not UI-ready**:
it leaks raw source-feed data. The boundary has been decided:

- **The generator owns data correctness.** All cleaning, normalization, and identity resolution
  happen here. The UI must be able to render any field verbatim, with no sanitizing.
- **The UI owns presentation and packaging.** Date formatting, styling, per-date bundling, and a
  navigation manifest are the UI's job — **do not** produce those here.

Your task: make the per-city-per-day output conform to the contract in §4, by fixing the defects
in §3 and applying the rules in §5.

## 2. Current output (what exists today)

- **Path:** `digests/<city-slug>.md/<metroCode>.<date>.json`
  e.g. `digests/chicago-il.md/16980.2026-07-23.json`
- **Shape (observed):**
  ```json
  {
    "metro": "Chicago-Naperville-Elgin, IL-IN-WI",
    "date": "2026-07-23",
    "are_you_ok": { "title": "...", "summary": "...", "description": "...",
                    "topic": "public-health", "url": "https://...",
                    "published_at": "2026-07-23T14:39:56+00:00" },
    "conversation_starters": [ { ...same article shape... } ],
    "sports": [ { "team": "Blackhawks", "scores": ["Kane signs 2-yr, $16M deal"] } ],
    "you_should_know": [ { ...same article shape... } ]
  }
  ```
- `are_you_ok` may be `null` (e.g. Wheeling 2026-07-23). Arrays may be empty.

**Keep the per-city-per-day file granularity and the path scheme.** The UI globs these and bundles
them itself. (If the `.md` directory suffix is incidental, you may drop it — just keep the scheme
stable and documented. Not required.)

## 3. Defects to fix (with evidence)

1. **Raw HTML dumped into `description`.** The Chicago 2026-07-23 file is ~70 KB; ~63 KB of that is
   HTML markup (`<img>`, `<figure>`, CDN URLs) inside `description` — one field is 44 KB — despite
   having the *same* article counts (3 + 3) as the ~4 KB cities. `description` must be **plain text**.
2. **`metro` is a Census CBSA name, not a display name.** `"Chicago-Naperville-Elgin, IL-IN-WI"` is
   not what a reader should see. Emit a human `shortName` (e.g. `"Chicago, IL"`).
3. **No `source` field.** The consumer currently guesses the outlet from URL substrings — brittle.
   The generator has the feed context; emit an explicit `source` per article.

## 4. Required output contract (per city per day)

```jsonc
{
  "shortName": "Chicago, IL",          // display name; you resolve from city identity/metro
  "metroCode": "16980",                // keep
  "date": "2026-07-23",                // ISO yyyy-mm-dd, local date of the digest
  "are_you_ok": Article | null,        // the single lead "are they ok" story, or null
  "conversation_starters": Article[],  // may be empty
  "you_should_know": Article[],        // may be empty
  "sports": [ { "team": string, "scores": string[] } ]   // may be empty; shape unchanged
}
```

```jsonc
// Article
{
  "title": string,          // plain text
  "description": string,    // PLAIN TEXT snippet, no HTML, bounded (see §5.1). Omitted if empty.
  "image": { "url": string, "alt": string } | null,  // lead image, or null (see §5.1)
  "source": string,         // human outlet label, e.g. "9NEWS", "CBS Chicago"
  "topic": string,          // normalized slug, e.g. "public-health" (see §5.4)
  "url": string,            // canonical article URL
  "summary": string,        // optional; short editorial line, plain text. Omit if none.
  "published_at": string    // optional; ISO 8601 with offset. Omit if unknown.
}
```

The consuming UI mirrors this as its `RawCity` / `RawArticle` TypeScript types — treat this schema
as a stable interface. Additive fields are fine; renames/removals are breaking.

## 5. Cleaning rules

### 5.1 `description` → plain-text snippet + `image`
- Strip **all** HTML/markup; decode entities (`&amp;` → `&`).
- Collapse whitespace; trim.
- Bound the length (recommend ~200–300 chars, cut on a word boundary, no trailing ellipsis noise).
- Populate `description` from the source blurb whenever it is present. If after stripping it is empty, omit `description` (do **not** fall back to `summary` — see note below).
- Never emit tags, image URLs, or CDN markup in this field.

> **Note on `summary`.** `summary` is a legacy field that predates a reliable source-supplied
> `description`; it is on its way out. `description` must come from the source, so render does not
> substitute `summary` when the source blurb is missing.
- **Lead image**: extract the article's lead image into the sibling `image` field, so the UI can
  show a thumbnail instead of the markup being discarded. Resolve the URL from the feed's
  structured media (`media:content` / image `enclosure`) first, falling back to the first `<img>`
  in the blurb; `alt` from the `<img alt>` or media title (`""` when unknown). Emit `null` when the
  article has no image.

### 5.2 `source` (human outlet label)
- Derive from the publisher/feed metadata you already have — not by string-matching the URL.
- Use the outlet's common on-air/masthead name (`"9NEWS"`, `"FOX 9"`, `"KARE 11"`, `"KENS 5"`,
  `"CBS Colorado"`, `"CBS Minnesota"`, `"San Antonio Report"`, `"WV MetroNews"`, `"WTRF"` …).
- Always present on every article.

### 5.3 `shortName` (display name)
- Resolve to `"City, ST"` (or the locally-recognized short form) from the city identity, not the CBSA
  string. Keep a maintained slug → shortName map in the generator.

### 5.4 `topic`
- Lower-kebab-case slug (`"violent-crime"`, `"severe-weather"`). Keep a bounded, documented
  vocabulary; map source categories into it.

### 5.5 Nullability / empties
- `are_you_ok`: emit `null` when there is no lead story. Do **not** emit an empty object.
- The three arrays: emit `[]` when empty. `sports` scores are short human strings; keep as-is.

## 6. Non-goals (the UI does these — do NOT do them here)
- No per-date bundling across cities. Keep one file per city per day.
- No `manifest.json` / index of dates. The UI builds it.
- No date formatting, drop-caps, styling, or view-model shaping.

## 7. Acceptance checklist
- [ ] No output `description` contains `<`/`>` tags, `img`, `figure`, or CDN URLs.
- [ ] Largest per-city-per-day file is within a few KB of the smallest with similar article counts
      (Chicago no longer an outlier).
- [ ] Every article has a non-empty `source`.
- [ ] Every city object has a human `shortName` (never a raw CBSA string).
- [ ] `are_you_ok` is a valid Article or `null`; arrays present (possibly empty); `sports` shape intact.
- [ ] `date` is ISO `yyyy-mm-dd`; `published_at` (when present) is ISO 8601 with offset.
- [ ] Schema validates against the types in §4 for all cities × all dates.

## 8. Suggested workflow for the generator repo
1. Write the §4 schema as a validator (JSON Schema or a typed serializer) and fail the build on
   violation.
2. Add an HTML-strip + snippet utility at the point where `description` is populated.
3. Add the slug→shortName and feed→source maps; assert coverage for every city/outlet emitted.
4. Backfill/regenerate the existing dates so historical files also conform.
5. Consider an OpenSpec change to capture this contract as a spec in that repo.
