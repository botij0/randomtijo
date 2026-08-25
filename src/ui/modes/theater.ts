import type { Mode } from '../../domain/types'

export const CLAW_SWEEP_HOPS = 9
export const CLAW_SWEEP_STEP_MS = 560
export const CLAW_AIM_MS = 800
export const CLAW_DROP_MS = 1500
export const CLAW_GRAB_MS = 400
export const CLAW_LIFT_MS = 1800

export const ELIMINATION_HOLD_MS = 800

export const THEATER_RESET_MS = 40

export const THEATER_MS: Record<Mode, number> = {
  roulette: 4000,
  slots: 3000,
  'horse-race': 6000,
  'claw-machine':
    CLAW_SWEEP_HOPS * CLAW_SWEEP_STEP_MS + CLAW_AIM_MS + CLAW_DROP_MS + CLAW_GRAB_MS + CLAW_LIFT_MS,
  'elimination-board': 5000,
}

const RESET_MODES: ReadonlySet<Mode> = new Set(['horse-race', 'claw-machine', 'elimination-board'])

export function theaterCompleteMs(mode: Mode): number {
  return THEATER_MS[mode] + (RESET_MODES.has(mode) ? THEATER_RESET_MS : 0)
}

export function armTheater(delayMs: number, onComplete: () => void): () => void {
  let finished = false
  const timer = window.setTimeout(() => {
    if (!finished) {
      finished = true
      onComplete()
    }
  }, delayMs)
  return () => {
    finished = true
    window.clearTimeout(timer)
  }
}

export const HORSE_RACE_STAGGER_MS = 420

export const ROULETTE_TURNS = 5

export const SLOT_LOOPS = 3

export const SLICE_COLORS = [
  '#ff2bd6',
  '#2bfff2',
  '#f4c430',
  '#7cff6b',
  '#ff6b4a',
  '#8a7cff',
  '#ff9ad5',
  '#3dd6ff',
  '#ffe566',
  '#5dffc2',
  '#ff5d8f',
  '#c6ff4a',
]
