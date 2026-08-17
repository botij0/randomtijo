import { useEffect, useMemo, useRef } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { SLICE_COLORS, THEATER_MS } from './theater'
import styles from './Roulette.module.css'

type RouletteProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

function slicePath(index: number, count: number, radius = 100, cx = 100, cy = 100): string {
  const start = (index / count) * Math.PI * 2 - Math.PI / 2
  const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2
  const large = Math.PI * 2 / count > Math.PI ? 1 : 0
  const x1 = cx + radius * Math.cos(start)
  const y1 = cy + radius * Math.sin(start)
  const x2 = cx + radius * Math.cos(end)
  const y2 = cy + radius * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`
}

function labelPoint(index: number, count: number, radius = 62, cx = 100, cy = 100) {
  const mid = ((index + 0.5) / count) * Math.PI * 2 - Math.PI / 2
  return { x: cx + radius * Math.cos(mid), y: cy + radius * Math.sin(mid) }
}

export function targetRotation(winnerIndex: number, count: number, extraTurns = 5): number {
  const slice = 360 / count
  const winnerCenter = (winnerIndex + 0.5) * slice
  return extraTurns * 360 + (360 - winnerCenter)
}

export default function Roulette({ options, winnerId, phase, onComplete }: RouletteProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const angle = useMemo(() => {
    if (!winnerId || options.length === 0) {
      return 0
    }
    return targetRotation(winnerIndex, options.length)
  }, [options.length, winnerId, winnerIndex])

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

  return (
    <div
      className={styles.stage}
      data-testid="roulette"
      data-winner-id={winnerId ?? ''}
    >
      <div className={styles.pointer} aria-hidden="true" />
      <div
        className={styles.wheel}
        data-testid="roulette-wheel"
        style={{
          transform: `rotate(${spinning || phase === 'revealed' ? angle : 0}deg)`,
          transitionDuration: spinning ? `${THEATER_MS}ms` : '0ms',
        }}
      >
        <svg viewBox="0 0 200 200" role="img" aria-label="Roulette wheel">
          {options.map((option, index) => {
            const label = labelPoint(index, options.length)
            return (
              <g key={option.id}>
                <path d={slicePath(index, options.length)} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                <text
                  x={label.x}
                  y={label.y}
                  className={styles.sliceLabel}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {option.label}
                </text>
              </g>
            )
          })}
          <circle cx="100" cy="100" r="18" fill="#1a0b2e" stroke="#f4c430" strokeWidth="3" />
        </svg>
      </div>
    </div>
  )
}
