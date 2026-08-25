import { render, screen } from '@testing-library/react'
import Roulette, { targetRotation } from './Roulette'
import { ROULETTE_TURNS } from '../theater'
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

function rotationOf(element: HTMLElement): number {
  const match = /rotate\((-?\d+(?:\.\d+)?)deg\)/.exec(element.style.transform)
  if (!match) {
    throw new Error(`expected a rotate() transform, got "${element.style.transform}"`)
  }
  return Number(match[1])
}

describe('targetRotation', () => {
  it('strictly increases across consecutive spins with the same winner', () => {
    const first = targetRotation(0, 1, 3)
    const second = targetRotation(first, 1, 3)
    const third = targetRotation(second, 1, 3)

    expect(second).toBeGreaterThan(first)
    expect(third).toBeGreaterThan(second)
  })

  it('advances at least ROULETTE_TURNS full turns per spin', () => {
    const first = targetRotation(0, 2, 3)
    expect(first).toBeGreaterThanOrEqual(ROULETTE_TURNS * 360)

    const second = targetRotation(first, 0, 3)
    expect(second - first).toBeGreaterThanOrEqual(ROULETTE_TURNS * 360)
  })

  it('stops with the winner slice center at the pointer', () => {
    // 3 slices, winner index 1 → center at 180° → rotation ≡ 180 (mod 360)
    const angle = targetRotation(0, 1, 3)
    expect(((angle % 360) + 360) % 360).toBeCloseTo(180, 5)

    // 4 slices, winner index 0 → center at 45° → rotation ≡ 315 (mod 360)
    const other = targetRotation(1234.5, 0, 4)
    expect(((other % 360) + 360) % 360).toBeCloseTo(315, 5)
  })
})

describe('Roulette', () => {
  beforeEach(() => {
    vi.mocked(pickIndex).mockClear()
  })

  it('shows the given winnerId without a second pick', () => {
    render(<Roulette options={options} winnerId="b" phase="spinning" />)

    expect(screen.getByTestId('roulette')).toHaveAttribute('data-winner-id', 'b')
    expect(screen.getByText('Cafe Luna')).toBeInTheDocument()
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('rotates forward on every consecutive spin, even with the same winner', () => {
    const { rerender } = render(
      <Roulette options={options} winnerId="b" phase="spinning" />,
    )
    const wheel = screen.getByTestId('roulette-wheel')

    const first = rotationOf(wheel)
    rerender(<Roulette options={options} winnerId="b" phase="revealed" />)

    rerender(<Roulette options={options} winnerId="b" phase="spinning" />)
    const second = rotationOf(wheel)
    rerender(<Roulette options={options} winnerId="b" phase="revealed" />)

    rerender(<Roulette options={options} winnerId="a" phase="spinning" />)
    const third = rotationOf(wheel)

    expect(second).toBeGreaterThan(first)
    expect(third).toBeGreaterThan(second)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
