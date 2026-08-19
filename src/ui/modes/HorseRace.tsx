import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { HORSE_RACE_STAGGER_MS, SLICE_COLORS, THEATER_MS } from './theater'
import styles from './HorseRace.module.css'

type HorseRaceProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

export const HORSE_RACE_RESET_MS = 40

const GATE_LEFT = '0.35rem'
const FINISH_LEFT = 'calc(100% - 7.5rem)'

export function horseDurationMs(
  optionId: string,
  winnerId: string,
  optionIndex: number,
  winnerIndex: number,
): number {
  const winnerMs = THEATER_MS['horse-race']
  if (optionId === winnerId) {
    return winnerMs
  }
  const loserRank = optionIndex < winnerIndex ? optionIndex : optionIndex - 1
  return winnerMs + HORSE_RACE_STAGGER_MS * (loserRank + 1)
}

export default function HorseRace({ options, winnerId, phase, onComplete }: HorseRaceProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const raceToken = spinning ? winnerId : ''
  const [activeToken, setActiveToken] = useState(raceToken)
  const [armed, setArmed] = useState(false)

  if (raceToken !== activeToken) {
    setActiveToken(raceToken)
    setArmed(false)
  }

  const atFinish = phase === 'revealed' || (spinning && armed)

  useEffect(() => {
    finished.current = false
  }, [winnerId, phase])

  useEffect(() => {
    if (!spinning) {
      return
    }
    const arm = window.setTimeout(() => {
      setArmed(true)
    }, HORSE_RACE_RESET_MS)
    return () => window.clearTimeout(arm)
  }, [spinning, winnerId])

  useEffect(() => {
    if (!spinning) {
      return
    }
    const timer = window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true
        onCompleteRef.current()
      }
    }, HORSE_RACE_RESET_MS + THEATER_MS['horse-race'])
    return () => window.clearTimeout(timer)
  }, [spinning, winnerId])

  return (
    <div
      className={styles.stage}
      data-testid="horse-race"
      data-winner-id={winnerId ?? ''}
    >
      <div className={styles.board}>
        <div className={styles.banner}>
          <span>Start</span>
          <span>Horse race</span>
          <span>Finish</span>
        </div>
        <div className={styles.track} data-testid="horse-race-track">
          <div className={styles.finish} aria-hidden="true" />
          {options.map((option, index) => {
            const isWinner = option.id === winnerId
            const duration = winnerId
              ? horseDurationMs(option.id, winnerId, index, winnerIndex)
              : 0
            return (
              <div key={option.id} className={styles.lane}>
                <div
                  className={styles.horse}
                  data-testid={`horse-${option.id}`}
                  data-running={atFinish}
                  data-winner={phase === 'revealed' && isWinner}
                  style={{
                    left: atFinish ? FINISH_LEFT : GATE_LEFT,
                    transitionDuration: atFinish && spinning ? `${duration}ms` : '0ms',
                    ['--saddle' as string]: SLICE_COLORS[index % SLICE_COLORS.length],
                  }}
                >
                  <span className={styles.label}>{option.label}</span>
                  <span className={styles.sprite} aria-hidden="true">
                    🐎
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
