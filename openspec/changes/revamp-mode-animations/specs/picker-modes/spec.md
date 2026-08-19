# Delta for picker-modes

## MODIFIED Requirements

### Requirement: Theater to preselected winner

Each mode MUST visually resolve to the already-selected winner and MUST NOT run a second random selection. Every spin MUST animate forward and complete, regardless of prior spins.

Roulette MUST rotate multiple full turns forward from the current angle each spin and MUST stop with the winning slice at the pointer.

Slots MUST scroll the reel forward through multiple loops each spin and MUST settle on the winning option with a visible stop.

(Previously: only required resolving to the preselected winner with no second pick; forward animation and per-mode motion were unspecified.)

#### Scenario: Modes show winner

- GIVEN a selected winner
- WHEN roulette or slots presentation completes
- THEN it shows that winner with no second pick

#### Scenario: Repeat roulette spins always animate

- GIVEN a completed roulette spin
- WHEN two more spins run in a row
- THEN each rotates forward multiple full turns and stops with the winner slice at the pointer

#### Scenario: Repeat slots spins scroll forward

- GIVEN a completed slots spin
- WHEN another spin runs
- THEN the reel scrolls forward through multiple loops and settles visibly on the winner
