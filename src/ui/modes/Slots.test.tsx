import { act, render, screen } from '@testing-library/react'
import Slots from './Slots'
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

describe('Slots', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('reels to the given winnerId without a second pick', () => {
    const onComplete = vi.fn()
    render(<Slots options={options} winnerId="b" phase="spinning" onComplete={onComplete} />)

    expect(screen.getByTestId('slots')).toHaveAttribute('data-winner-id', 'b')
    expect(screen.getAllByText('Cafe Luna').length).toBeGreaterThan(0)
    expect(pickIndex).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(THEATER_MS)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
