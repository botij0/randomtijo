# Proposal: Add Horse Race Mode

## Intent

Add a third picker mode: a horse race. Each entered option is a horse. The preselected winner is the horse that reaches the finish line first.

## Scope

### In Scope
- New `horse-race` mode: one lane per valid option, labeled horses, finish-first theater.
- Mode picker, persistence, and theater duration map include `horse-race`.
- Repeat spins reset to the start gate, then race again toward the preselected winner.

### Out of Scope
- Physics engines, betting, sound, or new dependencies.
- Changes to pick fairness, option bounds, reduced-motion skip, or aria-live.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `picker-modes`: MUST offer horse race alongside roulette and slots; horse race MUST resolve to the preselected winner by arriving first.

## Approach

Keep result-first flow. `pickIndex` runs once; HorseRace only animates toward `winnerId`. Winner duration is `THEATER_MS['horse-race']`; other horses use longer CSS transitions so they finish later. No second pick.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/domain/types.ts` | Modified | Add `'horse-race'` to `Mode` |
| `src/ui/modes/theater.ts` | Modified | Duration for horse race |
| `src/ui/modes/HorseRace.tsx` (+css, test) | New | Track, lanes, finish-first animation |
| `src/ui/ModePicker.tsx` (+test) | Modified | Horse race choice |
| `src/persistence/localStore.ts` (+test) | Modified | Persist/restore `horse-race` |
| `src/App.tsx` (+test) | Modified | Render HorseRace |
| `README.md` | Modified | Mention horse race |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| 12 compact lanes overflow the stage | Low | Compact lane height; track scrolls if needed |
| Repeat spin from the finish line looks like a reverse | Med | Instant reset to the gate, then animate forward |

## Rollback Plan

Remove HorseRace files and drop `'horse-race'` from `Mode`, the picker, persistence, and `THEATER_MS`. No data migration; stored `horse-race` already fails open to defaults via `isMode`.

## Dependencies

- None.

## Success Criteria

- [x] Mode picker offers Horse race; it is locked while spinning.
- [x] Each option appears as a labeled horse; the preselected winner arrives first; no second pick.
- [x] Repeat races reset and run forward again.
- [x] `npm test` and `npx tsc -b` pass.
