import { CLAW_AIM_MS, CLAW_DROP_MS, CLAW_GRAB_MS, CLAW_LIFT_MS, CLAW_SWEEP_HOPS, CLAW_SWEEP_STEP_MS } from '../theater'

export type ClawStep = 'rest' | 'sweep' | 'aim' | 'drop' | 'grab' | 'lift'

export const CLAW_REST_LEFT = '50%'
export const CLAW_REST_TOP = '0.2rem'

/** Keep in sync with ClawMachine.module.css --rail, --prize, --gap. */
export const CLAW_RAIL_REM = 2.55
export const CLAW_PRIZE_REM = 4.35
export const CLAW_GAP_REM = 0.5
/** Distance from the claw top to the prong midpoint. */
export const CLAW_GRAB_OFFSET_REM = 3.05

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
  const row = Math.floor(index / cols)
  const prizeCenter = CLAW_RAIL_REM + row * (CLAW_PRIZE_REM + CLAW_GAP_REM) + CLAW_PRIZE_REM / 2
  return `${prizeCenter - CLAW_GRAB_OFFSET_REM}rem`
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

export function clawStepDuration(step: ClawStep): string {
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