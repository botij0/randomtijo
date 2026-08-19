# Tasks: Add Horse Race Mode

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~320–380 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | none |

Decision needed before apply: No
Chained PRs recommended: No
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Horse race mode + wiring | PR 1 | `npm test -- src/ui/modes/HorseRace src/ui/ModePicker src/persistence/localStore src/App.test` | `npm run dev` — pick Horse race, spin twice | HorseRace files + `'horse-race'` union member |

## Phase 1: Domain + tests (RED)

- [x] 1.1 RED: `HorseRace.test.tsx` — no `pickIndex`; winner shortest duration; onComplete after winner arrives; repeat race resets then runs.
- [x] 1.2 RED: ModePicker switches to horse race while idle; spinning rejects the switch.
- [x] 1.3 RED: localStore restores `horse-race`; App shows the track when chosen.

## Phase 2: Implementation (GREEN)

- [x] 2.1 GREEN: `Mode = 'roulette' \| 'slots' \| 'horse-race'`; `THEATER_MS['horse-race'] = 4000`; persist in `MODES`.
- [x] 2.2 GREEN: `HorseRace.tsx` + CSS — lanes, labels, `horseDurationMs`, reset-then-run, `onComplete`.
- [x] 2.3 GREEN: ModePicker radio, App branch, README.

## Phase 3: Verification

- [x] 3.1 `npm test` and `npx tsc -b` green.
