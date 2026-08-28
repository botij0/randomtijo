import { useEffect, useState } from 'react'
import type { Option, SpinPhase } from '../../../domain/types'
import {
  CLAW_AIM_MS,
  CLAW_DROP_MS,
  CLAW_GRAB_MS,
  CLAW_SWEEP_HOPS,
  CLAW_SWEEP_STEP_MS,
  SLICE_COLORS,
  THEATER_RESET_MS,
} from '../theater'
import styles from './ClawMachine.module.css'
import {
  CLAW_REST_LEFT,
  CLAW_REST_TOP,
  clawAimLeft,
  clawColumns,
  clawDropTop,
  clawStepDuration,
  clawSweepLefts,
  type ClawStep,
} from './clawMachineUtils'

type ClawMachineProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
}

export default function ClawMachine({ options, winnerId, phase }: ClawMachineProps) {
  const winnerIndex = Math.max(0, options.findIndex((option) => option.id === winnerId))
  const spinning = phase === 'spinning' && winnerId !== null
  const raceToken = spinning ? winnerId : ''

  const [activeToken, setActiveToken] = useState(raceToken)
  const [step, setStep] = useState<ClawStep>('rest')
  const [sweepIndex, setSweepIndex] = useState(0)

  if (raceToken !== activeToken) {
    setActiveToken(raceToken)
    setStep('rest')
    setSweepIndex(0)
  }

  const displayStep: ClawStep = phase === 'revealed' ? 'lift' : step
  const cols = clawColumns(options.length)
  const holding = displayStep === 'grab' || displayStep === 'lift'
  const winner = options.find((option) => option.id === winnerId) ?? null
  const sweepLefts = clawSweepLefts(options.length)

  const left =
    displayStep === 'rest'
      ? CLAW_REST_LEFT
      : displayStep === 'sweep'
        ? sweepLefts[sweepIndex]
        : clawAimLeft(winnerIndex, options.length)

  const top =
    displayStep === 'drop' || displayStep === 'grab'
      ? clawDropTop(winnerIndex, options.length)
      : CLAW_REST_TOP

  useEffect(() => {
    if (!spinning) {
      return
    }
    const timers = [
      window.setTimeout(() => {
        setStep('sweep')
        setSweepIndex(0)
      }, THEATER_RESET_MS),
    ]
    for (let hop = 1; hop < CLAW_SWEEP_HOPS; hop += 1) {
      const index = hop
      timers.push(
        window.setTimeout(() => {
          setStep('sweep')
          setSweepIndex(index)
        }, THEATER_RESET_MS + CLAW_SWEEP_STEP_MS * hop),
      )
    }
    const afterSweep = THEATER_RESET_MS + CLAW_SWEEP_STEP_MS * CLAW_SWEEP_HOPS
    timers.push(window.setTimeout(() => setStep('aim'), afterSweep))
    timers.push(window.setTimeout(() => setStep('drop'), afterSweep + CLAW_AIM_MS))
    timers.push(window.setTimeout(() => setStep('grab'), afterSweep + CLAW_AIM_MS + CLAW_DROP_MS))
    timers.push(
      window.setTimeout(
        () => setStep('lift'),
        afterSweep + CLAW_AIM_MS + CLAW_DROP_MS + CLAW_GRAB_MS,
      ),
    )
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer)
      }
    }
  }, [spinning, winnerId])

  return (
    <div className={styles.stage} data-testid="claw-machine" data-winner-id={winnerId ?? ''}>
      <div className={styles.cabinet}>
        <div className={styles.marquee}>Claw machine</div>
        <div className={styles.playfield} style={{ ['--cols' as string]: String(cols) }}>
          <div
            className={styles.claw}
            data-testid="claw"
            data-step={displayStep}
            data-closed={holding}
            style={{
              left,
              top,
              transitionDuration: spinning && displayStep !== 'rest' ? clawStepDuration(displayStep) : '0ms',
              ['--capsule' as string]: SLICE_COLORS[winnerIndex % SLICE_COLORS.length],
            }}
          >
            <span className={styles.cable} aria-hidden="true" />
            <span className={styles.head}>
              <span className={styles.prong} data-side="left" aria-hidden="true" />
              <span className={styles.prong} data-side="right" aria-hidden="true" />
              {holding && winner ? (
                <span className={styles.held}>
                  <span className={styles.ribbon}>Winner</span>
                  <span className={styles.heldLabel}>{winner.label}</span>
                </span>
              ) : null}
            </span>
          </div>
          <div className={styles.bin}>
            {options.map((option, index) => {
              const grabbed = holding && option.id === winnerId
              return (
                <div
                  key={option.id}
                  className={styles.prize}
                  data-testid={`prize-${option.id}`}
                  data-grabbed={grabbed}
                  style={{ ['--capsule' as string]: SLICE_COLORS[index % SLICE_COLORS.length] }}
                >
                  {option.label}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
