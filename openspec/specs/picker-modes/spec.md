# Picker Modes Specification

## Purpose

Theatrical winner display.

## Requirements

### Requirement: Choose mode before spin

MUST allow roulette, plinko, or slots before spinning. Mode MUST NOT change while spinning.

#### Scenario: Choose mode

- GIVEN idle
- WHEN plinko is chosen
- THEN active mode is plinko

#### Scenario: Mode locked

- GIVEN spinning in roulette
- WHEN switch to slots is attempted
- THEN mode remains roulette

### Requirement: Theater to preselected winner

Each mode MUST visually resolve to the already-selected winner. MUST NOT run a second random selection.

#### Scenario: Modes show winner

- GIVEN a selected winner
- WHEN roulette, plinko, or slots presentation completes
- THEN it shows that winner with no second pick

### Requirement: Result shown as text

Winning label MUST appear as text. Color or canvas alone MUST NOT be the only result.

#### Scenario: Text result

- GIVEN revealed winner "Cafe Luna"
- WHEN the result is displayed
- THEN text includes Cafe Luna without relying on animation
