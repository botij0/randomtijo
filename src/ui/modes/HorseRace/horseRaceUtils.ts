export const GATE_LEFT = '0.35rem'
export const WINNER_FINISH_LEFT = 'calc(100% - 7.5rem)'

const TRACK_SPAN = '100% - 7.85rem'
const FRAME_PCT = [0, 16, 32, 48, 64, 84, 100]
const FRAME_COUNT = FRAME_PCT.length

function loserRank(horseIndex: number, winnerIndex: number): number {
  return horseIndex < winnerIndex ? horseIndex : horseIndex - 1
}

function loserFinish(rank: number, loserCount: number): number {
  if (loserCount <= 1) {
    return 0.84
  }
  return 0.78 + (rank / (loserCount - 1)) * 0.14
}

function frameLeader(frame: number, winnerIndex: number, horseCount: number): number {
  if (frame >= FRAME_COUNT - 2) {
    return winnerIndex
  }
  return (winnerIndex + frame) % horseCount
}

function placeOffset(place: number): number {
  return 0.08 - Math.min(place, 3) * 0.04
}

export function horseRaceWaypoints(
  horseIndex: number,
  winnerIndex: number,
  horseCount: number,
): number[] {
  const points: number[] = []
  for (let frame = 0; frame < FRAME_COUNT; frame++) {
    if (frame === 0) {
      points.push(0)
      continue
    }
    if (frame === FRAME_COUNT - 1) {
      const previous = points[frame - 1]
      if (horseIndex === winnerIndex) {
        points.push(1)
        continue
      }
      const finish = loserFinish(loserRank(horseIndex, winnerIndex), horseCount - 1)
      points.push(Math.min(0.93, Math.max(finish, previous + 0.04)))
      continue
    }
    const pack = 0.1 + frame * 0.13
    const leader = frameLeader(frame, winnerIndex, horseCount)
    const place = (horseIndex - leader + horseCount) % horseCount
    const previous = points[frame - 1]
    const progress = Math.max(pack + placeOffset(place), previous + 0.03)
    points.push(progress)
  }
  return points
}

export function horseTrackLeft(progress: number): string {
  if (progress <= 0) {
    return GATE_LEFT
  }
  if (progress >= 1) {
    return WINNER_FINISH_LEFT
  }
  const rounded = Math.round(progress * 10000) / 10000
  return `calc(${GATE_LEFT} + ${rounded} * (${TRACK_SPAN}))`
}

export function horseRunName(raceToken: string, optionIndex: number): string {
  return `horse-run-${raceToken.replace(/[^a-zA-Z0-9_-]/g, '')}-${optionIndex}`
}

export function horseRaceKeyframes(name: string, waypoints: number[]): string {
  const frames = waypoints.map((progress, index) => {
    return `${FRAME_PCT[index]}% { left: ${horseTrackLeft(progress)}; }`
  })
  return `@keyframes ${name} { ${frames.join(' ')} }`
}