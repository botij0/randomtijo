# Random Pick Specification

## Purpose

Fair pick lifecycle.

## Requirements

### Requirement: Fair single pick

MUST pick once with equal chance; MUST NOT re-pick while spinning or start with <2 valids. Phases: idle → spinning → revealed.

#### Scenario: Winner chosen once

- GIVEN 3 valid options, idle
- WHEN a spin starts and completes
- THEN winner stays one of them through idle → spinning → revealed

#### Scenario: Invalid set stays idle

- GIVEN fewer than 2 valid options
- WHEN spin is attempted
- THEN phase stays idle with no winner

### Requirement: Announce winner; reduced motion

MUST announce winner to assistive tech on reveal. Reduced motion MUST still pick and reveal with skipped or shortened animation.

#### Scenario: Winner announced

- GIVEN revealed
- WHEN the winner is shown
- THEN assistive tech receives the winning label

#### Scenario: Reduced motion still reveals

- GIVEN reduced motion preferred and a valid set
- WHEN a spin starts
- THEN winner is revealed; animation skipped or shortened
