import { useEffect, useMemo, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { SLOT_LOOPS, THEATER_MS } from '../theater'
import styles from './Slots.module.css'

type SlotsProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

export const SLOT_ITEM_HEIGHT = 64

export function reelOffset(currentPx: number, winnerIndex: number, count: number): number {
  const cycle = count * SLOT_ITEM_HEIGHT
  const winnerPx = winnerIndex * SLOT_ITEM_HEIGHT
  const delta = (((winnerPx - currentPx) % cycle) + cycle) % cycle
  return currentPx + SLOT_LOOPS * cycle + delta
}

export default function Slots({ options, winnerId, phase, onComplete }: SlotsProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const positionRef = useRef(0)
  const [offset, setOffset] = useState(0)
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const items = useMemo(() => {
    const copies: Option[] = []
    for (let loop = 0; loop < SLOT_LOOPS + 2; loop += 1) {
      copies.push(...options)
    }
    return copies
  }, [options])

  useEffect(() => {
    finished.current = false
  }, [winnerId, phase])

  useEffect(() => {
    if (!spinning || options.length === 0) {
      return
    }
    const next = reelOffset(positionRef.current, winnerIndex, options.length)
    positionRef.current = next
    setOffset(next)
  }, [spinning, winnerId, options.length, winnerIndex])

  useEffect(() => {
    if (phase !== 'revealed' || !winnerId || options.length === 0) {
      return
    }
    const snapped = winnerIndex * SLOT_ITEM_HEIGHT
    positionRef.current = snapped
    setOffset(snapped)
  }, [phase, winnerId, options.length, winnerIndex])

  useEffect(() => {
    if (!spinning) {
      return
    }
    const timer = window.setTimeout(() => {
      if (!finished.current) {
        finished.current = true
        onCompleteRef.current()
      }
    }, THEATER_MS.slots)
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
            className={spinning ? `${styles.reel} ${styles.blur}` : styles.reel}
            data-testid="slots-reel"
            style={{
              transform: `translateY(${-translate}px)`,
              transitionDuration: spinning ? `${THEATER_MS.slots}ms` : '0ms',
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
