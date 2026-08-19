# Delta for picker-modes

## MODIFIED Requirements

### Requirement: Choose mode before spin

MUST allow roulette, slots, or horse race before spinning. Mode MUST NOT change while spinning.

#### Scenario: Choose mode

- GIVEN idle
- WHEN horse race is chosen
- THEN active mode is horse race

#### Scenario: Mode locked

- GIVEN spinning in roulette
- WHEN switch to horse race is attempted
- THEN mode remains roulette

### Requirement: Theater to preselected winner

Each mode MUST visually resolve to the already-selected winner. MUST NOT run a second random selection.

Horse race MUST place each option in its own lane as a labeled horse. The winning horse MUST reach the finish line first. Every race MUST start from the gate and run forward, including races after a previous finish.

#### Scenario: Modes show winner

- GIVEN a selected winner
- WHEN roulette, slots, or horse race presentation completes
- THEN it shows that winner with no second pick

#### Scenario: Horse race winner arrives first

- GIVEN a selected winner and horse race mode
- WHEN the race runs
- THEN that horse reaches the finish before the others and no second pick runs

#### Scenario: Repeat horse races start from the gate

- GIVEN a completed horse race
- WHEN another race runs
- THEN horses reset to the start and the preselected winner arrives first again
