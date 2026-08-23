import { act, render, screen } from '@testing-library/react'
import Slots, { reelOffset, SLOT_ITEM_HEIGHT } from './Slots'
import { SLOT_LOOPS, THEATER_MS } from '../theater'
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

function offsetOf(element: HTMLElement): number {
  const match = /translateY\((-?\d+(?:\.\d+)?)px\)/.exec(element.style.transform)
  if (!match) {
    throw new Error(`expected a translateY() transform, got "${element.style.transform}"`)
  }
  return -Number(match[1])
}

describe('reelOffset', () => {
  it('strictly increases across chained spins with the same winner', () => {
    const first = reelOffset(0, 1, 3)
    const second = reelOffset(first, 1, 3)
    const third = reelOffset(second, 1, 3)

    expect(second).toBeGreaterThan(first)
    expect(third).toBeGreaterThan(second)
  })

  it('advances at least SLOT_LOOPS full cycles per spin', () => {
    const cycle = 3 * SLOT_ITEM_HEIGHT
    const first = reelOffset(0, 0, 3)
    expect(first).toBeGreaterThanOrEqual(SLOT_LOOPS * cycle)

    const second = reelOffset(first, 2, 3)
    expect(second - first).toBeGreaterThanOrEqual(SLOT_LOOPS * cycle)
  })

  it('settles congruent to the winner position', () => {
    const cycle = 3 * SLOT_ITEM_HEIGHT
    expect(reelOffset(0, 1, 3) % cycle).toBe(1 * SLOT_ITEM_HEIGHT)
    expect(reelOffset(640, 2, 3) % cycle).toBe(2 * SLOT_ITEM_HEIGHT)
  })
})

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
      vi.advanceTimersByTime(THEATER_MS.slots)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('scrolls forward on every spin and snap-settles congruent to the winner', () => {
    const onComplete = vi.fn()
    const { rerender } = render(
      <Slots options={options} winnerId="b" phase="spinning" onComplete={onComplete} />,
    )
    const reel = screen.getByTestId('slots-reel')

    const first = offsetOf(reel)
    expect(first).toBeGreaterThanOrEqual(SLOT_LOOPS * 3 * SLOT_ITEM_HEIGHT)
    act(() => {
      vi.advanceTimersByTime(THEATER_MS.slots)
    })
    rerender(<Slots options={options} winnerId="b" phase="revealed" onComplete={onComplete} />)

    const snapped = offsetOf(reel)
    expect(snapped).toBe(1 * SLOT_ITEM_HEIGHT)

    rerender(<Slots options={options} winnerId="b" phase="spinning" onComplete={onComplete} />)
    const second = offsetOf(reel)
    expect(second).toBeGreaterThan(snapped)
    expect(second - snapped).toBeGreaterThanOrEqual(SLOT_LOOPS * 3 * SLOT_ITEM_HEIGHT)
    act(() => {
      vi.advanceTimersByTime(THEATER_MS.slots)
    })
    rerender(<Slots options={options} winnerId="b" phase="revealed" onComplete={onComplete} />)

    rerender(<Slots options={options} winnerId="a" phase="spinning" onComplete={onComplete} />)
    const third = offsetOf(reel)

    expect(third).toBeGreaterThan(second)
    expect(third % (3 * SLOT_ITEM_HEIGHT)).toBe(0 * SLOT_ITEM_HEIGHT)
    expect(onComplete).toHaveBeenCalledTimes(2)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
