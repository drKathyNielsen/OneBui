# view-state-url Specification

## Purpose
TBD - created by archiving change deep-linkable-view-state. Update Purpose after archive.
## Requirements
### Requirement: View State In The URL
The system SHALL reflect the selected metro, period, and daily date in the URL query string, and SHALL drive those selections from the URL, so a view is a shareable, bookmarkable address. The metro SHALL be identified by its slug, the period by `daily` or `weekly`, and the day by its ISO `yyyy-mm-dd` date.

#### Scenario: Selection updates the URL
- **WHEN** the reader selects a metro, switches period, or picks a day
- **THEN** the URL query string updates to reflect the new selection without a full page reload
- **AND** the browser history gains an entry for the new view

#### Scenario: Load restores the view from the URL
- **WHEN** the app is opened at a URL carrying `metro`, `period`, and/or `date`
- **THEN** the app restores that metro, period, and day once the manifest has resolved
- **AND** the rendered view matches what the URL describes

#### Scenario: Weekly view omits the date
- **WHEN** the period is `weekly`
- **THEN** the URL does not carry a `date` parameter, and any incoming `date` is ignored for rendering

### Requirement: Back And Forward Navigation
The system SHALL update the view when the reader uses the browser Back and Forward buttons, treating each pushed selection as a distinct history entry.

#### Scenario: Back restores the previous selection
- **WHEN** the reader makes several selections and then presses Back
- **THEN** the view returns to the previous selection as encoded in that history entry, without a full reload

### Requirement: Invalid Parameters Fall Back And Canonicalize
The system SHALL validate incoming URL parameters against the resolved manifest and fall back to safe defaults, then rewrite the URL to the corrected (canonical) form without adding a history entry.

#### Scenario: Unknown metro slug
- **WHEN** the URL names a `metro` slug that is not in the manifest (or names none)
- **THEN** the app selects the first metro and rewrites the URL to that slug

#### Scenario: Weekly requested where no weekly exists
- **WHEN** the URL requests `period=weekly` for a metro that has no weekly aggregate
- **THEN** the app shows the daily view and rewrites the URL to `period=daily`

#### Scenario: Date outside the ingested window
- **WHEN** the URL names a `date` not among the metro's ingested days
- **THEN** the app selects the metro's newest day and rewrites the URL to that date

#### Scenario: Canonicalization does not pollute history
- **WHEN** the app corrects invalid incoming parameters
- **THEN** it replaces the current history entry rather than pushing a new one

