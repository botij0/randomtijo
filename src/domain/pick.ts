import type { Rng } from './types'

const UINT32_RANGE = 0x1_0000_0000

export function cryptoRng(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0] / UINT32_RANGE
}

/**
 * Unbiased index in [0, count).
 * Default path uses crypto.getRandomValues with rejection sampling.
 * Tests inject an Rng that returns [0, 1).
 */
export function pickIndex(count: number, rng?: Rng): number {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('pickIndex requires a positive integer count')
  }

  if (rng) {
    const unit = rng()
    if (!(unit >= 0 && unit < 1)) {
      throw new Error('rng must return a number in [0, 1)')
    }
    return Math.min(count - 1, Math.floor(unit * count))
  }

  const buf = new Uint32Array(1)
  const limit = UINT32_RANGE - (UINT32_RANGE % count)
  let value = 0
  do {
    crypto.getRandomValues(buf)
    value = buf[0]
  } while (value >= limit)
  return value % count
}
