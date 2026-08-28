import { SLOT_LOOPS } from '../theater'

export const SLOT_ITEM_HEIGHT = 64

export function reelOffset(currentPx: number, winnerIndex: number, count: number): number {
  const cycle = count * SLOT_ITEM_HEIGHT
  const winnerPx = winnerIndex * SLOT_ITEM_HEIGHT
  const delta = (((winnerPx - currentPx) % cycle) + cycle) % cycle
  return currentPx + SLOT_LOOPS * cycle + delta
}