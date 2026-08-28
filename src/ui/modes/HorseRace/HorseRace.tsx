import { useEffect, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import { SLICE_COLORS, THEATER_MS, THEATER_RESET_MS } from '../theater'
import styles from './HorseRace.module.css'
import { GATE_LEFT, horseRaceKeyframes, horseRaceWaypoints, horseRunName, horseTrackLeft } from './horseRaceUtils'

type HorseRaceProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
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
