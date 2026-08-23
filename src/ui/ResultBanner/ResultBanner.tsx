import type { Option, SpinPhase } from '../../domain/types'
import styles from './ResultBanner.module.css'

type ResultBannerProps = {
  phase: SpinPhase
  winner: Option | null
}

const CONFETTI_COUNT = 6

export default function ResultBanner({ phase, winner }: ResultBannerProps) {
  const text =
    phase === 'revealed' && winner
      ? `Winner: ${winner.label}`
      : phase === 'spinning'
        ? 'The table is deciding…'
        : 'Add your options, pick a mode, then spin.'

  const celebrating = phase === 'revealed' && winner !== null

  return (
    <div
      className={styles.banner}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      data-phase={phase}
    >
      {text}
      {celebrating
        ? Array.from({ length: CONFETTI_COUNT }, (_, index) => (
            <span key={index} className={styles.confetti} aria-hidden="true" />
          ))
        : null}
    </div>
  )
}
