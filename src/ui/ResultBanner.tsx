import type { Option, SpinPhase } from '../domain/types'
import styles from './ResultBanner.module.css'

type ResultBannerProps = {
  phase: SpinPhase
  winner: Option | null
}

export default function ResultBanner({ phase, winner }: ResultBannerProps) {
  const text =
    phase === 'revealed' && winner
      ? `Winner: ${winner.label}`
      : phase === 'spinning'
        ? 'The table is deciding…'
        : 'Add your options, pick a mode, then spin.'

  return (
    <div className={styles.banner} role="status" aria-live="polite" aria-atomic="true">
      {text}
    </div>
  )
}
