import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { ELIMINATION_HOLD_MS, SLICE_COLORS, THEATER_MS, THEATER_RESET_MS } from '../theater'
import styles from './EliminationBoard.module.css'

type EliminationBoardProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}

export const ELIMINATION_SCAN_MS = 110

function hashSeed(text: string): number {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let next = Math.imul(state ^ (state >>> 15), 1 | state)
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export function eliminationOrder(
  optionIds: readonly string[],
  winnerId: string,
  playIndex: number,
): string[] {
  const losers = optionIds.filter((id) => id !== winnerId)
  const rng = mulberry32(hashSeed(`${winnerId}:${playIndex}:${losers.join(',')}`))
  const shuffled = [...losers]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swap]
    shuffled[swap] = current
  }
  if (shuffled.length >= 2 && shuffled.every((id, index) => id === losers[index])) {
    const first = shuffled[0]
    shuffled[0] = shuffled[1]
    shuffled[1] = first
  }
  return shuffled
}

export function eliminationAtMs(loserRank: number, loserCount: number): number {
  if (loserCount < 1) {
    return 0
  }
  const usable = THEATER_MS['elimination-board'] - ELIMINATION_HOLD_MS
  return Math.round(((loserRank + 1) / loserCount) * usable)
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
