## ADDED Requirements

### Requirement: UI Owns the Display Bound
The system SHALL bound every digest section for display itself, treating each section
array as a complete ordered candidate set rather than a pre-trimmed display list. No
section MAY render its entire array unconditionally.

#### Scenario: A large weekly section is bounded
- **WHEN** a weekly aggregate carries 15 conversation starters
- **THEN** only one page of them is rendered at a time, and the remainder is reachable via the pager

#### Scenario: Multiple leads do not stack
- **WHEN** a digest carries six `are_you_ok` leads
- **THEN** one lead is rendered at a time, so the section's visual weight does not grow with the candidate count

#### Scenario: A section that fits needs no pager
- **WHEN** a section's candidate count is at or below one page
- **THEN** all items render and no pager controls are shown

### Requirement: Bidirectional Paging
The system SHALL let the reader move both forward and backward through a section's
candidate set, and SHALL make every candidate in the set reachable.

#### Scenario: Reader advances and returns
- **WHEN** the reader advances to a later page and then pages back
- **THEN** the earlier items are shown again, without the reader having to reload or switch documents

#### Scenario: Ends of the set are not traversable
- **WHEN** the reader is on the first page
- **THEN** the previous control is unavailable
- **AND WHEN** the reader is on the last page
- **THEN** the next control is unavailable

#### Scenario: Every candidate is reachable
- **WHEN** a section carries any number of candidates
- **THEN** paging forward from the first page eventually renders every item in the array, in the order the generator emitted them

### Requirement: Feedback Affordance At Every Depth
The system SHALL render each item's topic label and thumbs up/down feedback control on
every page, so an item's reachability and its ability to receive feedback never diverge.
This preserves the per-item signal that later per-person ranking depends on.

#### Scenario: A deep item can be rated
- **WHEN** the reader pages to the last page of a section and rates an item
- **THEN** that item's feedback control behaves identically to one on the first page, recording against the item's `uid`

### Requirement: Paging Resets On Document Change
The system SHALL return every section to its first page when the underlying document
changes — a different day, period, or metro — so a position in one document never
carries into another.

#### Scenario: Switching day resets position
- **WHEN** the reader has paged deep into a section and then selects a different day, switches period, or selects another metro
- **THEN** each section renders its first page

### Requirement: Accessible Pager Controls
The system SHALL expose pager controls to assistive technology with discernible names
that identify which section they page, SHALL convey unavailability at the ends of the
set through disabled state rather than removal alone, and SHALL announce page changes.

#### Scenario: Controls are distinguishable across sections
- **WHEN** a screen reader user encounters the pagers for two sections on the same page
- **THEN** each control's accessible name identifies its own section rather than a bare "Next"

#### Scenario: Page change is announced
- **WHEN** the reader changes page
- **THEN** the new position within the set is announced without moving focus away from the pager control

#### Scenario: Automated checks stay clean
- **WHEN** the accessibility suite runs across all four style×theme combinations
- **THEN** the pager introduces no WCAG2AA violations, including contrast on its disabled state
