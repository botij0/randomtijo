import type { Mode } from '../../domain/types'

export const THEATER_MS: Record<Mode, number> = {
  roulette: 4000,
  slots: 3000,
  'horse-race': 4000,
}

export const HORSE_RACE_STAGGER_MS = 280

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
