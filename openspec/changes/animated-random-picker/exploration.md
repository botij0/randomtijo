## Exploration: animated-random-picker

### Current State

Greenfield repository. On disk today: `README.md` (`# randomtijo`), SDD bootstrap (`openspec/config.yaml`, empty `openspec/specs/` and `openspec/changes/`), `.engram/config.json` (`project_name: randomtijo`), and `.atl/skill-registry.md`. No `package.json`, no `src/`, no test runner, no linter, no type checker.

Verified against Engram `sdd-init/randomtijo` (#6) and `sdd/randomtijo/testing-capabilities` (#7), and `openspec/config.yaml`:

- Detected stack: none.
- Intended future stack (not scaffolded): React + Vitest + Testing Library.
- `strict_tdd: false` because no runner exists; Strict TDD becomes available only after scaffold.
- Product intent: enter user-defined options, pick one at random, celebrate with animations. Required modes: classic roulette, plinko, plus at least one additional mode.
- Persistence mode: hybrid. Delivery strategy: `ask-on-risk`.
- CodeGraph index exists but has no application symbols (`codegraph_explore` returned none). Investigation used filesystem listing + OpenSpec + Engram, not app source.

There is no existing picker, animation, or state layer to extend. First implementation will create the app.

### Affected Areas

- `package.json` / Vite config / `index.html` — do not exist; first apply must scaffold the React app and test runner.
- `src/` (to be created) — entire product: domain picker, UI, mode views, styles.
- `openspec/config.yaml` `testing:` / `rules.apply.tdd` — after Vitest lands, later phases SHOULD flip Strict TDD on and set `test_command` / `build_command`.
- `openspec/specs/` — empty; first specs will be net-new domains (picker, modes, a11y), not deltas on existing behavior.
- No current application modules, tests, or CI to couple to.

### Approaches

#### 1. App scaffold

1. **Vite + React + TypeScript** — Official Vite React template, Vitest shares Vite config, matches recorded intended stack.
   - Pros: Fast HMR; first-class Vitest; small SPA with no server; TypeScript supports SDD contracts; user required React.
   - Cons: Must introduce the whole toolchain in the first apply batch; Strict TDD stays false until that lands.
   - Effort: Low

2. **Next.js (App Router) + React + TS** — Full-stack React framework.
   - Pros: Familiar React; routing/SSR ready if the product grows.
   - Cons: SPA picker does not need SSR, file routing, or a server; heavier than the problem; Vitest setup is less native than Vite.
   - Effort: Medium

3. **Vite + React + JavaScript (no TS)** — Faster typing, fewer config files.
   - Pros: Slightly less scaffold.
   - Cons: Weaker contracts for domain types (`Mode`, `SpinPhase`); fights the recorded Vitest/TS intent.
   - Effort: Low

#### 2. Animation strategy

1. **Result-first CSS/SVG theater (recommended pattern)** — RNG selects the winner, then CSS/SVG animates toward that outcome. Roulette = `transform: rotate`. Plinko = SVG pegboard + predetermined path into the winning slot. Slots = CSS `translateY` on a reel.
   - Pros: Fairness is unit-testable without animation; `prefers-reduced-motion` is a skip-to-result branch; no canvas a11y hole; no physics flakiness.
   - Cons: Plinko will look choreographed, not simulated; physics fans may want more later.
   - Effort: Medium

2. **Framer Motion / Motion** — React animation library for springs, presence, layout.
   - Pros: Nice mode transitions and reduced-motion helpers.
   - Cons: Extra dependency that does not solve Plinko collisions; CSS already covers roulette/slots; first-slice cost without unique payoff.
   - Effort: Medium

3. **Canvas + physics engine (Matter.js / Rapier) for Plinko** — Ball collides with pegs; visual path is simulated.
   - Pros: Most authentic Plinko.
   - Cons: High complexity; canvas is opaque to AT; tests are timing/flaky; if physics also *chooses* the winner, fairness is hard to prove and can disagree with “equal chance per option”; likely blows the 400-line review budget alone.
   - Effort: High

#### 3. Randomness

1. **Injected RNG + `crypto.getRandomValues` default** — `type Rng = () => number` in `[0, 1)`; production uses CSPRNG with rejection sampling to avoid modulo bias; tests inject a stub.
   - Pros: Uniform pick is a pure function; tests are deterministic; better entropy than `Math.random` for a fairness-sensitive group decision.
   - Cons: Must mock `crypto` in jsdom if tests call the default; not seed/replayable.
   - Effort: Low

2. **`Math.random()` directly in UI handlers** — Simplest.
   - Pros: Zero wrapper code.
   - Cons: Untestable without mocking globals everywhere; slight bias; animation code can accidentally re-roll.
   - Effort: Low

3. **Seeded PRNG + shareable seed** — Replay a spin via URL.
   - Pros: Debug and “share this outcome”.
   - Cons: Out of first-slice scope; invites “was it rigged?” UX if seed is visible.
   - Effort: Medium

#### 4. Third mode

1. **Slot machine (recommended)** — One reel (or three locked-together reels) of option labels; lands on the preselected winner.
   - Pros: Distinct from circular roulette and gravity plinko; CSS-only; same result-first contract; readable with 2–12 options by repeating labels.
   - Cons: Long labels wrap awkwardly on a reel; not a new domain of randomness.
   - Effort: Medium

2. **Mystery box / crate** — Lid opens, item pops out.
   - Pros: Cheap animation.
   - Cons: Weak “watching the process” compared with the two required modes; less product value.
   - Effort: Low

3. **Card shuffle / deal** — Cards shuffle then one flips.
   - Pros: Familiar.
   - Cons: Many options become a pile; shuffle animation is harder to follow; weaker celebration than slots.
   - Effort: Medium

#### 5. State model

1. **`useReducer` in the page root (recommended)** — Single state: `{ options, mode, phase, winnerId }`. Phases: `idle | spinning | revealed`. Spin: validate → pick winner → `spinning` → animation `onComplete` → `revealed`. Edits disabled while `spinning`.
   - Pros: Explicit lifecycle; easy to test reducer; no extra store library; modes are views over the same state.
   - Cons: Root owns more than a tiny demo.
   - Effort: Low

2. **Zustand / Redux** — Global store.
   - Pros: Devtools, if the tree grows.
   - Cons: One-page app does not need it.
   - Effort: Medium

3. **Per-mode local state with duplicated pick logic** — Each mode spins itself.
   - Pros: Modes feel independent.
   - Cons: RNG/fairness/a11y fork three ways; hard to guarantee result-first.
   - Effort: Medium (cost shows up as bugs)

#### 6. Persistence

1. **`localStorage` for options + last mode only (recommended)** — Restore editor after refresh. Do not persist spin history or winner.
   - Pros: Group at a table does not lose the restaurant list on accidental refresh; tiny hook; no backend.
   - Cons: Must test storage failure / private mode; schema version if fields change.
   - Effort: Low

2. **None in v1** — Memory-only.
   - Pros: Fewer tests and no storage edge cases.
   - Cons: Refresh wipes the list; cheap regret for a multi-person input flow.
   - Effort: Low

3. **Backend / accounts / share URLs** — Server of record.
   - Pros: Cross-device.
   - Cons: Entire extra product; not justified by the request.
   - Effort: High

#### 7. Accessibility and reduced motion

1. **Motion as progressive enhancement (recommended)** — `prefers-reduced-motion: reduce` skips animation, still picks, still reveals. `aria-live="polite"` announces the winner. Keyboard-complete option editor. Spin button disabled + labelled during `spinning`. Winner not color-only. No canvas as the only representation of the result.
   - Pros: Meets WCAG-minded baseline; same code path as tests that skip animation.
   - Cons: Reduced-motion users miss the “fun”; that is correct, not a defect.
   - Effort: Low–Medium

2. **Canvas-only modes with a text fallback** — Visual on canvas, result duplicated in DOM.
   - Pros: Can keep physics later.
   - Cons: Double rendering; easy to let canvas drift from announced result; first-slice waste.
   - Effort: High

#### 8. First product slice vs later

1. **Tight first slice (recommended)** — Scaffold Vite/React/TS + Vitest/Testing Library; domain `pickIndex`; option editor (add/remove/edit, min 2 non-empty labels, cap ~12); three modes (roulette, theatrical SVG plinko, slots); result-first animations; reduced-motion; live region; localStorage for options+mode; single page, no router, no sound, no weights.
   - Pros: Matches the user request; reviewable if chained; TDD can turn on after scaffold.
   - Cons: Plinko will not be a physics toy; no share/history.
   - Effort: Medium

2. **Physics Plinko + extras in v1** — Weights, sound, confetti lib, PWA, themes, share links.
   - Pros: More “wow”.
   - Cons: Exceeds 400-line review budget (`delivery_strategy: ask-on-risk`); Strict TDD still off until scaffold; high miss risk.
   - Effort: High

### Recommendation

Scaffold **Vite + React + TypeScript** with **Vitest**, **jsdom**, and **Testing Library** as the first implementation work. Do not use Next.js. Do not add Framer Motion or a physics engine in the first slice.

Treat animation as theater: a pure `pickIndex(options, rng)` runs first (default rng = `crypto.getRandomValues` mapped to `[0, 1)` with rejection sampling; tests inject `rng`). Modes only animate toward `winnerId`. Third mode: **slot machine**. State: one `useReducer` with `idle | spinning | revealed`. Persist **options + last mode** in `localStorage`. Honor **`prefers-reduced-motion`** by skipping to the revealed result and announcing it via **`aria-live`**.

Suggested first-slice shape for design:

```
src/
  domain/pick.ts          # pickIndex, createCryptoRng — no React
  domain/types.ts         # Mode, Option, SpinPhase
  state/pickerReducer.ts  # options/mode/phase/winnerId
  persistence/localStore.ts
  ui/OptionEditor.tsx
  ui/ModePicker.tsx
  ui/ResultBanner.tsx     # aria-live
  ui/modes/Roulette.tsx   # CSS rotate to precomputed angle
  ui/modes/Plinko.tsx     # SVG board + path into winning slot
  ui/modes/Slots.tsx      # CSS reel
  App.tsx
```

Styling: CSS modules (or plain CSS) + custom properties. No Tailwind unless design later wants it. No React Router.

**First slice:** scaffold + tests for `pickIndex` and reducer; option editor; three theatrical modes; reduced-motion; localStorage options+mode.

**Later:** Matter.js Plinko, weighted options, seeded share URLs, spin history, sound, themes, PWA.

After scaffold, update `openspec/config.yaml` testing so Strict TDD can be enabled (`tdd: true`, `test_command`, `build_command`).

Because `delivery_strategy` is `ask-on-risk` and three animated modes plus scaffold will likely exceed 400 authored lines, proposal/tasks SHOULD plan chained PRs: (1) scaffold + domain/reducer, (2) editor + roulette, (3) plinko, (4) slots + a11y/persistence polish — or an explicit size exception.

### Risks

- Plinko scope creep into a physics engine; keep SVG path theater in v1.
- Three modes + Vite scaffold likely exceed the 400-line review budget; chain PRs or get an exception before apply.
- `strict_tdd: false` until Vitest exists; first apply batch is scaffold-heavy, not RED-GREEN feature work.
- If a later phase puts the result only on canvas, screen readers lose the winner; DOM `ResultBanner` must remain source of truth.
- `crypto.getRandomValues` in tests needs an injected `rng`, not ad-hoc `Math.random` spies in components.
- Option-count UX: roulette and slots degrade above ~12 labels; cap and validate in spec, do not leave unbounded.
- localStorage quota/private mode must not brick the editor (fail open to in-memory).

### Ready for Proposal

Yes. The request, stack intent, and first-slice boundary are clear. Orchestrator should tell the user: explore recommends Vite+React+TS, result-first CSS/SVG animations, crypto RNG with injection, slot machine as the third mode, reducer state, localStorage for options+mode, and reduced-motion skips. Next phase is `sdd-propose` for `animated-random-picker`. Do not scaffold the app until apply.
