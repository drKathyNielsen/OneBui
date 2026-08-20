# digest-data Specification

## Purpose
How the UI ingests generator digest JSON and models it for rendering: the two
period documents and their uniform array sections, build-time discovery and
bundling of `digests/<slug>/…` files, the per-metro manifest, the contract-aligned
article schema, metro/day selection, and resilient rendering of sparse sections.
## Requirements
### Requirement: Two Period Documents
The system SHALL model a metro's content as two period documents: a per-day **daily** brief and a single **weekly** aggregate, and SHALL let the reader switch between them.

#### Scenario: Toggle swaps documents
- **WHEN** the reader switches between Today and Weekly
- **THEN** the whole document is replaced — Daily shows one day's brief, Weekly shows the aggregate — not a re-labelled version of the same content

#### Scenario: Weekly is generator-produced, not client-assembled
- **WHEN** the Weekly view is shown
- **THEN** its content is the generator's aggregate document, not a client-side concatenation of daily files

### Requirement: Body Is the Source of Displayed Data
The system SHALL read every value it displays — masthead date, metro code, display name, weekly coverage range — from the JSON body. Filenames MAY be used by loader logic to order and select files, but MUST NOT be the source of any displayed value.

#### Scenario: Displayed date comes from the body
- **WHEN** a daily brief is rendered
- **THEN** the masthead date is the body `date`, even though the loader used the filename's date to decide which files to ingest

### Requirement: Uniform Array Sections
The system SHALL treat `are_you_ok` as an array in both period documents, with no
single-object or null form, and SHALL NOT assume any upper bound on its length. The
contract emits a complete ordered candidate set and applies no display count, so the
UI SHALL apply its own display bound (see `section-pagination`).

#### Scenario: Daily lead renders from an array
- **WHEN** a daily brief has one lead story
- **THEN** it is carried as a one-element `are_you_ok` array and rendered as a single "Are they ok?" card
- **AND WHEN** the array is empty
- **THEN** the "Are they ok?" section renders its empty note rather than a bare heading

#### Scenario: Weekly renders multiple leads
- **WHEN** a weekly aggregate has six lead stories
- **THEN** all six are carried, one is rendered at a time, and the rest are reachable through the section's pager

#### Scenario: A growing upper bound is not a breaking change
- **WHEN** the generator raises how many leads it emits without a schema change
- **THEN** the UI renders correctly with no code change, because it bounds the display itself rather than relying on the array's length

### Requirement: Bounded Daily Ingestion
The system SHALL ingest only the newest four daily files per metro, loading them lazily so historical days do not enter the bundle.

#### Scenario: Only the recent window is fetched
- **WHEN** the app loads a metro whose directory contains many daily files
- **THEN** only the four newest (by filename date) plus the weekly file are imported; older days are not fetched

#### Scenario: Daily chips reflect the ingested window
- **WHEN** the reader opens the Daily view
- **THEN** the day-chips offer only the ingested days (up to four), newest first, and selecting one swaps the day's content

### Requirement: Weekly Coverage Range
The system SHALL render the weekly view's coverage window from a body `range` field, for display only.

#### Scenario: Range label from the body
- **WHEN** the weekly document has `range: { start, end }`
- **THEN** the masthead shows a coverage label derived from it (e.g. "Week of Jul 19–25")

### Requirement: Chips Are Daily-Only
The system SHALL show day-chips only in the Daily view; the Weekly view SHALL present the single aggregate with no day navigation.

#### Scenario: Weekly has no chips
- **WHEN** the Weekly view is shown
- **THEN** no day-chips are rendered

### Requirement: Asynchronous Manifest with Loading State
The system SHALL build the metro manifest asynchronously (because ingestion is lazy) and SHALL render a loading state until it resolves.

#### Scenario: Loading placeholder before data is ready
- **WHEN** the app mounts and the manifest has not yet resolved
- **THEN** a loading state is shown instead of attempting to render an undefined metro

