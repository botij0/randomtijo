import { useEffect, useMemo, useRef } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { THEATER_MS } from './theater'
import styles from './Plinko.module.css'

type PlinkoProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

const WIDTH = 400
const HEIGHT = 480
const ROWS = 8

export function plinkoPath(winnerIndex: number, count: number): string {
  const startX = WIDTH / 2
  const topY = 28
  const bottomY = 400
  const slotWidth = WIDTH / Math.max(count, 1)
  const endX = slotWidth * winnerIndex + slotWidth / 2
  const parts = [`M ${startX} ${topY}`]
  for (let row = 1; row <= ROWS; row += 1) {
    const t = row / (ROWS + 1)
    const x = startX + (endX - startX) * t
    const y = topY + (bottomY - topY) * t
    parts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  parts.push(`L ${endX.toFixed(1)} ${bottomY}`)
  parts.push(`L ${endX.toFixed(1)} 448`)
  return parts.join(' ')
}

function pegs(count: number) {
  const items: { x: number; y: number }[] = []
  for (let row = 0; row < ROWS; row += 1) {
    const cols = Math.min(count + 1, 9)
    const y = 70 + row * 38
    const offset = row % 2 === 0 ? 0 : 18
    for (let col = 0; col < cols; col += 1) {
      const x = 40 + offset + col * ((WIDTH - 80) / Math.max(cols - 1, 1))
      items.push({ x, y })
    }
  }
  return items
}

export default function Plinko({ options, winnerId, phase, onComplete }: PlinkoProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const path = useMemo(
    () => plinkoPath(winnerIndex, Math.max(options.length, 1)),
    [winnerIndex, options.length],
  )

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

  const slotWidth = WIDTH / Math.max(options.length, 1)

  return (
    <div
      className={styles.stage}
      data-testid="plinko"
      data-winner-id={winnerId ?? ''}
      data-slot-index={winnerId ? String(winnerIndex) : ''}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={styles.board} role="img" aria-label="Plinko board">
        <rect x="8" y="8" width="384" height="464" rx="24" fill="#12081f" stroke="#f4c430" strokeWidth="6" />
        {pegs(options.length).map((peg, index) => (
          <circle key={index} cx={peg.x} cy={peg.y} r="7" fill="#ffe27a" stroke="#ff2bd6" strokeWidth="2" />
        ))}
        <path d={path} className={styles.ghostPath} />
        {options.map((option, index) => {
          const x = slotWidth * index
          const active = option.id === winnerId && (spinning || phase === 'revealed')
          return (
            <g key={option.id}>
              <rect
                x={x + 10}
                y="408"
                width={slotWidth - 20}
                height="52"
                rx="8"
                fill={active ? '#ff2bd6' : '#1d1033'}
                stroke={active ? '#2bfff2' : '#f4c430'}
                strokeWidth="2"
              />
              <text
                x={x + slotWidth / 2}
                y="438"
                textAnchor="middle"
                dominantBaseline="middle"
                className={styles.slotLabel}
              >
                {option.label}
              </text>
            </g>
          )
        })}
        <circle
          r="12"
          className={styles.ball}
          style={{
            offsetPath: `path('${path}')`,
            animationDuration: spinning ? `${THEATER_MS}ms` : '0ms',
            animationPlayState: spinning ? 'running' : 'paused',
            offsetDistance: phase === 'revealed' ? '100%' : undefined,
          }}
        />
      </svg>
    </div>
  )
}
