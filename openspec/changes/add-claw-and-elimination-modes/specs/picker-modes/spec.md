# Delta for picker-modes

## MODIFIED Requirements

### Requirement: Choose mode before spin

MUST allow roulette, slots, horse race, claw machine, or elimination board before spinning. Mode MUST NOT change while spinning.

#### Scenario: Choose claw machine

- GIVEN idle
- WHEN claw machine is chosen
- THEN active mode is claw machine

#### Scenario: Choose elimination board

- GIVEN idle
- WHEN elimination board is chosen
- THEN active mode is elimination board

#### Scenario: Mode locked against claw machine

- GIVEN spinning in roulette
- WHEN switch to claw machine is attempted
- THEN mode remains roulette

#### Scenario: Mode locked against elimination board

- GIVEN spinning in roulette
- WHEN switch to elimination board is attempted
- THEN mode remains roulette

### Requirement: Theater to preselected winner

Each mode MUST visually resolve to the already-selected winner. MUST NOT run a second random selection.

Claw machine MUST place each option in the cabinet as a labeled prize. The claw MUST aim at the winning prize, drop, grab it, and lift it. Every play MUST start from the rest pose and run forward, including plays after a previous grab.

Elimination board MUST show each option as a labeled light. Losers MUST go dark one by one. The winning light MUST stay on. Every play MUST start with all lights on and eliminate forward, including plays after a previous finish.

#### Scenario: Modes show winner

- GIVEN a selected winner
- WHEN roulette, slots, horse race, claw machine, or elimination board presentation completes
- THEN it shows that winner with no second pick

#### Scenario: Claw machine grabs the winner

- GIVEN a selected winner and claw machine mode
- WHEN the claw runs
- THEN it grabs that prize and lifts it, and no second pick runs

#### Scenario: Repeat claw plays start from rest

- GIVEN a completed claw grab
- WHEN another play runs
- THEN the claw resets to rest and grabs the preselected winner again

#### Scenario: Elimination board leaves the winner lit

- GIVEN a selected winner and elimination board mode
- WHEN the board runs
- THEN other lights go dark and the winning light stays on, and no second pick runs

#### Scenario: Repeat elimination plays start fully lit

- GIVEN a completed elimination
- WHEN another play runs
- THEN all lights return on and losers go dark again until the preselected winner remains
