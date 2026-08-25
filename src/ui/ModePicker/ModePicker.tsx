import { MODES } from '../../domain/modes'
import type { Mode } from '../../domain/types'
import styles from './ModePicker.module.css'

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
          <label key={entry.id} className={styles.choice} data-active={mode === entry.id}>
            <input
              type="radio"
              name="picker-mode"
              value={entry.id}
              checked={mode === entry.id}
              disabled={disabled}
              onChange={() => onChange(entry.id)}
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
