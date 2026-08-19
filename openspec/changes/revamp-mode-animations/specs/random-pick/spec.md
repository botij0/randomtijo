# Delta for random-pick

## ADDED Requirements

### Requirement: Presentation-only animation randomness

Randomness used by mode animations (e.g. slots spin-duration jitter) MUST be presentational only. It MUST NOT change the preselected winner, re-roll the pick, or affect fairness.

#### Scenario: Animation randomness keeps winner

- GIVEN a selected winner
- WHEN animation randomness varies between spins
- THEN every spin still resolves to the preselected winner
