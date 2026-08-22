import { useEffect, useRef, useState } from 'react'
import type { Option, SpinPhase } from '../../domain/types'
import { CLAW_AIM_MS, CLAW_DROP_MS, CLAW_GRAB_MS, CLAW_LIFT_MS, SLICE_COLORS, THEATER_MS } from './theater'
import styles from './ClawMachine.module.css'

type ClawMachineProps = {
  options: Option[]
  winnerId: string | null
  phase: SpinPhase
  onComplete: () => void
}

type ClawStep = 'rest' | 'aim' | 'drop' | 'grab' | 'lift'

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

function stepDuration(step: ClawStep): string {
  switch (step) {
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

  if (raceToken !== activeToken) {
    setActiveToken(raceToken)
    setStep('rest')
  }

  const displayStep: ClawStep = phase === 'revealed' ? 'lift' : step
  const cols = clawColumns(options.length)
  const holding = displayStep === 'grab' || displayStep === 'lift'
  const winner = options.find((option) => option.id === winnerId) ?? null
  const left = displayStep === 'rest' ? CLAW_REST_LEFT : clawAimLeft(winnerIndex, options.length)
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
      window.setTimeout(() => setStep('aim'), CLAW_RESET_MS),
      window.setTimeout(() => setStep('drop'), CLAW_RESET_MS + CLAW_AIM_MS),
      window.setTimeout(() => setStep('grab'), CLAW_RESET_MS + CLAW_AIM_MS + CLAW_DROP_MS),
      window.setTimeout(
        () => setStep('lift'),
        CLAW_RESET_MS + CLAW_AIM_MS + CLAW_DROP_MS + CLAW_GRAB_MS,
      ),
      window.setTimeout(() => {
        if (!finished.current) {
          finished.current = true
          onCompleteRef.current()
        }
      }, CLAW_RESET_MS + THEATER_MS['claw-machine']),
    ]
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
