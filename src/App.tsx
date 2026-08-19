import { useEffect, useReducer, useState } from 'react'
import { validOptions } from './domain/options'
import { pickIndex } from './domain/pick'
import { loadPicker, savePicker } from './persistence/localStore'
import { canSpin, createInitialState, MAX_OPTIONS, pickerReducer } from './state/pickerReducer'
import ModePicker from './ui/ModePicker'
import OptionEditor from './ui/OptionEditor'
import HorseRace from './ui/modes/HorseRace'
import Roulette from './ui/modes/Roulette'
import Slots from './ui/modes/Slots'
import ResultBanner from './ui/ResultBanner'
import styles from './App.module.css'

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return reduced
}

function initState() {
  const loaded = loadPicker()
  if (!loaded) {
    return createInitialState()
  }
  return createInitialState({
    options: loaded.options,
    mode: loaded.mode,
    phase: 'idle',
    winnerId: null,
  })
}

export default function App() {
  const reducedMotion = usePrefersReducedMotion()
  const [state, dispatch] = useReducer(pickerReducer, undefined, initState)
  const spinning = state.phase === 'spinning'
  const winner = state.options.find((option) => option.id === state.winnerId) ?? null
  const playable = validOptions(state.options)

  useEffect(() => {
    savePicker({ options: state.options, mode: state.mode })
  }, [state.options, state.mode])

  useEffect(() => {
    if (state.phase === 'spinning' && reducedMotion) {
      dispatch({ type: 'COMPLETE_SPIN' })
    }
  }, [state.phase, reducedMotion])

  function handleSpin() {
    if (!canSpin(state)) {
      return
    }
    const index = pickIndex(playable.length)
    dispatch({ type: 'START_SPIN', winnerId: playable[index].id })
  }

  return (
    <div className={styles.page}>
      <div className={styles.lights} aria-hidden="true" />
      <header className={styles.header}>
        <p className={styles.kicker}>Arcade table picker</p>
        <h1 className={styles.title}>Randomtijo</h1>
        <p className={styles.tagline}>The table decides. You just spin.</p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <OptionEditor
            options={state.options}
            disabled={spinning}
            canAdd={state.options.length < MAX_OPTIONS}
            onAdd={() => dispatch({ type: 'ADD_OPTION', id: crypto.randomUUID() })}
            onChange={(id, label) => dispatch({ type: 'UPDATE_OPTION', id, label })}
            onRemove={(id) => dispatch({ type: 'REMOVE_OPTION', id })}
          />
          <ModePicker
            mode={state.mode}
            disabled={spinning}
            onChange={(mode) => dispatch({ type: 'SET_MODE', mode })}
          />
        </aside>
        <main className={styles.stage}>
          <div className={styles.theater}>
            {state.mode === 'roulette' ? (
              <Roulette
                options={playable}
                winnerId={state.winnerId}
                phase={state.phase}
                onComplete={() => dispatch({ type: 'COMPLETE_SPIN' })}
              />
            ) : null}
            {state.mode === 'slots' ? (
              <Slots
                options={playable}
                winnerId={state.winnerId}
                phase={state.phase}
                onComplete={() => dispatch({ type: 'COMPLETE_SPIN' })}
              />
            ) : null}
            {state.mode === 'horse-race' ? (
              <HorseRace
                options={playable}
                winnerId={state.winnerId}
                phase={state.phase}
                onComplete={() => dispatch({ type: 'COMPLETE_SPIN' })}
              />
            ) : null}
          </div>
          <button
            type="button"
            className={styles.spin}
            disabled={!canSpin(state)}
            onClick={handleSpin}
            data-spinning={spinning}
            aria-busy={spinning}
          >
            {spinning ? 'Spinning…' : 'Spin!'}
          </button>
          <ResultBanner phase={state.phase} winner={winner} />
        </main>
      </div>
    </div>
  )
}
