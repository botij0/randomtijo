import type { Mode } from '../domain/types'
import styles from './ModePicker.module.css'

const MODES: { value: Mode; label: string }[] = [
  { value: 'roulette', label: 'Roulette' },
  { value: 'slots', label: 'Slots' },
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
      <div className={styles.row} role="radiogroup" aria-label="Picker mode">
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
            {entry.label}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
