## ADDED Requirements

### Requirement: Coverage Is Derived From Digest Data
The accessibility gate's URL list SHALL be generated at run time from the fixture set
and the digest files then present, restricted to pages the application actually loads.
It SHALL NOT be maintained as a checked-in list of URLs, and SHALL NOT identify any
covered day by a hard-coded calendar date.

#### Scenario: A new metro is swept without editing config
- **WHEN** a new metro directory is added under `digests/`
- **THEN** the next accessibility run covers that metro's newest day and its weekly, with no edit to any configuration file

#### Scenario: An out-of-window day is never emitted
- **WHEN** a digest file exists for a day older than the application's load window
- **THEN** no URL is generated for that day, because requesting it would canonicalize to the newest day and check the wrong page

#### Scenario: Appearance coverage is tiered by what each page is for
- **WHEN** the URL list is generated
- **THEN** each required-shape page is covered in all six style×theme combinations, because appearance tokens are what those pages exist to stress
- **AND** each live-data page is covered in the default appearance only, because its purpose is detecting content drift, not re-testing tokens the fixtures already cover

### Requirement: Required Shapes Come From Fixtures, Not Live Data
The system SHALL cover each required render shape — stacked weather alerts, an empty
section, a section large enough to page, an article without an image — using committed
fixture digests authored for that purpose. Coverage of a required shape SHALL NOT depend
on whether live digest data happens to contain it, and generation SHALL exit non-zero
naming the shape when a required fixture is missing or malformed.

#### Scenario: Live data lacking a shape does not reduce coverage
- **WHEN** no live digest in any metro carries a weather alert, or none carries more than one at once
- **THEN** stacked-alert rendering is still covered by the fixture, and the run neither fails nor silently skips the shape

#### Scenario: A missing fixture stops the run
- **WHEN** the fixture supplying weather-alert coverage is removed or malformed
- **THEN** generation exits non-zero identifying weather-alert coverage as unsatisfied, before pa11y-ci is invoked, so the check cannot report success

### Requirement: Fixtures Are Excluded From Production Builds
The system SHALL keep fixture digests out of the production bundle and out of the metro
navigation, so that a reader never sees a fixture city and the shipped bundle carries no
fixture data.

#### Scenario: No fixture city in the shipped app
- **WHEN** the production build is served
- **THEN** the metro navigation lists only real metros, and no fixture digest is fetchable

#### Scenario: Fixtures present only for the gate
- **WHEN** the accessibility build runs
- **THEN** fixture digests are included and addressable by URL
