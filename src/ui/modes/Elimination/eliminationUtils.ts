import { ELIMINATION_HOLD_MS, THEATER_MS } from '../theater'

export const ELIMINATION_SCAN_MS = 110

function hashSeed(text: string): number {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function mulberry32(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let next = Math.imul(state ^ (state >>> 15), 1 | state)
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296
  }
}

export function eliminationOrder(
  optionIds: readonly string[],
  winnerId: string,
  playIndex: number,
): string[] {
  const losers = optionIds.filter((id) => id !== winnerId)
  const rng = mulberry32(hashSeed(`${winnerId}:${playIndex}:${losers.join(',')}`))
  const shuffled = [...losers]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(rng() * (index + 1))
    const current = shuffled[index]
    shuffled[index] = shuffled[swap]
    shuffled[swap] = current
  }
  if (shuffled.length >= 2 && shuffled.every((id, index) => id === losers[index])) {
    const first = shuffled[0]
    shuffled[0] = shuffled[1]
    shuffled[1] = first
  }
  return shuffled
}

export function eliminationAtMs(loserRank: number, loserCount: number): number {
  if (loserCount < 1) {
    return 0
  }
  const usable = THEATER_MS['elimination-board'] - ELIMINATION_HOLD_MS
  return Math.round(((loserRank + 1) / loserCount) * usable)
}
