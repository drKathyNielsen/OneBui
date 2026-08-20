## ADDED Requirements

### Requirement: Render Conversation Prompts
The system SHALL render an article's `questions` prompts when present, as a list
attached to that article, so the reader has concrete openers for a conversation.

#### Scenario: A starter shows its prompts
- **WHEN** a conversation-starter item carries two questions
- **THEN** both are rendered verbatim with the item, visually distinct from the article's description and summary

#### Scenario: Prompts appear on leads too
- **WHEN** an `are_you_ok` lead carries questions
- **THEN** they are rendered with that lead

### Requirement: Absent Prompts Are Not An Error
The system SHALL treat `questions` as optional and render an article normally when the
field is absent, empty, or carries no usable entries. `you_should_know` items are not
expected to carry prompts.

#### Scenario: You-should-know renders without prompts
- **WHEN** a `you_should_know` item has no `questions` field
- **THEN** the item renders normally with no empty prompt container and no placeholder text

#### Scenario: Empty array renders nothing
- **WHEN** an article carries an empty `questions` array
- **THEN** no prompt list is rendered for that article

### Requirement: Prompts Are Announced As A Group
The system SHALL associate rendered prompts with their article for assistive
technology, so prompts are not read as free-floating text between articles.

#### Scenario: Prompts are attributable
- **WHEN** a screen reader user reaches an article's prompts
- **THEN** the prompts are conveyed as a labelled group belonging to that article
