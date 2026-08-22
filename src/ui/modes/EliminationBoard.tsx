import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { ELIMINATION_HOLD_MS, SLICE_COLORS, THEATER_MS } from './theater'
import styles from './EliminationBoard.module.css'

type EliminationBoardProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

export const ELIMINATION_RESET_MS = 40

export function eliminationAtMs(loserRank: number, loserCount: number): number {
  if (loserCount < 1) {
    return 0
  }
  const usable = THEATER_MS['elimination-board'] - ELIMINATION_HOLD_MS
  return Math.round(((loserRank + 1) / loserCount) * usable)
}

export default function EliminationBoard({
  options,
  winnerId,
  phase,
  onComplete,
}: EliminationBoardProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const spinning = phase === 'spinning' && winnerId !== null
  const raceToken = spinning ? winnerId : ''
  const [activeToken, setActiveToken] = useState(raceToken)
  const [eliminated, setEliminated] = useState<Set<string>>(() => new Set())

  if (raceToken !== activeToken) {
    setActiveToken(raceToken)
    setEliminated(new Set())
  }

  const revealedOut =
    phase === 'revealed' && winnerId
      ? new Set(options.filter((option) => option.id !== winnerId).map((option) => option.id))
      : null

  useEffect(() => {
    finished.current = false
  }, [winnerId, phase])

  useEffect(() => {
    if (!spinning || !winnerId) {
      return
    }
    const knockout = options.filter((option) => option.id !== winnerId)
    const timers = knockout.map((loser, rank) =>
      window.setTimeout(() => {
        setEliminated((current) => {
          const next = new Set(current)
          next.add(loser.id)
          return next
        })
      }, ELIMINATION_RESET_MS + eliminationAtMs(rank, knockout.length)),
    )
    timers.push(
      window.setTimeout(() => {
        if (!finished.current) {
          finished.current = true
          onCompleteRef.current()
        }
      }, ELIMINATION_RESET_MS + THEATER_MS['elimination-board']),
    )
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [spinning, winnerId])

  return (
    <div
      className={styles.stage}
      data-testid="elimination-board"
      data-winner-id={winnerId ?? ''}
    >
      <div className={styles.board}>
        <div className={styles.banner}>Elimination</div>
        <div className={styles.grid} style={{ ['--cols' as string]: String(Math.min(4, Math.max(1, options.length))) }}>
          {options.map((option, index) => {
            const isWinner = option.id === winnerId
            const isOut = revealedOut ? revealedOut.has(option.id) : eliminated.has(option.id)
            return (
              <div
                key={option.id}
                className={styles.light}
                data-testid={`light-${option.id}`}
                data-eliminated={isOut}
                data-survived={phase === 'revealed' && isWinner}
                style={{ ['--glow' as string]: SLICE_COLORS[index % SLICE_COLORS.length] }}
              >
                {option.label}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
