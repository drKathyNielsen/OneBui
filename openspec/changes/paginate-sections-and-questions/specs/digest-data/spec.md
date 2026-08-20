## MODIFIED Requirements

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
