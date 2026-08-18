import { useEffect, useMemo, useRef } from 'react'
import type { Option, Rng, SpinPhase } from '../../domain/types'
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
const TOP_Y = 28
const BOTTOM_Y = 400
const SLOT_DEPTH_Y = 448
const EPSILON = 1e-9

export function bouncePath(
  winnerIndex: number,
  count: number,
  rng: Rng = Math.random,
): { d: string; hitRows: number[] } {
  const safeCount = Math.max(count, 1)
  const slotWidth = WIDTH / safeCount
  const winnerX = slotWidth * winnerIndex + slotWidth / 2
  const minX = slotWidth / 2
  const maxX = WIDTH - slotWidth / 2
  const step = Math.max(slotWidth / 2, (WIDTH / 2 - slotWidth / 2) / ROWS)
  const parts = [`M ${WIDTH / 2} ${TOP_Y}`]
  const hitRows: number[] = []
  let x = WIDTH / 2

  for (let row = 1; row <= ROWS; row += 1) {
    const y = TOP_Y + ((BOTTOM_Y - TOP_Y) * row) / ROWS
    if (row === ROWS) {
      x = winnerX
    } else {
      const remaining = ROWS - row
      const candidates = [-1, 1].map((dir) => x + dir * step)
      const feasible = candidates.filter(
        (nextX) =>
          nextX >= minX - EPSILON &&
          nextX <= maxX + EPSILON &&
          Math.abs(winnerX - nextX) <= remaining * step + EPSILON,
      )
      if (feasible.length > 0) {
        x = feasible[Math.min(feasible.length - 1, Math.floor(rng() * feasible.length))]
      } else {
        const inBounds = candidates.filter(
          (nextX) => nextX >= minX - EPSILON && nextX <= maxX + EPSILON,
        )
        const pool = inBounds.length > 0 ? inBounds : [x]
        x = pool.reduce((best, nextX) =>
          Math.abs(winnerX - nextX) < Math.abs(winnerX - best) ? nextX : best,
        )
      }
    }
    parts.push(`L ${x.toFixed(1)} ${y.toFixed(1)}`)
    hitRows.push(row - 1)
  }

  parts.push(`L ${winnerX.toFixed(1)} ${SLOT_DEPTH_Y}`)
  return { d: parts.join(' '), hitRows }
}

function pegs(count: number) {
  const items: { x: number; y: number; row: number }[] = []
  for (let row = 0; row < ROWS; row += 1) {
    const cols = Math.min(count + 1, 9)
    const y = 70 + row * 38
    const offset = row % 2 === 0 ? 0 : 18
    for (let col = 0; col < cols; col += 1) {
      const x = 40 + offset + col * ((WIDTH - 80) / Math.max(cols - 1, 1))
      items.push({ x, y, row })
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
  const { d, hitRows } = useMemo(
    () => bouncePath(winnerIndex, Math.max(options.length, 1)),
    [winnerIndex, options.length, phase],
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
    }, THEATER_MS.plinko)
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
          <circle
            key={index}
            cx={peg.x}
            cy={peg.y}
            r="7"
            className={spinning && hitRows.includes(peg.row) ? styles.pegHit : undefined}
            style={
              spinning
                ? { animationDelay: `${((peg.row + 1) / ROWS) * THEATER_MS.plinko}ms` }
                : undefined
            }
            fill="#ffe27a"
            stroke="#ff2bd6"
            strokeWidth="2"
          />
        ))}
        {options.map((option, index) => {
          const x = slotWidth * index
          const won = phase === 'revealed' && option.id === winnerId
          return (
            <g key={option.id}>
              <rect
                x={x + 10}
                y="408"
                width={slotWidth - 20}
                height="52"
                rx="8"
                className={won ? styles.slotWin : undefined}
                data-slot-won={won ? 'true' : undefined}
                fill={won ? '#ff2bd6' : '#1d1033'}
                stroke={won ? '#2bfff2' : '#f4c430'}
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
            offsetPath: `path('${d}')`,
            animationDuration: spinning ? `${THEATER_MS.plinko}ms` : '0ms',
            animationPlayState: spinning ? 'running' : 'paused',
            offsetDistance: phase === 'revealed' ? '100%' : undefined,
          }}
        />
      </svg>
    </div>
  )
}
