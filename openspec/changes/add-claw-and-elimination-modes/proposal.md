# Proposal: Add Claw Machine and Elimination Board Modes

## Intent

Add two picker modes the user chose: a claw machine that grabs the winning prize, and an elimination board that knocks out every other option until the winner remains.

## Scope

### In Scope
- `claw-machine` mode: labeled prizes in a grid; claw aims, drops, grabs, and lifts the preselected winner.
- `elimination-board` mode: labeled lights; losers go dark one by one; winner stays lit.
- Mode picker, persistence, theater durations, App branches, README.
- Repeat spins reset, then play forward toward the new `winnerId`.

### Out of Scope
- Physics, sound, new dependencies, betting, or extra RNG.
- Changes to pick fairness, option bounds, reduced-motion skip, or aria-live.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `picker-modes`: MUST offer claw machine and elimination board; both MUST resolve to the preselected winner with no second pick.

## Approach

Keep result-first flow. `pickIndex` runs once in App. Each mode only animates toward `winnerId` with CSS transitions and sequenced timeouts. No second pick.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domain/types.ts` | Modified | Add `'claw-machine'` and `'elimination-board'` to `Mode` |
| `src/ui/modes/theater.ts` | Modified | Durations and claw/elimination timing constants |
| `src/ui/modes/ClawMachine.tsx` (+css, test) | New | Grid prizes, aim-drop-grab-lift |
| `src/ui/modes/EliminationBoard.tsx` (+css, test) | New | Sequential knockout of losers |
| `src/ui/ModePicker.tsx` (+test) | Modified | Two new radios |
| `src/persistence/localStore.ts` (+test) | Modified | Persist/restore both modes |
| `src/App.tsx` (+test) | Modified | Render both modes |
| `README.md` | Modified | List the new modes |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Two modes exceed 400-line review budget | High | Two work units; this session accepted as `size:exception` (user asked for both) |
| Claw miss-aligns on 2 vs 12 options | Med | Shared `clawColumns` / position helpers covered by unit tests |
| Repeat spin continues from the last pose | Med | Instant reset, then sequence forward (horse-race pattern) |

## Rollback Plan

Remove ClawMachine and EliminationBoard files. Drop the two `Mode` members from the union, picker, persistence, and `THEATER_MS`. Unknown stored modes already fail open via `isMode`.

## Dependencies

- None.

## Success Criteria

- [x] Mode picker offers both modes; locked while spinning.
- [x] Claw grabs only the preselected winner; elimination leaves only that winner lit; no second pick.
- [x] Repeat plays reset, then run forward again.
- [x] `bun run test` and `bunx tsc -b` pass.
