import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { SLICE_COLORS, THEATER_RESET_MS } from '../theater'
import styles from './EliminationBoard.module.css'
import { ELIMINATION_SCAN_MS, eliminationAtMs, eliminationOrder } from './eliminationUtils'

type EliminationBoardProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}


export default function EliminationBoard({ options, winnerId, phase }: EliminationBoardProps) {
  const spinning = phase === 'spinning' && winnerId !== null
  const raceToken = spinning ? winnerId : ''
  const playIndexRef = useRef(spinning ? 1 : 0)
  const eliminatedRef = useRef<Set<string>>(new Set())
  const [activeToken, setActiveToken] = useState(raceToken)
  const [eliminated, setEliminated] = useState<Set<string>>(() => new Set())
  const [hotId, setHotId] = useState<string | null>(null)

  if (raceToken !== activeToken) {
    if (raceToken) {
      playIndexRef.current += 1
    }
    setActiveToken(raceToken)
    setEliminated(new Set())
    setHotId(null)
  }

  eliminatedRef.current = eliminated
  const optionIds = options.map((option) => option.id)

  const revealedOut =
    phase === 'revealed' && winnerId
      ? new Set(options.filter((option) => option.id !== winnerId).map((option) => option.id))
      : null

  useEffect(() => {
    if (!spinning || !winnerId) {
      return
    }
    const knockout = eliminationOrder(optionIds, winnerId, playIndexRef.current)
    const timers = knockout.map((loserId, rank) =>
      window.setTimeout(() => {
        setEliminated((current) => {
          const next = new Set(current)
          next.add(loserId)
          return next
        })
      }, THEATER_RESET_MS + eliminationAtMs(rank, knockout.length)),
    )
    let tick = playIndexRef.current
    const scan = window.setInterval(() => {
      const remaining = optionIds.filter(
        (id) => id === winnerId || !eliminatedRef.current.has(id),
      )
      if (remaining.length === 0) {
        return
      }
      tick += 1
      setHotId(remaining[tick % remaining.length])
    }, ELIMINATION_SCAN_MS)
    return () => {
      window.clearInterval(scan)
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [spinning, winnerId, optionIds.join('|')])

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
                data-hot={!isOut && option.id === hotId}
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
