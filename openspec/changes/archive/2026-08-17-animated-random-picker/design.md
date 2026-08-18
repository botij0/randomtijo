# Design: Animated Random Picker

Greenfield Vite React SPA: pick one of 2–12 options fairly, then play CSS/SVG theater. Specs were not in Engram or `openspec/changes/animated-random-picker/specs/` at design time; this follows proposal + explore locked choices. On disk today: `README.md`, OpenSpec bootstrap, Engram/CodeGraph config — **no** `package.json` or `src/`.

## Technical Approach

Scaffold Vite + React + TypeScript + Vitest + Testing Library + jsdom. Domain, reducer, and persistence stay animation-free. `pickIndex` runs first; modes only animate to `winnerId`. CSS modules. After scaffold, set `openspec/config.yaml` `testing.strict_tdd`, `test_command` (`npm test`), and `build_command` (`npm run build`).

## Architecture Decisions

| Topic | Options | Tradeoff | Decision |
|-------|---------|----------|----------|
| Stack | Vite SPA vs Next vs no-TS | Unused SSR; weaker contracts | Vite + React + TS + Vitest + TL + jsdom |
| Style | CSS modules vs Tailwind vs Framer | Extra deps; out of scope | CSS modules; no Tailwind/Framer/Matter |
| RNG | crypto+inject vs `Math.random` vs seeded URL | Untestable vs share-URL scope | `pickIndex` + `crypto.getRandomValues` rejection sampling; inject `rng` in tests |
| Third mode | Slots vs box vs cards | Weak process vs harder shuffle | Slot machine |
| State | `useReducer` vs Zustand vs per-mode | Duplicated RNG vs unused store | `useReducer` `idle \| spinning \| revealed` |
| Persist | localStorage vs none vs backend | Refresh wipe vs extra product | options + last mode; fail open |
| A11y | skip+live vs canvas-only | AT-opaque canvas | `prefers-reduced-motion` skip; `ResultBanner` `aria-live` is source of truth |
| Theater | CSS/SVG vs physics | Flaky fairness | Predetermined SVG Plinko; CSS roulette rotate; CSS slots reel |

## Data Flow

Result-first spin; no re-roll after `START_SPIN`.

```mermaid
sequenceDiagram
  actor User
  participant App
  participant Pick as pickIndex
  participant Reducer
  participant Mode as ModeView
  participant Banner as ResultBanner

  User->>App: Spin
  App->>App: require 2-12 non-empty labels
  App->>Pick: pickIndex(n, rng)
  Pick-->>App: index
  App->>Reducer: START_SPIN(winnerId)
  Note over Reducer: phase spinning; edits blocked
  alt prefers-reduced-motion
    App->>Reducer: COMPLETE_SPIN
  else theatrical
    App->>Mode: play toward winnerId
    Mode-->>App: onComplete
    App->>Reducer: COMPLETE_SPIN
  end
  Note over Reducer: phase revealed
  App->>Banner: announce winner (aria-live)
```

Load: `localStore.load()` → reducer init. Persist on options/mode change. Quota/private mode keeps in-memory state; UI stays usable.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx` | Create | Vite React TS + Vitest/jsdom scaffold |
| `src/domain/types.ts` | Create | `Mode`, `Option`, `SpinPhase`, `Rng`, `PickerState` |
| `src/domain/pick.ts` | Create | `pickIndex`; default crypto rng (rejection sampling) |
| `src/state/pickerReducer.ts` | Create | options/mode/phase/winnerId; START_SPIN / COMPLETE_SPIN / edits |
| `src/persistence/localStore.ts` | Create | load/save options+mode; catch and fail open |
| `src/ui/OptionEditor.tsx` | Create | add/edit/remove; disable while spinning |
| `src/ui/ModePicker.tsx` | Create | roulette / plinko / slots |
| `src/ui/ResultBanner.tsx` | Create | `aria-live` winner; DOM source of truth |
| `src/ui/modes/Roulette.tsx` | Create | CSS rotate to precomputed angle |
| `src/ui/modes/Plinko.tsx` | Create | SVG pegboard + predetermined path into winning slot |
| `src/ui/modes/Slots.tsx` | Create | CSS reel `translateY` to winner |
| `src/App.tsx` | Create | wire reducer, persistence, reduced-motion, mode view |
| `openspec/config.yaml` | Modify | After scaffold: `strict_tdd`, `test_command`, `build_command` |

No existing app files to modify or delete.

## Interfaces / Contracts

```ts
type Mode = 'roulette' | 'plinko' | 'slots'
type SpinPhase = 'idle' | 'spinning' | 'revealed'
type Option = { id: string; label: string }
type Rng = () => number // [0, 1)
function pickIndex(count: number, rng: Rng): number
```

Reducer owns `{ options, mode, phase, winnerId }`. Modes receive `winnerId` + `onComplete`; they MUST NOT call `pickIndex`. Spin disabled when fewer than 2 valid labels or `phase === 'spinning'`. Cap 12.

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `pickIndex` bounds; reducer lifecycle; `localStore` fail-open | Vitest; injected `rng`; storage throws |
| Integration | editor validation; idle→spinning→revealed; reduced-motion skip to banner | Testing Library + jsdom; `matchMedia` stub |
| E2E | none in first slice | No Playwright |

## Threat Matrix

N/A — client SPA with no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration. Greenfield. `ask-on-risk`; chained PRs likely: (1) scaffold + domain/reducer + config testing flags, (2) editor + roulette, (3) plinko, (4) slots + a11y/persistence.

## Open Questions

None. Specs were not yet available; locked proposal/explore choices are sufficient for apply.
