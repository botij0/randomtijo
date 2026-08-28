import { ROULETTE_TURNS } from '../theater'

export function slicePath(index: number, count: number, radius = 100, cx = 100, cy = 100): string {
  const start = (index / count) * Math.PI * 2 - Math.PI / 2
  const end = ((index + 1) / count) * Math.PI * 2 - Math.PI / 2
  const large = Math.PI * 2 / count > Math.PI ? 1 : 0
  const x1 = cx + radius * Math.cos(start)
  const y1 = cy + radius * Math.sin(start)
  const x2 = cx + radius * Math.cos(end)
  const y2 = cy + radius * Math.sin(end)
  return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2} Z`
}

export function labelPoint(index: number, count: number, radius = 62, cx = 100, cy = 100) {
  const mid = ((index + 0.5) / count) * Math.PI * 2 - Math.PI / 2
  return { x: cx + radius * Math.cos(mid), y: cy + radius * Math.sin(mid) }
}

export function fretPoint(index: number, count: number, radius = 93, cx = 100, cy = 100) {
  const boundary = (index / count) * Math.PI * 2 - Math.PI / 2
  return { x: cx + radius * Math.cos(boundary), y: cy + radius * Math.sin(boundary) }
}

export function targetRotation(currentDeg: number, winnerIndex: number, count: number): number {
  const slice = 360 / count
  const winnerCenter = (winnerIndex + 0.5) * slice
  const turnsBase = Math.ceil(currentDeg / 360) * 360
  return turnsBase + ROULETTE_TURNS * 360 + (360 - winnerCenter)
}
