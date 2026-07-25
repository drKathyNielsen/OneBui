## ADDED Requirements

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
The system SHALL model digest articles to match the digest output contract: a structured `image` object or `null`, an explicit `source`, and optional `summary`/`published_at`, and SHALL render these fields verbatim without sanitizing.

#### Scenario: Structured image resolves to a thumbnail
- **WHEN** an article has `image: { url, alt }`
- **THEN** the rendered article shows a thumbnail using that `url`
- **AND WHEN** an article has `image: null`
- **THEN** the rendered article shows the empty thumbnail placeholder without error

#### Scenario: Source comes from the data
- **WHEN** an article is rendered
- **THEN** its outlet label is the article's emitted `source` field, not a value guessed from the URL

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

#### Scenario: Null lead story and empty sections
- **WHEN** a digest has `are_you_ok: null` and one or more empty article arrays (e.g. Wheeling)
- **THEN** the corresponding sections are omitted and the remaining sections render normally
