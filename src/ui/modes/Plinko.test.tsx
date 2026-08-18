import { act, render, screen } from '@testing-library/react'
import Plinko, { bouncePath } from './Plinko'
import { THEATER_MS } from './theater'
import { pickIndex } from '../../domain/pick'
import type { Rng } from '../../domain/types'

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

const BOARD_WIDTH = 400
const PEG_ROWS = 8

function slotCenterX(index: number, count: number): number {
  const slotWidth = BOARD_WIDTH / count
  return slotWidth * index + slotWidth / 2
}

function segmentCount(d: string): number {
  return (d.match(/L /g) ?? []).length
}

function finalPoint(d: string): { x: number; y: number } {
  const matches = [...d.matchAll(/L (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)/g)]
  const last = matches[matches.length - 1]
  if (!last) {
    throw new Error(`expected line segments in path "${d}"`)
  }
  return { x: Number(last[1]), y: Number(last[2]) }
}

describe('bouncePath', () => {
  it('zig-zags through at least one segment per peg row and ends at the winner slot center', () => {
    const { d, hitRows } = bouncePath(1, 3, () => 0.3)

    expect(segmentCount(d)).toBeGreaterThanOrEqual(PEG_ROWS)
    expect(finalPoint(d).x).toBeCloseTo(slotCenterX(1, 3), 1)
    expect(hitRows).toHaveLength(PEG_ROWS)
    expect(hitRows).toContain(0)
    expect(hitRows).toContain(PEG_ROWS - 1)
  })

  it('is deterministic for an injected rng while a different rng walks elsewhere', () => {
    const first = bouncePath(1, 3, () => 0.3)
    const again = bouncePath(1, 3, () => 0.3)
    expect(again.d).toBe(first.d)

    const other = bouncePath(1, 3, () => 0.8)
    expect(other.d).not.toBe(first.d)
    expect(finalPoint(other.d).x).toBeCloseTo(slotCenterX(1, 3), 1)
  })

  it('always lands in the winning slot, even at edge columns beyond the row count', () => {
    const rngs: Rng[] = [() => 0.01, () => 0.5, () => 0.99]
    for (const rng of rngs) {
      expect(finalPoint(bouncePath(0, 12, rng).d).x).toBeCloseTo(slotCenterX(0, 12), 1)
      expect(finalPoint(bouncePath(11, 12, rng).d).x).toBeCloseTo(slotCenterX(11, 12), 1)
      expect(finalPoint(bouncePath(0, 2, rng).d).x).toBeCloseTo(slotCenterX(0, 2), 1)
      expect(finalPoint(bouncePath(1, 2, rng).d).x).toBeCloseTo(slotCenterX(1, 2), 1)
    }
  })
})

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
      vi.advanceTimersByTime(THEATER_MS.plinko)
    })

    expect(onComplete).toHaveBeenCalledTimes(1)
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('drops without any result-revealing marker and marks the winning slot only on reveal', () => {
    const onComplete = vi.fn()
    const { container, rerender } = render(
      <Plinko options={options} winnerId="b" phase="spinning" onComplete={onComplete} />,
    )

    expect(container.querySelector('[class*=ghostPath]')).toBeNull()
    expect(container.querySelector('[data-slot-won]')).toBeNull()

    act(() => {
      vi.advanceTimersByTime(THEATER_MS.plinko)
    })
    expect(onComplete).toHaveBeenCalledTimes(1)

    rerender(<Plinko options={options} winnerId="b" phase="revealed" onComplete={onComplete} />)
    expect(container.querySelector('[data-slot-won="true"]')).not.toBeNull()
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
