import { pickIndex } from './pick'

describe('pickIndex', () => {
  it('maps injected rng 0 to the first index', () => {
    expect(pickIndex(5, () => 0)).toBe(0)
  })

  it('maps injected rng just below 1 to the last index', () => {
    expect(pickIndex(4, () => 0.999999)).toBe(3)
  })

  it('stays within bounds for a sweep of unit values', () => {
    const count = 7
    for (let i = 0; i < 100; i += 1) {
      const unit = i / 100
      const index = pickIndex(count, () => unit)
      expect(index).toBeGreaterThanOrEqual(0)
      expect(index).toBeLessThan(count)
    }
  })

  it('uses the injected rng and does not call crypto', () => {
    const spy = vi.spyOn(crypto, 'getRandomValues')
    expect(pickIndex(3, () => 0.5)).toBe(1)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
