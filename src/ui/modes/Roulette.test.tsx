import { act, render, screen } from '@testing-library/react'
import Roulette from './Roulette'
import { THEATER_MS } from './theater'
import { pickIndex } from '../../domain/pick'

vi.mock('../../domain/pick', () => ({
  pickIndex: vi.fn(() => {
    throw new Error('modes must not call pickIndex')
  }),
}))

const options = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Cafe Luna' },
  { id: 'c', label: 'Gamma' },
]

describe('Roulette', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('completes toward the given winnerId without a second pick', () => {
    const onComplete = vi.fn()
    render(
      <Roulette options={options} winnerId="b" phase="spinning" onComplete={onComplete} />,
    )

    expect(screen.getByTestId('roulette')).toHaveAttribute('data-winner-id', 'b')
    expect(screen.getByText('Cafe Luna')).toBeInTheDocument()
    expect(pickIndex).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(THEATER_MS)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
