## Context

`wire-real-digests` made "Weekly" a client-side walk over individual daily files (day-chips re-showing each day). The product intent is different: Weekly is an *editorially aggregated* brief the generator produces, and the day-stepping belongs to the Daily view (catch up on the last few days). This change reshapes the data model and the period UI accordingly, and bounds what the UI ingests (review #7).

Boundary reminder from the contract: the generator owns correctness and now also **aggregation/curation** (which stories are most salient across a week — judgment work); the UI owns presentation and packaging.

## Goals / Non-Goals

**Goals:**
- Add a generator-produced weekly aggregate document, one per metro, rendered as the Weekly view.
- Keep Daily as single-day briefs with day-chips over up to the last 4 available days.
- Make `are_you_ok` an array in the raw documents (daily and weekly), so there is one shape end to end.
- Ingest only the newest 4 daily files per metro (+ the weekly), so the bundle doesn't grow with history.

**Non-Goals:**
- Weekly history / "previous weeks" — only the current week exists (`weekly.json` is overwritten).
- Per-reader "since you last visited" read-state — a later feature atop unchanged daily files.
- Dictating generator retention — the generator may keep any history; bounding is the UI's job.
- Cross-metro aggregation or a global calendar.

## Decisions

- **UI-displayed data comes from the JSON body; loader logic may use filenames.** The values the UI *shows* — masthead date, `metroCode`, `shortName`, weekly `range` — are read from the body. The loader may still read the **date encoded in a daily filename** as processing logic: to order files and select which to ingest/drop. Filenames are an index the processor reads; they are not the data the UI renders. (This supersedes review-#4's body-vs-filename cross-check: the body is authoritative for display, the filename is only a selection key, so a divergence changes nothing shown.)
- **`are_you_ok` is always an array — in the raw documents, not just the view model.** Both daily and weekly emit `are_you_ok: Article[]` (daily 0–1, weekly 0–2). This changes the daily contract (`Article | null` → `Article[]`): no `null` case, no normalization, arrays end to end. One renderer, no branching.
- **Daily and weekly share section shapes; they differ in date-vs-range and item counts.** Every section (`are_you_ok`, `conversation_starters`, `you_should_know`, `sports`) is an array in both. Daily carries a single `date` and short lists (are_you_ok ≤1, others ~3); weekly carries `range: { start, end }` and longer lists (are_you_ok ≤2, others ~5, all sports). Model as a discriminated union on a `period` field. Maximizes reuse (shared `Article` + section renderer) while keeping the documents distinguishable.
- **Single overwritten weekly file: `digests/<slug>/weekly.json`.** No date in the name, no history. The weekly coverage window lives in the body as `range: { start, end }` (data) and is display-only ("Week of Jul 19–25"); it is never a filename or a navigation input.
- **Lazy glob; ingest only the newest 4 daily files per metro.** Use `import.meta.glob('/digests/**/*.json')` **without `eager`**, giving a path→loader map. Group loaders by directory (path grouping is processor logic), sort daily loaders by the filename date, dynamically import only the newest 4 per metro plus `weekly.json`. Only those chunks enter the bundle — this closes #7 at ingest, independent of what the generator retains. After import, read `date`/`metroCode`/`shortName`/`range` from the body for everything shown.
- **The manifest is loaded asynchronously.** Because the glob is lazy, `METROS` resolves via `await`; `App` renders a lightweight loading state until the newest 4 dailies (+ weekly) per metro have imported. Rationale: the async cost buys the bounded bundle.
- **Period toggle swaps documents; chips are Daily-only.** `App` holds `period: 'daily' | 'weekly'` plus the selected daily `date`. Daily renders the selected day (`days.find(date)`) with the chip rail over the ≤4 days; Weekly renders `metro.weekly` with no chips. Switching back to Daily restores the selected/newest day.

## Risks / Trade-offs

- [Risk] Lazy loading makes the manifest async — `App` needs a loading state and null-safety before `METROS` resolves. Mitigation: a small loading placeholder; the data set is tiny so the wait is brief.
- [Risk] A metro with no `weekly.json` yet (new feed) — Weekly must not crash. Mitigation: `weekly: WeeklyDigest | null`; hide or disable the Weekly toggle when null.
- [Risk] `are_you_ok` becoming an array touches the daily view model and the just-shipped daily contract + the 42 existing files. Mitigation: covered by typecheck; existing daily files need re-emitting with `are_you_ok` as `[]`/`[one]` (a generator/data migration, noted in the handoff).
- [Trade-off] Selecting the newest 4 by filename date assumes daily filenames encode the date. Accepted: that is exactly the "filenames as a processor index" decision above; the displayed date still comes from the body.
