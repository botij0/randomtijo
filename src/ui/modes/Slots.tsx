import { useEffect, useMemo, useRef } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { THEATER_MS } from './theater'
import styles from './Slots.module.css'

type SlotsProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

export const SLOT_ITEM_HEIGHT = 64
const LOOPS = 3

export function reelOffset(winnerIndex: number, count: number): number {
  const indexInLastLoop = count * (LOOPS - 1) + winnerIndex
  return indexInLastLoop * SLOT_ITEM_HEIGHT
}

export default function Slots({ options, winnerId, phase, onComplete }: SlotsProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const items = useMemo(() => {
    const copies: Option[] = []
    for (let loop = 0; loop < LOOPS; loop += 1) {
      copies.push(...options)
    }
    return copies
  }, [options])
  const offset = options.length === 0 ? 0 : reelOffset(winnerIndex, options.length)

  useEffect(() => {
    finished.current = false
  }, [winnerId, phase])

  useEffect(() => {
    if (!spinning) {
      return
    }
    const timer = window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true
        onCompleteRef.current()
      }
    }, THEATER_MS)
    return () => window.clearTimeout(timer)
  }, [spinning, winnerId])

  const translate = spinning || phase === 'revealed' ? offset : 0

  return (
    <div
      className={styles.stage}
      data-testid="slots"
      data-winner-id={winnerId ?? ''}
    >
      <div className={styles.frame}>
        <div className={styles.window}>
          <div
            className={styles.reel}
            data-testid="slots-reel"
            style={{
              transform: `translateY(${-translate}px)`,
              transitionDuration: spinning ? `${THEATER_MS}ms` : '0ms',
            }}
          >
            {items.map((option, index) => (
              <div
                key={`${option.id}-${index}`}
                className={styles.item}
                data-label={option.label}
                style={{ height: SLOT_ITEM_HEIGHT }}
              >
                {option.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
