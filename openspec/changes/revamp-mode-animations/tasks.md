# Tasks: Revamp Mode Animations

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~350–450 |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | single PR (size:exception accepted by maintainer) |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: size-exception
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Full animation revamp in one PR | PR 1 | `npm test` | `npm run dev` — 3 spins per mode, plinko drop, Enter-to-add | `git revert` — presentation-layer files only; reducer/persistence untouched |

## Phase 1: Foundation — theater constants

- [x] 1.1 RED: update the three mode tests to read `THEATER_MS.{roulette,plinko,slots}` map — fails while it is still a scalar.
- [x] 1.2 GREEN: `src/ui/modes/theater.ts` — `THEATER_MS: Record<Mode, number>` `{roulette:4000, plinko:3000, slots:3000}`; export `ROULETTE_TURNS=5`, `SLOT_LOOPS=3`.

## Phase 2: Roulette cumulative rotation

- [x] 2.1 RED: `src/ui/modes/Roulette.test.tsx` — 3 sequential spins (incl. same winner) strictly increase `targetRotation`.
- [x] 2.2 GREEN: `src/ui/modes/Roulette.tsx` — `rotationRef` + `targetRotation(currentDeg, winnerIndex, count)`; duration inline from map (no CSS change expected).

## Phase 3: Slots cumulative reel + snap

- [x] 3.1 RED: `src/ui/modes/Slots.test.tsx` — repeat spins strictly increase `reelOffset`; settle position congruent to winner.
- [x] 3.2 GREEN: `src/ui/modes/Slots.tsx` — `positionRef`, `reelOffset()`, 0ms reveal snap to `winnerIndex*H`, `LOOPS+2` copies; `Slots.module.css` `.blur` + overshoot ease.

## Phase 4: Plinko real bounce path

- [x] 4.1 RED: `src/ui/modes/Plinko.test.tsx` — path has ≥ ROWS segments, final x = winner slot center, no `[class*=ghostPath]`, injected rng determinism.
- [x] 4.2 GREEN: `src/ui/modes/Plinko.tsx` — `bouncePath()` feasibility-guarded rng; delete ghostPath; peg hit flash + winner slot pulse; `Plinko.module.css` drop `.ghostPath`, add `.pegHit`/`.slotWin` + reduced-motion guards.

## Phase 5: Editor + celebration polish

- [x] 5.1 RED: `src/ui/OptionEditor.test.tsx` — Enter adds option; no-op at 12-cap, blank label, or while spinning.
- [x] 5.2 GREEN: `src/ui/OptionEditor.tsx` — `onKeyDown` Enter → `onAdd()` when `canAdd && !disabled`; per-index placeholders.
- [x] 5.3 RED: `src/ui/ResultBanner.test.tsx` — assert `data-phase="revealed"` celebration hook.
- [x] 5.4 GREEN: `ResultBanner.tsx` + `ResultBanner.module.css` — `data-phase`, pop keyframe, 6 confetti spans; `App.tsx` + `App.module.css` — spin button `data-spinning`/`aria-busy` + idle pulse; all reduced-motion gated.

## Phase 6: Verification

- [x] 6.1 `npm test`, `npm run build`, and `npx tsc -b` all green.
- [x] 6.2 Visual smoke via `npm run dev`: 3 consecutive spins per mode move forward; plinko zig-zags with no result preview; reduced-motion skips animation; Enter adds an option.
