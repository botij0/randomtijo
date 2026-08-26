import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { ROULETTE_TURNS, SLICE_COLORS, THEATER_MS } from '../theater'
import styles from './Roulette.module.css'

type RouletteProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
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

function fretPoint(index: number, count: number, radius = 93, cx = 100, cy = 100) {
  const boundary = (index / count) * Math.PI * 2 - Math.PI / 2
  return { x: cx + radius * Math.cos(boundary), y: cy + radius * Math.sin(boundary) }
}

export function targetRotation(currentDeg: number, winnerIndex: number, count: number): number {
  const slice = 360 / count
  const winnerCenter = (winnerIndex + 0.5) * slice
  const turnsBase = Math.ceil(currentDeg / 360) * 360
  return turnsBase + ROULETTE_TURNS * 360 + (360 - winnerCenter)
}

export default function Roulette({ options, winnerId, phase }: RouletteProps) {
  const rotationRef = useRef(0)
  const [angle, setAngle] = useState(0)
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const revealed = phase === 'revealed'

  useEffect(() => {
    if (!spinning || options.length === 0) {
      return
    }
    const next = targetRotation(rotationRef.current, winnerIndex, options.length)
    rotationRef.current = next
    setAngle(next)
  }, [spinning, winnerId, options.length, winnerIndex])

  return (
    <div
      className={styles.stage}
      data-testid="roulette"
      data-winner-id={winnerId ?? ''}
      data-spinning={spinning}
      data-revealed={revealed}
    >
      <div className={styles.pointer} aria-hidden="true" />
      <div className={styles.rim}>
        <div
          className={styles.wheel}
          data-testid="roulette-wheel"
          style={{
            transform: `rotate(${spinning || phase === 'revealed' ? angle : 0}deg)`,
            transitionDuration: spinning ? `${THEATER_MS.roulette}ms` : '0ms',
          }}
        >
          <svg viewBox="0 0 200 200" role="img" aria-label="Roulette wheel">
            <defs>
              <radialGradient id="rouletteShade" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#000" stopOpacity="0.35" />
                <stop offset="26%" stopColor="#000" stopOpacity="0" />
                <stop offset="72%" stopColor="#000" stopOpacity="0" />
                <stop offset="100%" stopColor="#000" stopOpacity="0.38" />
              </radialGradient>
              <radialGradient id="rouletteGloss" cx="50%" cy="36%" r="65%">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.16" />
                <stop offset="45%" stopColor="#fff" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#fff" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="rouletteHubGold" cx="35%" cy="30%" r="75%">
                <stop offset="0%" stopColor="#fff2b8" />
                <stop offset="45%" stopColor="#f4c430" />
                <stop offset="100%" stopColor="#7a4a05" />
              </radialGradient>
              <radialGradient id="rouletteHubDome" cx="38%" cy="32%" r="75%">
                <stop offset="0%" stopColor="#4a2070" />
                <stop offset="60%" stopColor="#1a0b2e" />
                <stop offset="100%" stopColor="#0a0512" />
              </radialGradient>
            </defs>
            {options.map((option, index) => {
              const label = labelPoint(index, options.length)
              const isWinner = revealed && option.id === winnerId
              return (
                <g key={option.id}>
                  <path
                    d={slicePath(index, options.length)}
                    fill={SLICE_COLORS[index % SLICE_COLORS.length]}
                    stroke="#14061f"
                    strokeWidth={1.6}
                    className={isWinner ? styles.winnerSlice : undefined}
                  />
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
            <circle cx="100" cy="100" r="100" fill="url(#rouletteShade)" pointerEvents="none" />
            {options.map((option, index) => {
              const fret = fretPoint(index, options.length)
              return (
                <circle
                  key={`fret-${option.id}`}
                  cx={fret.x}
                  cy={fret.y}
                  r={2.1}
                  className={styles.fret}
                />
              )
            })}
            <circle cx="100" cy="100" r="100" fill="url(#rouletteGloss)" pointerEvents="none" />
            <circle cx="100" cy="100" r="21" fill="url(#rouletteHubGold)" stroke="#2a1600" strokeWidth="2.5" />
            <circle
              cx="100"
              cy="100"
              r="13"
              fill="url(#rouletteHubDome)"
              stroke="#2a1600"
              strokeWidth="1.5"
              className={styles.hubDome}
            />
            <circle cx="100" cy="100" r="3" fill="#f4c430" />
          </svg>
        </div>
      </div>
    </div>
  )
}