### Requirement: Missing Weekly Is Non-Fatal
The system SHALL render the Daily view normally for a metro that has no `weekly.json`, and SHALL hide or disable the Weekly toggle for it.

#### Scenario: New-feed metro without a weekly file
- **WHEN** a metro has daily files but no `weekly.json`
- **THEN** Daily renders normally and the Weekly option is unavailable rather than erroring

### Requirement: Digest Discovery and Bundling
The system SHALL load all generator digest files matching `digests/<slug>/<metroCode>.<date>.json` at build time and make them available to the UI without any runtime network fetch.

#### Scenario: All digest files are discovered
- **WHEN** the application is built
- **THEN** every `*.json` file under `digests/` is included as digest data, keyed by its metro slug and date parsed from the path

#### Scenario: No runtime fetch
- **WHEN** the application renders a metro's digest
- **THEN** it reads from bundled data and makes no HTTP request for the digest content

### Requirement: Metro Manifest
The system SHALL group loaded digests into one entry per metro, each exposing the metro's display name and its available days sorted newest-first.

#### Scenario: One entry per metro
- **WHEN** the manifest is built from the digest files
- **THEN** each metro appears once with its `shortName`, `metroCode`, and a list of `{ date, data }` days ordered from newest to oldest

#### Scenario: Empty metros excluded
- **WHEN** a metro directory contains no valid digest day files (e.g. an empty `columbus-oh/`)
- **THEN** that metro does not appear in the manifest or the sidebar

### Requirement: Contract-Aligned Article Schema
The system SHALL model digest articles to match the digest output contract: a structured `image` object or `null`, an explicit `source`, `summary`/`published_at`, and a `uid` that the contract now requires on every article, and SHALL render these fields verbatim without sanitizing. The system SHALL additionally tolerate generator-emitted fields the published contract does not yet model, treating them as optional.

#### Scenario: Structured image resolves to a thumbnail
- **WHEN** an article has `image: { url, alt }`
- **THEN** the rendered article shows a thumbnail using that `url`
- **AND WHEN** an article has `image: null`
- **THEN** the rendered article shows the empty thumbnail placeholder without error

#### Scenario: Source comes from the data
- **WHEN** an article is rendered
- **THEN** its outlet label is the article's emitted `source` field, not a value guessed from the URL

#### Scenario: Feedback identity is always available
- **WHEN** an article is rendered
- **THEN** its feedback control has a `uid` to record against, since the contract requires one on every article

#### Scenario: Unmodelled additive fields are tolerated
- **WHEN** an article carries a field the published schema does not describe, such as `questions`, or a weather alert carries a `uid`
- **THEN** the field is modelled as optional and its absence on any given item does not break rendering

### Requirement: Metro Selection
The system SHALL present the available metros for selection and, when a metro is selected, display that metro's newest available day by default.

#### Scenario: Selecting a metro shows its latest day
- **WHEN** the user selects a metro from the sidebar
- **THEN** the digest for that metro's newest available date is displayed

#### Scenario: Date clamps on metro change
- **WHEN** the user has a day selected and switches to a metro that does not have that date
- **THEN** the displayed day resets to the newly selected metro's newest available date

### Requirement: Per-Day Navigation
The system SHALL let the user navigate among a metro's actually-available days rather than a fixed calendar window.

#### Scenario: Weekly lists real days only
- **WHEN** the user opens the Weekly view for a metro
- **THEN** only dates for which that metro has a digest are offered
- **AND** metros with fewer days (e.g. Charlotte) offer only their available dates

#### Scenario: Selecting a day swaps content
- **WHEN** the user selects a specific available day
- **THEN** the masthead date and all article sections update to that day's digest

### Requirement: Resilient Rendering of Sparse Digests
The system SHALL render digests with missing or empty sections without error.

#### Scenario: Empty lead and empty sections
- **WHEN** a digest has an empty `are_you_ok` array and one or more empty article arrays (e.g. Wheeling)
- **THEN** each of those sections renders its heading with an empty note, so no header stands alone, and the remaining sections render normally
