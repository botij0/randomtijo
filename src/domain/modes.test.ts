import { DEFAULT_MODE, isMode } from './modes'

describe('DEFAULT_MODE', () => {
  it('is roulette', () => {
    expect(DEFAULT_MODE).toBe('roulette')
  })
})

describe('isMode', () => {
  it('accepts every catalog Mode', () => {
    expect(isMode('roulette')).toBe(true)
    expect(isMode('slots')).toBe(true)
    expect(isMode('horse-race')).toBe(true)
    expect(isMode('claw-machine')).toBe(true)
    expect(isMode('elimination-board')).toBe(true)
  })

  it('rejects unknown and non-string values', () => {
    expect(isMode('plinko')).toBe(false)
    expect(isMode('')).toBe(false)
    expect(isMode(1)).toBe(false)
    expect(isMode(null)).toBe(false)
  })
})
