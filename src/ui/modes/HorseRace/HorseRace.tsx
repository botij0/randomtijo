import { useEffect, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { SLICE_COLORS, THEATER_MS, THEATER_RESET_MS } from '../theater'
import styles from './HorseRace.module.css'

type HorseRaceProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}

export const GATE_LEFT = '0.35rem'
export const WINNER_FINISH_LEFT = 'calc(100% - 7.5rem)'

const TRACK_SPAN = '100% - 7.85rem'
const FRAME_PCT = [0, 16, 32, 48, 64, 84, 100]
const FRAME_COUNT = FRAME_PCT.length

function loserRank(horseIndex: number, winnerIndex: number): number {
  return horseIndex < winnerIndex ? horseIndex : horseIndex - 1
}

function loserFinish(rank: number, loserCount: number): number {
  if (loserCount <= 1) {
    return 0.84
  }
  return 0.78 + (rank / (loserCount - 1)) * 0.14
}

function frameLeader(frame: number, winnerIndex: number, horseCount: number): number {
  if (frame >= FRAME_COUNT - 2) {
    return winnerIndex
  }
  return (winnerIndex + frame) % horseCount
}

function placeOffset(place: number): number {
  return 0.08 - Math.min(place, 3) * 0.04
}

export function horseRaceWaypoints(
  horseIndex: number,
  winnerIndex: number,
  horseCount: number,
): number[] {
  const points: number[] = []
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    if (frame === 0) {
      points.push(0)
      continue
    }
    if (frame === FRAME_COUNT - 1) {
      const previous = points[frame - 1]
      if (horseIndex === winnerIndex) {
        points.push(1)
        continue
      }
      const finish = loserFinish(loserRank(horseIndex, winnerIndex), horseCount - 1)
      points.push(Math.min(0.93, Math.max(finish, previous + 0.04)))
      continue
    }
    const pack = 0.1 + frame * 0.13
    const leader = frameLeader(frame, winnerIndex, horseCount)
    const place = (horseIndex - leader + horseCount) % horseCount
    const previous = points[frame - 1]
    const progress = Math.max(pack + placeOffset(place), previous + 0.03)
    points.push(progress)
  }
  return points
}

export function horseTrackLeft(progress: number): string {
  if (progress <= 0) {
    return GATE_LEFT
  }
  if (progress >= 1) {
    return WINNER_FINISH_LEFT
  }
  const rounded = Math.round(progress * 10000) / 10000
  return `calc(${GATE_LEFT} + ${rounded} * (${TRACK_SPAN}))`
}

export function horseRunName(raceToken: string, optionIndex: number): string {
  return `horse-run-${raceToken.replace(/[^a-zA-Z0-9_-]/g, '')}-${optionIndex}`
}

function horseRaceKeyframes(name: string, waypoints: number[]): string {
  const frames = waypoints.map((progress, index) => {
    return `${FRAME_PCT[index]}% { left: ${horseTrackLeft(progress)}; }`
  })
  return `@keyframes ${name} { ${frames.join(' ')} }`
}

export default function HorseRace({ options, winnerId, phase }: HorseRaceProps) {
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const raceToken = spinning ? winnerId : ''
  const [activeToken, setActiveToken] = useState(raceToken)
  const [armed, setArmed] = useState(false)

  if (raceToken !== activeToken) {
    setActiveToken(raceToken)
    setArmed(false)
  }

  const racing = spinning && armed
  const atFinish = phase === 'revealed' || racing

  useEffect(() => {
    if (!spinning) {
      return
    }
    const arm = window.setTimeout(() => {
      setArmed(true)
    }, THEATER_RESET_MS)
    return () => window.clearTimeout(arm)
  }, [spinning, winnerId])

  const racePlans = options.map((_, index) => {
    const waypoints = winnerId
      ? horseRaceWaypoints(index, winnerIndex, options.length)
      : [0]
    return {
      name: winnerId ? horseRunName(winnerId, index) : 'none',
      waypoints,
      finishLeft: horseTrackLeft(waypoints.at(-1) ?? 0),
    }
  })
  const keyframesCss = winnerId
    ? racePlans.map((plan) => horseRaceKeyframes(plan.name, plan.waypoints)).join('\n')
    : ''

  return (
    <div
      className={styles.stage}
      data-testid="horse-race"
      data-winner-id={winnerId ?? ''}
    >
      {keyframesCss ? <style>{keyframesCss}</style> : null}
      <div className={styles.board}>
        <div className={styles.banner}>
          <span>Start</span>
          <span>Horse race</span>
          <span>Finish</span>
        </div>
        <div className={styles.track} data-testid="horse-race-track">
          <div className={styles.finish} aria-hidden="true" />
          {options.map((option, index) => {
            const isWinner = option.id === winnerId
            const plan = racePlans[index]
            return (
              <div key={option.id} className={styles.lane} data-won={phase === 'revealed' && isWinner}>
                <div
                  className={styles.horse}
                  data-testid={`horse-${option.id}`}
                  data-running={atFinish}
                  data-racing={racing}
                  data-winner={phase === 'revealed' && isWinner}
                  data-behind={phase === 'revealed' && Boolean(winnerId) && !isWinner}
                  style={{
                    left: phase === 'revealed' ? plan.finishLeft : GATE_LEFT,
                    animationName: racing ? plan.name : 'none',
                    animationDuration: racing ? `${THEATER_MS['horse-race']}ms` : '0ms',
                    ['--saddle' as string]: SLICE_COLORS[index % SLICE_COLORS.length],
                  }}
                >
                  {phase === 'revealed' && isWinner ? (
                    <span className={styles.ribbon}>Winner</span>
                  ) : null}
                  <span className={styles.label}>{option.label}</span>
                  <span className={styles.sprite} aria-hidden="true">
                    🐎
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
