import { act, render, screen } from '@testing-library/react'
import HorseRace, {
  GATE_LEFT,
  HORSE_RACE_RESET_MS,
  WINNER_FINISH_LEFT,
  horseDurationMs,
  horseTravelLeft,
} from './HorseRace'
import { HORSE_RACE_STAGGER_MS, THEATER_MS } from '../theater'
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

describe('horseDurationMs', () => {
  it('gives the winner a strictly shorter duration than every other horse', () => {
    const winner = horseDurationMs('b', 'b', 1, 1)
    const first = horseDurationMs('a', 'b', 0, 1)
    const third = horseDurationMs('c', 'b', 2, 1)

    expect(winner).toBe(THEATER_MS['horse-race'])
    expect(first).toBeGreaterThan(winner)
    expect(third).toBeGreaterThan(winner)
    expect(first).toBe(winner + HORSE_RACE_STAGGER_MS)
    expect(third).toBe(winner + HORSE_RACE_STAGGER_MS * 2)
  })
})

describe('horseTravelLeft', () => {
  it('stops every other horse short of the winner finish', () => {
    expect(horseTravelLeft('b', 'b', 1, 1)).toBe(WINNER_FINISH_LEFT)
    expect(horseTravelLeft('a', 'b', 0, 1)).not.toBe(WINNER_FINISH_LEFT)
    expect(horseTravelLeft('c', 'b', 2, 1)).not.toBe(WINNER_FINISH_LEFT)
    expect(horseTravelLeft('a', 'b', 0, 1)).not.toBe(horseTravelLeft('c', 'b', 2, 1))
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
    const onComplete = vi.fn()
    render(
      <HorseRace options={options} winnerId="b" phase="spinning" onComplete={onComplete} />,
    )

    expect(screen.getByTestId('horse-race')).toHaveAttribute('data-winner-id', 'b')
    expect(horseEl('b')).toHaveTextContent('Cafe Luna')
    expect(horseEl('a')).toHaveTextContent('Alpha')
    expect(horseEl('c')).toHaveTextContent('Gamma')
    expect(pickIndex).not.toHaveBeenCalled()

    expect(horseEl('b').style.left).toBe(GATE_LEFT)

    act(() => {
      vi.advanceTimersByTime(HORSE_RACE_RESET_MS)
    })

    expect(horseEl('b').style.left).toBe(WINNER_FINISH_LEFT)
    expect(horseEl('a').style.left).not.toBe(WINNER_FINISH_LEFT)
    expect(horseEl('c').style.left).not.toBe(WINNER_FINISH_LEFT)
    expect(horseEl('b').style.transitionDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(Number.parseFloat(horseEl('a').style.transitionDuration)).toBeGreaterThan(
      THEATER_MS['horse-race'],
    )
    expect(Number.parseFloat(horseEl('c').style.transitionDuration)).toBeGreaterThan(
      THEATER_MS['horse-race'],
    )

    act(() => {
      vi.advanceTimersByTime(THEATER_MS['horse-race'])
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('resets to the gate on a repeat race and the winner still arrives first', () => {
    const onComplete = vi.fn()
    const { rerender } = render(
      <HorseRace options={options} winnerId="b" phase="spinning" onComplete={onComplete} />,
    )

    act(() => {
      vi.advanceTimersByTime(HORSE_RACE_RESET_MS + THEATER_MS['horse-race'])
    })
    rerender(<HorseRace options={options} winnerId="b" phase="revealed" onComplete={onComplete} />)
    expect(horseEl('b').style.left).toBe(WINNER_FINISH_LEFT)
    expect(horseEl('b')).toHaveAttribute('data-winner', 'true')
    expect(horseEl('b')).toHaveTextContent('Winner')
    expect(horseEl('a')).toHaveAttribute('data-winner', 'false')
    expect(horseEl('a').style.left).not.toBe(WINNER_FINISH_LEFT)

    rerender(<HorseRace options={options} winnerId="a" phase="spinning" onComplete={onComplete} />)
    expect(horseEl('a').style.left).toBe(GATE_LEFT)
    expect(horseEl('a').style.transitionDuration).toBe('0ms')

    act(() => {
      vi.advanceTimersByTime(HORSE_RACE_RESET_MS)
    })

    expect(horseEl('a').style.left).toBe(WINNER_FINISH_LEFT)
    expect(horseEl('a').style.transitionDuration).toBe(`${THEATER_MS['horse-race']}ms`)
    expect(Number.parseFloat(horseEl('b').style.transitionDuration)).toBeGreaterThan(
      THEATER_MS['horse-race'],
    )

    act(() => {
      vi.advanceTimersByTime(THEATER_MS['horse-race'])
    })

    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
