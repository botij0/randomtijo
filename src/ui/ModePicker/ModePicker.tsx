import type { Mode } from '../../domain/types'
import styles from './ModePicker.module.css'

const MODES: { value: Mode; label: string; mark: string }[] = [
  { value: 'roulette', label: 'Roulette', mark: '🎡' },
  { value: 'slots', label: 'Slots', mark: '🍒' },
  { value: 'horse-race', label: 'Horse race', mark: '🐎' },
  { value: 'claw-machine', label: 'Claw machine', mark: '🕹️' },
  { value: 'elimination-board', label: 'Elimination', mark: '💡' },
]

type ModePickerProps = {
  mode: Mode
  disabled: boolean
  onChange: (mode: Mode) => void
}

export default function ModePicker({ mode, disabled, onChange }: ModePickerProps) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend className={styles.legend}>Picker mode</legend>
      <div className={styles.grid} role="radiogroup" aria-label="Picker mode">
        {MODES.map((entry) => (
          <label key={entry.value} className={styles.choice} data-active={mode === entry.value}>
            <input
              type="radio"
              name="picker-mode"
              value={entry.value}
              checked={mode === entry.value}
              disabled={disabled}
              onChange={() => onChange(entry.value)}
            />
            <span className={styles.pip} aria-hidden="true" />
            <span className={styles.mark} aria-hidden="true">
              {entry.mark}
            </span>
            <span className={styles.name}>{entry.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
