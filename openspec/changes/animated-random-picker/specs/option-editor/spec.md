# Option Editor Specification

## Purpose

Labeled options.

## Requirements

### Requirement: Manage option labels

MUST add/edit/remove when idle; MUST lock while spinning.

#### Scenario: Idle edits apply

- GIVEN idle with 3 options
- WHEN add, edit, and remove occur
- THEN all three changes apply

#### Scenario: Spinning blocks edits

- GIVEN spinning
- WHEN an edit is attempted
- THEN the set is unchanged

### Requirement: Validity and bounds

MUST require non-empty trimmed labels, ≥2 valids, and cap 12. Invalids MUST NOT count.

#### Scenario: Two valid

- GIVEN 2 non-empty labels
- WHEN eligibility is checked
- THEN the set may spin

#### Scenario: Blank blocks

- GIVEN 1 valid and 1 whitespace-only label
- WHEN spin is attempted
- THEN spin does not start

#### Scenario: Cap twelve

- GIVEN 12 options
- WHEN another is added
- THEN the set stays at 12
