import type { Option } from '../domain/types'
import styles from './OptionEditor.module.css'

type OptionEditorProps = {
  options: Option[]
  disabled: boolean
  canAdd: boolean
  onAdd: () => void
  onChange: (id: string, label: string) => void
  onRemove: (id: string) => void
}

export default function OptionEditor({
  options,
  disabled,
  canAdd,
  onAdd,
  onChange,
  onRemove,
}: OptionEditorProps) {
  return (
    <section className={styles.panel} aria-labelledby="options-heading">
      <h2 id="options-heading" className={styles.heading}>
        Options
      </h2>
      <ol className={styles.list}>
        {options.map((option, index) => {
          const n = index + 1
          return (
            <li key={option.id} className={styles.row}>
              <label className={styles.label} htmlFor={`option-${option.id}`}>
                Option {n}
              </label>
              <input
                id={`option-${option.id}`}
                className={styles.input}
                value={option.label}
                disabled={disabled}
                aria-label={`Option ${n} label`}
                onChange={(event) => onChange(option.id, event.target.value)}
              />
              <button
                type="button"
                className={styles.remove}
                disabled={disabled}
                aria-label={`Remove option ${n}`}
                onClick={() => onRemove(option.id)}
              >
                Remove
              </button>
            </li>
          )
        })}
      </ol>
      <button
        type="button"
        className={styles.add}
        disabled={disabled || !canAdd}
        aria-label="Add option"
        onClick={onAdd}
      >
        Add option
      </button>
    </section>
  )
}
