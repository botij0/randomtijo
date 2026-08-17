# Picker Persistence Specification

## Purpose

Restore editor, not outcomes.

## Requirements

### Requirement: Restore options and last mode

MUST restore options and last mode; missing save MUST stay usable.

#### Scenario: Survive reload

- GIVEN options A, B, C and mode slots
- WHEN the page reloads
- THEN A, B, C and slots are restored

### Requirement: No persisted winner or history

Winner and history MUST NOT persist; reload MUST be idle with no winner.

#### Scenario: Winner not restored

- GIVEN a revealed winner after several spins
- WHEN the page reloads
- THEN phase is idle with no winner or history

### Requirement: Storage failure fail-open

Storage failure MUST leave in-memory edit and spin usable.

#### Scenario: Storage fail-open

- GIVEN storage read or write fails
- WHEN the page loads or an option is added
- THEN the in-memory editor stays usable and may spin
