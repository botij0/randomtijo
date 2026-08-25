import { act, render, screen } from '@testing-library/react'
import EliminationBoard, { eliminationAtMs, eliminationOrder } from './EliminationBoard'
import { ELIMINATION_HOLD_MS, THEATER_MS, THEATER_RESET_MS } from '../theater'
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

function lightEl(id: string): HTMLElement {
  return screen.getByTestId(`light-${id}`)
}

describe('eliminationOrder', () => {
  const ids = options.map((option) => option.id)

  it('is a permutation of losers and never includes the winner', () => {
    const order = eliminationOrder(ids, 'b', 1)
    expect(order).not.toContain('b')
    expect([...order].sort()).toEqual(['a', 'c'])
  })

  it('does not walk losers in list order', () => {
    expect(eliminationOrder(ids, 'b', 1)).not.toEqual(['a', 'c'])
    expect(eliminationOrder(['a', 'b', 'c', 'd'], 'a', 1)).not.toEqual(['b', 'c', 'd'])
  })
})

describe('eliminationAtMs', () => {
  it('spreads loser knockouts across the usable theater window', () => {
    const usable = THEATER_MS['elimination-board'] - ELIMINATION_HOLD_MS
    expect(eliminationAtMs(0, 2)).toBe(Math.round((1 / 2) * usable))
    expect(eliminationAtMs(1, 2)).toBe(usable)
    expect(eliminationAtMs(1, 2)).toBeGreaterThan(eliminationAtMs(0, 2))
  })
})

describe('EliminationBoard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('darkens every loser and leaves the given winnerId lit without a second pick', () => {
    render(<EliminationBoard options={options} winnerId="b" phase="spinning" />)

    expect(screen.getByTestId('elimination-board')).toHaveAttribute('data-winner-id', 'b')
    expect(lightEl('a')).toHaveTextContent('Alpha')
    expect(lightEl('b')).toHaveTextContent('Cafe Luna')
    expect(lightEl('c')).toHaveTextContent('Gamma')
    expect(pickIndex).not.toHaveBeenCalled()

    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('c')).toHaveAttribute('data-eliminated', 'false')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS)
    })

    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')

    const order = eliminationOrder(
      options.map((option) => option.id),
      'b',
      1,
    )

    act(() => {
      vi.advanceTimersByTime(eliminationAtMs(0, 2))
    })

    expect(lightEl(order[0])).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl(order[1])).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')

    act(() => {
      vi.advanceTimersByTime(eliminationAtMs(1, 2) - eliminationAtMs(0, 2))
    })

    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('c')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-survived', 'false')
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('relights every option on a repeat play and eliminates toward the new winner', () => {
    const { rerender } = render(
      <EliminationBoard options={options} winnerId="b" phase="spinning" />,
    )

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS + THEATER_MS['elimination-board'])
    })
    rerender(<EliminationBoard options={options} winnerId="b" phase="revealed" />)
    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('c')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-survived', 'true')

    rerender(<EliminationBoard options={options} winnerId="a" phase="spinning" />)
    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('c')).toHaveAttribute('data-eliminated', 'false')
    expect(lightEl('b')).toHaveAttribute('data-survived', 'false')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS + THEATER_MS['elimination-board'])
    })

    expect(lightEl('b')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('c')).toHaveAttribute('data-eliminated', 'true')
    expect(lightEl('a')).toHaveAttribute('data-eliminated', 'false')
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
