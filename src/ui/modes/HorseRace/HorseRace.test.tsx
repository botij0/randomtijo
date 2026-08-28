import { act, render, screen } from '@testing-library/react'
import HorseRace from './HorseRace'
import {
  GATE_LEFT,
  WINNER_FINISH_LEFT,
  horseRaceWaypoints,
  horseRunName,
  horseTrackLeft,
} from './horseRaceUtils'
import { THEATER_MS, THEATER_RESET_MS } from '../theater'
import { pickIndex } from '../../../domain/pick'

vi.mock('../../../domain/pick', () => ({
  pickIndex: vi.fn(() => {
    throw new Error('modes must not call pickIndex')
  }),
}))

const options = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Cafe Luna' },
  { id: 'c', label: 'Gamma' },
]

function horseEl(id: string): HTMLElement {
  return screen.getByTestId(`horse-${id}`)
}

function packWaypoints(count: number, winnerIndex: number): number[][] {
  return Array.from({ length: count }, (_, horseIndex) =>
    horseRaceWaypoints(horseIndex, winnerIndex, count),
  )
}

function leaderAt(pack: number[][], frame: number): number {
  let best = 0
  for (let horseIndex = 1; horseIndex < pack.length; horseIndex++) {
    if (pack[horseIndex][frame] > pack[best][frame]) {
      best = horseIndex
    }
  }
  return best
}

describe('horseRaceWaypoints', () => {
  it('starts every horse at the gate and only the winner reaches the finish', () => {
    const pack = packWaypoints(3, 1)
    const last = pack[0].length - 1

    for (const horse of pack) {
      expect(horse[0]).toBe(0)
      for (let frame = 1; frame < horse.length; frame++) {
        expect(horse[frame]).toBeGreaterThan(horse[frame - 1])
      }
    }

    expect(pack[1][last]).toBe(1)
    expect(pack[0][last]).toBeLessThan(1)
    expect(pack[2][last]).toBeLessThan(1)
    expect(pack[0][last]).not.toBe(pack[2][last])
    expect(leaderAt(pack, last)).toBe(1)
  })

  it('trades the lead mid-race before the winner takes the finish', () => {
    const pack = packWaypoints(3, 1)
    const last = pack[0].length - 1
    const midLeaders = pack[0]
      .slice(1, last)
      .map((_, offset) => leaderAt(pack, offset + 1))

    expect(midLeaders.some((leader) => leader !== 1)).toBe(true)
    expect(midLeaders.some((leader) => leader === 1)).toBe(true)
    expect(leaderAt(pack, last)).toBe(1)
  })

  it('keeps the late pass for every winner index in a packed field', () => {
    for (let count = 2; count <= 12; count++) {
      for (let winnerIndex = 0; winnerIndex < count; winnerIndex++) {
        const pack = packWaypoints(count, winnerIndex)
        const last = pack[0].length - 1
        const midLeaders = pack[0]
          .slice(1, last)
          .map((_, offset) => leaderAt(pack, offset + 1))

        expect(leaderAt(pack, last), `finish count=${count} winner=${winnerIndex}`).toBe(
          winnerIndex,
        )
        expect(
          midLeaders.some((leader) => leader !== winnerIndex),
          `someone else never led count=${count} winner=${winnerIndex} mid=${midLeaders.join(',')}`,
        ).toBe(true)
        expect(
          midLeaders.some((leader) => leader === winnerIndex),
          `winner never led mid-race count=${count} winner=${winnerIndex} mid=${midLeaders.join(',')}`,
        ).toBe(true)
      }
    }
  })
})

describe('horseTrackLeft', () => {
  it('maps the gate and the finish to the track ends', () => {
    expect(horseTrackLeft(0)).toBe(GATE_LEFT)
    expect(horseTrackLeft(1)).toBe(WINNER_FINISH_LEFT)
    expect(horseTrackLeft(0.5)).not.toBe(GATE_LEFT)
    expect(horseTrackLeft(0.5)).not.toBe(WINNER_FINISH_LEFT)
  })
})

describe('HorseRace', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('races labeled horses to the given winnerId without a second pick', () => {
    render(<HorseRace options={options} winnerId="b" phase="spinning" />)

    expect(screen.getByTestId('horse-race')).toHaveAttribute('data-winner-id', 'b')
    expect(horseEl('b')).toHaveTextContent('Cafe Luna')
    expect(horseEl('a')).toHaveTextContent('Alpha')
    expect(horseEl('c')).toHaveTextContent('Gamma')
    expect(pickIndex).not.toHaveBeenCalled()

    expect(horseEl('b').style.left).toBe(GATE_LEFT)
    expect(horseEl('b').style.animationName).toBe('none')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS)
    })

    expect(horseEl('b').style.left).toBe(GATE_LEFT)
    expect(horseEl('b').style.animationName).toBe(horseRunName('b', 1))
    expect(horseEl('a').style.animationName).toBe(horseRunName('b', 0))
    expect(horseEl('b').style.animationDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(horseEl('a').style.animationDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(horseEl('c').style.animationDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('resets to the gate on a repeat race and the winner still arrives first', () => {
    const { rerender } = render(
      <HorseRace options={options} winnerId="b" phase="spinning" />,
    )

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS + THEATER_MS['horse-race'])
    })
    rerender(<HorseRace options={options} winnerId="b" phase="revealed" />)
    expect(horseEl('b').style.left).toBe(WINNER_FINISH_LEFT)
    expect(horseEl('b')).toHaveAttribute('data-winner', 'true')
    expect(horseEl('b')).toHaveTextContent('Winner')
    expect(horseEl('a')).toHaveAttribute('data-winner', 'false')
    expect(horseEl('a').style.left).not.toBe(WINNER_FINISH_LEFT)
    expect(horseEl('c').style.left).not.toBe(WINNER_FINISH_LEFT)

    rerender(<HorseRace options={options} winnerId="a" phase="spinning" />)
    expect(horseEl('a').style.left).toBe(GATE_LEFT)
    expect(horseEl('a').style.animationName).toBe('none')
    expect(horseEl('a').style.animationDuration).toBe('0ms')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS)
    })

    expect(horseEl('a').style.left).toBe(GATE_LEFT)
    expect(horseEl('a').style.animationName).toBe(horseRunName('a', 0))
    expect(horseEl('a').style.animationDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(horseEl('b').style.animationDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
