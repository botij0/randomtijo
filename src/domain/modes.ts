export const MODES = [
  { id: 'roulette', label: 'Roulette', mark: '🎡' },
  { id: 'slots', label: 'Slots', mark: '🍒' },
  { id: 'horse-race', label: 'Horse race', mark: '🐎' },
  { id: 'claw-machine', label: 'Claw machine', mark: '🕹️' },
  { id: 'elimination-board', label: 'Elimination', mark: '💡' },
] as const

export type Mode = (typeof MODES)[number]['id']

export const DEFAULT_MODE: Mode = 'roulette'

export function isMode(value: unknown): value is Mode {
  return typeof value === 'string' && MODES.some((entry) => entry.id === value)
}
