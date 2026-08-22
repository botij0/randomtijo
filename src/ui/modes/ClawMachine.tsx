import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import {
  CLAW_AIM_MS,
  CLAW_DROP_MS,
  CLAW_GRAB_MS,
  CLAW_LIFT_MS,
  CLAW_SWEEP_HOPS,
  CLAW_SWEEP_STEP_MS,
  SLICE_COLORS,
  THEATER_MS,
} from './theater'
import styles from './ClawMachine.module.css'

type ClawMachineProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

type ClawStep = 'rest' | 'sweep' | 'aim' | 'drop' | 'grab' | 'lift'

export const CLAW_RESET_MS = 40
export const CLAW_REST_LEFT = '50%'
export const CLAW_REST_TOP = '12%'

export function clawColumns(count: number): number {
  return Math.min(4, Math.max(1, count))
}

export function clawAimLeft(index: number, count: number): string {
  const cols = clawColumns(count)
  const col = index % cols
  return `${((col + 0.5) / cols) * 100}%`
}

export function clawDropTop(index: number, count: number): string {
  const cols = clawColumns(count)
  const rows = Math.max(1, Math.ceil(count / cols))
  const row = Math.floor(index / cols)
  return `${((row + 0.5) / rows) * 100}%`
}

export function clawSweepCycle(count: number): number[] {
  const cols = clawColumns(count)
  if (cols <= 1) {
    return [0]
  }
  const cycle: number[] = []
  for (let col = 0; col < cols; col += 1) {
    cycle.push(col)
  }
  for (let col = cols - 2; col >= 1; col -= 1) {
    cycle.push(col)
  }
  return cycle
}

export function clawSweepLefts(count: number, hops = CLAW_SWEEP_HOPS): string[] {
  const cycle = clawSweepCycle(count)
  return Array.from({ length: hops }, (_, hop) => clawAimLeft(cycle[hop % cycle.length], count))
}

function stepDuration(step: ClawStep): string {
  switch (step) {
    case 'sweep':
      return `${CLAW_SWEEP_STEP_MS}ms`
    case 'aim':
      return `${CLAW_AIM_MS}ms`
    case 'drop':
      return `${CLAW_DROP_MS}ms`
    case 'grab':
      return `${CLAW_GRAB_MS}ms`
    case 'lift':
      return `${CLAW_LIFT_MS}ms`
    default:
      return '0ms'
  }
}

export default function ClawMachine({ options, winnerId, phase, onComplete }: ClawMachineProps) {
  const finished = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
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
    finished.current = false
  }, [winnerId, phase])

  useEffect(() => {
    if (!spinning) {
      return
    }
    const timers = [
      window.setTimeout(() => {
        setStep('sweep')
        setSweepIndex(0)
      }, CLAW_RESET_MS),
    ]
    for (let hop = 1; hop < CLAW_SWEEP_HOPS; hop += 1) {
      const index = hop
      timers.push(
        window.setTimeout(() => {
          setStep('sweep')
          setSweepIndex(index)
        }, CLAW_RESET_MS + CLAW_SWEEP_STEP_MS * hop),
      )
    }
    const afterSweep = CLAW_RESET_MS + CLAW_SWEEP_STEP_MS * CLAW_SWEEP_HOPS
    timers.push(window.setTimeout(() => setStep('aim'), afterSweep))
    timers.push(window.setTimeout(() => setStep('drop'), afterSweep + CLAW_AIM_MS))
    timers.push(window.setTimeout(() => setStep('grab'), afterSweep + CLAW_AIM_MS + CLAW_DROP_MS))
    timers.push(
      window.setTimeout(
        () => setStep('lift'),
        afterSweep + CLAW_AIM_MS + CLAW_DROP_MS + CLAW_GRAB_MS,
      ),
    )
    timers.push(
      window.setTimeout(() => {
        if (!finished.current) {
          finished.current = true
          onCompleteRef.current()
        }
      }, CLAW_RESET_MS + THEATER_MS['claw-machine']),
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
              transitionDuration: spinning && displayStep !== 'rest' ? stepDuration(displayStep) : '0ms',
            }}
          >
            <span className={styles.cable} aria-hidden="true" />
            <span className={styles.head} aria-hidden="true">
              <span className={styles.prong} data-side="left" />
              <span className={styles.prong} data-side="right" />
            </span>
            {holding && winner ? <span className={styles.held}>{winner.label}</span> : null}
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
