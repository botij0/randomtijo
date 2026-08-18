# Delta for option-editor

## ADDED Requirements

### Requirement: Enter key adds option

Pressing Enter in an option input SHOULD add the current label as a new option when the set is under the 12-option cap. It MUST NOT bypass existing validity, bounds, or the spinning lock.

#### Scenario: Enter adds label

- GIVEN idle with 3 options and a non-empty label in an input
- WHEN Enter is pressed
- THEN the label is added as a new option

#### Scenario: Enter at cap does nothing

- GIVEN idle with 12 options
- WHEN Enter is pressed in an input
- THEN the set stays at 12

#### Scenario: Enter with blank label does nothing

- GIVEN idle with a whitespace-only label in an input
- WHEN Enter is pressed
- THEN no option is added
