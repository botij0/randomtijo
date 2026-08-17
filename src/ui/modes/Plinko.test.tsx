import { act, render, screen } from '@testing-library/react'
import Plinko from './Plinko'
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

describe('Plinko', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves to the given winnerId and does not call pickIndex', () => {
    const onComplete = vi.fn()
    render(<Plinko options={options} winnerId="b" phase="spinning" onComplete={onComplete} />)

    expect(screen.getByTestId('plinko')).toHaveAttribute('data-winner-id', 'b')
    expect(screen.getByTestId('plinko')).toHaveAttribute('data-slot-index', '1')
    expect(pickIndex).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(THEATER_MS)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
