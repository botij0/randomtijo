# Tasks: Animated Random Picker

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 900–1300 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 → PR 4 |
| Delivery strategy | exception-ok |
| Chain strategy | size-exception |

Decision needed before apply: No
Chained PRs recommended: Yes
Chain strategy: size-exception
400-line budget risk: High

Orchestrator resolution: maintainer requested full first-slice implementation in-session (no GitHub PRs). `size:exception` accepted.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Scaffold + domain/reducer | PR 1 | `npm test -- src/domain src/state` | `npm run dev` boots | `package.json`, Vite/TS configs, `src/domain/*`, `pickerReducer.ts`, config testing flags |
| 2 | Editor + roulette | PR 2 | `npm test -- src/ui/OptionEditor src/ui/ModePicker src/ui/modes/Roulette` | `npm run dev`: add 2+ options, roulette spin | `OptionEditor.tsx`, `ModePicker.tsx`, `Roulette.tsx`, App editor/roulette wiring |
| 3 | Plinko | PR 3 | `npm test -- src/ui/modes/Plinko` | `npm run dev`: plinko spin to preselected winner | `Plinko.tsx` + App plinko branch |
| 4 | Slots + a11y/persistence | PR 4 | `npm test -- src/ui/modes/Slots src/ui/ResultBanner src/persistence src/App` | `npm run dev`: slots, reduced-motion skip, reload restores options+mode not winner | `Slots.tsx`, `ResultBanner.tsx`, `localStore.ts`, a11y/persist wiring in `App.tsx` |

## Phase 1: Scaffold + domain/reducer (PR 1)

- [x] 1.1 Create Vite React TS + Vitest + Testing Library: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`.
- [x] 1.2 Document `npm install && npm run dev` and `npm test` in `README.md`.
- [x] 1.3 Set `openspec/config.yaml` `testing.strict_tdd`, `test_command` (`npm test`), `build_command` (`npm run build`).
- [x] 1.4 Create `src/domain/types.ts` (`Mode`, `Option`, `SpinPhase`, `Rng`, `PickerState`).
- [x] 1.5 RED: Vitest `pickIndex` bounds and injected rng (`src/domain/pick.test.ts`).
- [x] 1.6 GREEN: `src/domain/pick.ts` (crypto rejection sampling; inject `Rng`).
- [x] 1.7 RED: reducer lifecycle, edit lock, <2 valids idle, cap 12 (`src/state/pickerReducer.test.ts`).
- [x] 1.8 GREEN: `src/state/pickerReducer.ts` (options/mode/phase/winnerId; START_SPIN/COMPLETE_SPIN/edits).

## Phase 2: Editor + roulette (PR 2)

- [x] 2.1 RED: idle add/edit/remove, spinning lock, blank blocks spin, cap 12 (`src/ui/OptionEditor.test.tsx`).
- [x] 2.2 GREEN: `src/ui/OptionEditor.tsx`; disable while spinning.
- [x] 2.3 RED: idle switch to plinko; spinning roulette rejects slots (`src/ui/ModePicker.test.tsx`).
- [x] 2.4 GREEN: `src/ui/ModePicker.tsx` (roulette/plinko/slots).
- [x] 2.5 RED: Roulette completes toward given `winnerId` with no second pick.
- [x] 2.6 GREEN: `src/ui/modes/Roulette.tsx` CSS rotate; wire into `src/App.tsx`.

## Phase 3: Plinko (PR 3)

- [x] 3.1 RED: Plinko resolves to given `winnerId`; MUST NOT call `pickIndex`.
- [x] 3.2 GREEN: `src/ui/modes/Plinko.tsx` SVG predetermined path; App plinko branch.

## Phase 4: Slots + a11y/persistence (PR 4)

- [x] 4.1 RED: Slots reel to given `winnerId`; no second pick.
- [x] 4.2 GREEN: `src/ui/modes/Slots.tsx` CSS `translateY`.
- [x] 4.3 RED: `ResultBanner` aria-live text ("Cafe Luna"); reduced-motion skip still reveals.
- [x] 4.4 GREEN: `src/ui/ResultBanner.tsx`; `App.tsx` reduced-motion skip.
- [x] 4.5 RED: `localStore` restore A,B,C+slots; no winner/history; throw → fail-open.
- [x] 4.6 GREEN: `src/persistence/localStore.ts`; `App.tsx` load/save options+mode.
