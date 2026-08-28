import { useEffect, useMemo, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { SLOT_LOOPS, THEATER_MS } from '../theater'
import styles from './Slots.module.css'
import { reelOffset, SLOT_ITEM_HEIGHT } from './slotsUtils'

type SlotsProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}


export default function Slots({ options, winnerId, phase }: SlotsProps) {
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

  const translate = spinning || phase === 'revealed' ? offset : 0
  const revealed = phase === 'revealed'
  const ghost = options.length > 0 ? options[options.length - 1] : null

  return (
    <div
      className={styles.stage}
      data-testid="slots"
      data-winner-id={winnerId ?? ''}
    >
      <div className={styles.machine} data-spinning={spinning} data-revealed={revealed}>
        <div className={styles.marquee}>
          <div className={styles.bulbs} aria-hidden="true" />
          <span className={styles.marqueeText}>✦ Slots ✦</span>
          <div className={styles.bulbs} aria-hidden="true" />
        </div>
        <div className={styles.body}>
          <div className={styles.windowColumn}>
            <div className={styles.window} style={{ height: SLOT_ITEM_HEIGHT * 3 }}>
              <div
                className={spinning ? `${styles.reel} ${styles.blur}` : styles.reel}
                data-testid="slots-reel"
                style={{
                  transform: `translateY(${-translate}px)`,
                  transitionDuration: spinning ? `${THEATER_MS.slots}ms` : '0ms',
                }}
              >
                {ghost ? (
                  <div
                    key="ghost"
                    className={styles.item}
                    aria-hidden="true"
                    data-label={ghost.label}
                    style={{ height: SLOT_ITEM_HEIGHT }}
                  >
                    {ghost.label}
                  </div>
                ) : null}
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
              <div
                className={styles.payline}
                aria-hidden="true"
                style={{ top: SLOT_ITEM_HEIGHT, height: SLOT_ITEM_HEIGHT }}
              />
              <div className={styles.glass} aria-hidden="true" />
            </div>
            <span className={styles.payArrow} data-side="left" aria-hidden="true" />
            <span className={styles.payArrow} data-side="right" aria-hidden="true" />
          </div>
          <div className={styles.leverPanel} aria-hidden="true">
            <div className={styles.leverTrack} />
            <div className={styles.leverBase} />
            <div className={styles.lever}>
              <div className={styles.leverArm} />
              <div className={styles.leverKnob} />
            </div>
          </div>
        </div>
        <div className={styles.tray}>
          <span className={styles.traySlot} aria-hidden="true" />
          <span className={styles.trayText}>· The table decides ·</span>
        </div>
      </div>
    </div>
  )
}
