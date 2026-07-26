# digest-data Specification

## Purpose
TBD - created by archiving change period-digests. Update Purpose after archive.
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
The system SHALL treat `are_you_ok` as an array in both period documents (daily 0–1, weekly 0–2), with no single-object or null form.

#### Scenario: Daily lead renders from an array
- **WHEN** a daily brief has one lead story
- **THEN** it is carried as a one-element `are_you_ok` array and rendered as a single "Are they ok?" card
- **AND WHEN** the array is empty
- **THEN** the "Are they ok?" section is omitted

#### Scenario: Weekly renders multiple leads
- **WHEN** a weekly aggregate has two lead stories
- **THEN** both are rendered as "Are they ok?" cards

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

