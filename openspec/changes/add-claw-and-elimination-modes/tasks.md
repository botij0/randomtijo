# Tasks: Add Claw Machine and Elimination Board Modes

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~700–900 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 claw machine; PR 2 elimination board |
| Delivery strategy | ask-on-risk |
| Chain strategy | none (single working tree; `size:exception`) |

Decision needed before apply: No — maintainer asked to implement both in this session (`size:exception`).
Chained PRs recommended: Yes (if later split for review)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Claw machine + shared Mode union | PR 1 | `bun run test -- src/ui/modes/ClawMachine src/ui/ModePicker src/persistence/localStore src/App.test` | `bun run dev` — pick Claw machine, spin twice | ClawMachine files + `'claw-machine'` |
| 2 | Elimination board | PR 2 | `bun run test -- src/ui/modes/EliminationBoard src/ui/ModePicker src/App.test` | `bun run dev` — pick Elimination, spin twice | EliminationBoard files + `'elimination-board'` |

## Phase 1: Claw machine (RED then GREEN)

- [x] 1.1 RED: `ClawMachine.test.tsx` — no `pickIndex`; aim/drop/grab/lift the given winner; onComplete after theater; repeat resets to rest.
- [x] 1.2 RED: ModePicker switches to claw machine while idle; spinning rejects the switch. localStore restores `claw-machine`. App shows the cabinet when chosen.
- [x] 1.3 GREEN: `Mode` includes `'claw-machine'`; `THEATER_MS` + claw constants; persist in `MODES`.
- [x] 1.4 GREEN: `ClawMachine.tsx` + CSS — grid prizes, sequenced claw, reset-then-run, `onComplete`.
- [x] 1.5 GREEN: ModePicker radio, App branch.

## Phase 2: Elimination board (RED then GREEN)

- [x] 2.1 RED: `EliminationBoard.test.tsx` — no `pickIndex`; losers darken in order; winner stays lit; onComplete after theater; repeat starts fully lit.
- [x] 2.2 RED: ModePicker switches to elimination board while idle; spinning rejects the switch. localStore restores `elimination-board`. App shows the board when chosen.
- [x] 2.3 GREEN: `Mode` includes `'elimination-board'`; `THEATER_MS` + hold constant; persist in `MODES`.
- [x] 2.4 GREEN: `EliminationBoard.tsx` + CSS — labeled lights, staggered knockout, reset-then-run, `onComplete`.
- [x] 2.5 GREEN: ModePicker radio, App branch, README.

## Phase 3: Verification

- [x] 3.1 `bun run test` and `bunx tsc -b` green.
