# Proposal: Animated Random Picker

## Proposal question round

Live questions skipped. Accepted defaults: fair client-only pick for in-person groups (one operator); 2–12 options; roulette/plinko/slots; equal chance; English; no accounts; `<2` blocks spin; reduced-motion skip; localStorage fail-open; first slice; theatrical Plinko (not physics).

## Intent

Fair, theatrical pick of one user-defined option at a table. No accounts or server.

## Scope

### In Scope
- Vite + React + TypeScript; Vitest + Testing Library
- Option editor: add/edit/remove; 2–12 non-empty labels
- `pickIndex` then CSS/SVG theater: roulette, theatrical SVG plinko, slots
- `useReducer` `idle | spinning | revealed`
- localStorage options + last mode (fail open)
- `prefers-reduced-motion` skip + `aria-live` winner

### Out of Scope
- Framer Motion, Matter.js, Next.js, Tailwind, router, weights, sound, share URLs, accounts, backend, physics Plinko, history, PWA, themes

## Capabilities

> Contract for `sdd-spec`. Main specs empty; all New.

### New Capabilities
- `option-editor`: define/edit/remove; min 2 / cap ~12; block invalid spin
- `random-pick`: equal-chance pick; injected RNG; spin lifecycle
- `picker-modes`: roulette, theatrical plinko, slots toward preselected winner
- `picker-persistence`: localStorage options + last mode; fail open

### Modified Capabilities
- None

## Approach

Scaffold Vite React TS. Pure `pickIndex(options, rng)` first (`crypto.getRandomValues` + rejection sampling; tests inject `rng`). Modes animate to `winnerId` only. CSS modules. After scaffold, enable Strict TDD in `openspec/config.yaml`. Files: `src/domain/pick.ts`, `src/state/pickerReducer.ts`, `src/persistence/localStore.ts`, `src/ui/` editor, banner, modes.

Chained PRs likely (`ask-on-risk`, 400 lines): (1) scaffold + domain/reducer, (2) editor + roulette, (3) plinko, (4) slots + a11y/persistence.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `package.json`, Vite, `index.html` | New | App + Vitest |
| `src/` | New | Domain, state, UI, modes |
| `openspec/config.yaml` testing | Modified | After Vitest: `tdd`, test/build |
| `openspec/specs/` | New | Four capabilities above |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Plinko becomes physics | Med | SVG path theater only |
| >400 authored lines | High | Chain PRs or size exception before apply |
| Strict TDD off until scaffold | High | Scaffold first, then enable TDD |
| Canvas-only winner / storage fail | Low/Med | DOM banner source of truth; fail open |

## Rollback Plan

Delete SPA (`package.json`, Vite config, `src/`, lockfile); revert `openspec/config.yaml` testing flags. Git revert (or reverse chained PRs) restores the empty repo. No server data; ignore leftover localStorage.

## Dependencies

- Node.js + npm (Vite/Vitest); browser `crypto.getRandomValues`, `localStorage`; no animation/physics libs

## Success Criteria

- [ ] 2–12 options, mode, spin, announced winner; equal chance; no re-roll; reduced-motion skip; persist options+mode; storage fails open
- [ ] No accounts, server, weights, sound, or share URLs
