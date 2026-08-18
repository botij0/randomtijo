# Proposal: Revamp Mode Animations

## Intent

All three picker modes ship broken or fake theater. Roulette and slots target ABSOLUTE rotation/offset values, so spins after the first rotate backwards or snap. Plinko slides the ball down a straight ramp and leaks the result via a dashed ghost path. The result-first architecture is sound; the animation layer is not. This change fixes repeat-spin correctness and makes each mode feel real, with broad UI/UX polish.

## Scope

### In Scope
- Roulette: cumulative rotation that always advances from the current angle.
- Plinko: zig-zag bounce path through peg rows landing on the preselected winning slot; remove ghost path; highlight landing slot.
- Slots: cumulative reel position that always advances forward; motion blur; settle bounce.
- Shared UX: spin button states, result celebration polish, per-mode spin durations, editor Enter-to-add.

### Out of Scope
- Physics engines or any new runtime dependency (CSS/SVG/rAF only).
- Changes to pick fairness, reducer, persistence, or option bounds (2-12, locks, reduced motion, aria-live).
- New modes, sound, or confetti libraries.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `picker-modes`: repeat spins MUST animate forward and resolve to the preselected winner; plinko MUST simulate peg bounces and MUST NOT preview the result.
- `random-pick`: clarify animation randomness is presentation-only and MUST NOT re-roll the winner.
- `option-editor`: Enter key SHOULD add the current label.

## Approach

- Keep result-first flow: `pickIndex` runs once; modes animate to `winnerId` only.
- Roulette/Slots: compute the next target as `current + fullTurns + deltaToWinner` so every spin advances.
- Plinko: generate a random left/right bounce sequence constrained to end at the winning column; animate with rAF along peg rows; highlight the landing slot on settle.
- Polish via CSS modules (transitions, blur, celebration states); preserve reduced-motion skip.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/ui/modes/Roulette.tsx` (+css, test) | Modified | Cumulative rotation fix; spin duration |
| `src/ui/modes/Slots.tsx` (+css, test) | Modified | Cumulative reel offset; blur; settle bounce |
| `src/ui/modes/Plinko.tsx` (+css, test) | Modified | Real bounce path; remove ghostPath; slot highlight |
| `src/ui/OptionEditor.tsx` (+test) | Modified | Enter-to-add micro-UX |
| `src/ui/ResultBanner.tsx`, `src/ui/ModePicker.tsx` | Modified | Celebration + spin-button state polish |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Constrained plinko path looks unnatural at edge columns | Med | Randomize among all paths ending at the winner column; per-row jitter |
| JS animation jank on slow devices | Low | rAF with transform/opacity only; reduced-motion skip preserved |
| Existing tests assert old absolute-target behavior | Med | Update mode tests alongside fixes (strict TDD per config) |

## Rollback Plan

Pure presentation-layer change: `git revert` the change commit restores prior behavior. Reducer, persistence, and spec invariants are untouched; no data migration or persisted-state changes.

## Dependencies

- None (no new packages).

## Success Criteria

- [ ] Three or more consecutive roulette and slots spins always rotate/scroll forward and land on the preselected winner.
- [ ] Plinko ball bounces through peg rows, lands in the winning slot, with no result preview.
- [ ] Reduced-motion preference still reveals the winner with skipped/shortened animation.
- [ ] Pressing Enter in the editor adds the current label.
- [ ] `npm test` and `npx tsc -b` pass.
