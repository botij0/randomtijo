import { act, render, screen } from '@testing-library/react'
import ClawMachine, {
  CLAW_GAP_REM,
  CLAW_GRAB_OFFSET_REM,
  CLAW_PRIZE_REM,
  CLAW_RAIL_REM,
  CLAW_REST_LEFT,
  CLAW_REST_TOP,
  clawAimLeft,
  clawColumns,
  clawDropTop,
  clawSweepCycle,
  clawSweepLefts,
} from './ClawMachine'
import {
  CLAW_AIM_MS,
  CLAW_DROP_MS,
  CLAW_GRAB_MS,
  CLAW_LIFT_MS,
  CLAW_SWEEP_HOPS,
  CLAW_SWEEP_STEP_MS,
  SLICE_COLORS,
  THEATER_MS,
  THEATER_RESET_MS,
} from '../theater'
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

function clawEl(): HTMLElement {
  return screen.getByTestId('claw')
}

function prizeEl(id: string): HTMLElement {
  return screen.getByTestId(`prize-${id}`)
}

describe('clawColumns', () => {
  it('uses one column per option up to four, then four columns', () => {
    expect(clawColumns(2)).toBe(2)
    expect(clawColumns(3)).toBe(3)
    expect(clawColumns(4)).toBe(4)
    expect(clawColumns(5)).toBe(4)
    expect(clawColumns(12)).toBe(4)
  })
})

describe('clawAimLeft and clawDropTop', () => {
  it('places each column at a distinct cell center and aims the grab at the prize', () => {
    expect(clawAimLeft(0, 3)).not.toBe(clawAimLeft(1, 3))
    expect(clawAimLeft(1, 3)).not.toBe(clawAimLeft(2, 3))
    expect(clawAimLeft(0, 3)).toBe(`${((0 + 0.5) / 3) * 100}%`)
    expect(clawDropTop(0, 3)).toBe(
      `${CLAW_RAIL_REM + CLAW_PRIZE_REM / 2 - CLAW_GRAB_OFFSET_REM}rem`,
    )
    expect(clawDropTop(0, 5)).toBe(
      `${CLAW_RAIL_REM + CLAW_PRIZE_REM / 2 - CLAW_GRAB_OFFSET_REM}rem`,
    )
    expect(clawDropTop(4, 5)).toBe(
      `${CLAW_RAIL_REM + CLAW_PRIZE_REM + CLAW_GAP_REM + CLAW_PRIZE_REM / 2 - CLAW_GRAB_OFFSET_REM}rem`,
    )
    expect(clawDropTop(0, 5)).not.toBe(clawDropTop(4, 5))
  })
})

describe('clawSweepCycle and clawSweepLefts', () => {
  it('ping-pongs across columns so the claw travels the rail', () => {
    expect(clawSweepCycle(3)).toEqual([0, 1, 2, 1])
    const stops = clawSweepLefts(3)
    expect(stops).toHaveLength(CLAW_SWEEP_HOPS)
    expect(stops[0]).toBe(clawAimLeft(0, 3))
    expect(stops[1]).toBe(clawAimLeft(1, 3))
    expect(new Set(stops).size).toBeGreaterThan(1)
  })
})

describe('ClawMachine', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(pickIndex).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sweeps the rail then grabs the given winnerId without a second pick', () => {
    const stops = clawSweepLefts(3)
    render(<ClawMachine options={options} winnerId="a" phase="spinning" />)

    expect(screen.getByTestId('claw-machine')).toHaveAttribute('data-winner-id', 'a')
    expect(prizeEl('a')).toHaveTextContent('Alpha')
    expect(prizeEl('b')).toHaveTextContent('Cafe Luna')
    expect(prizeEl('c')).toHaveTextContent('Gamma')
    expect(pickIndex).not.toHaveBeenCalled()

    expect(clawEl()).toHaveAttribute('data-step', 'rest')
    expect(clawEl().style.left).toBe(CLAW_REST_LEFT)
    expect(clawEl().style.top).toBe(CLAW_REST_TOP)
    expect(prizeEl('a')).toHaveAttribute('data-grabbed', 'false')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'sweep')
    expect(clawEl().style.left).toBe(stops[0])
    expect(clawEl().style.top).toBe(CLAW_REST_TOP)
    expect(clawEl().style.transitionDuration).toBe(`${CLAW_SWEEP_STEP_MS}ms`)

    act(() => {
      vi.advanceTimersByTime(CLAW_SWEEP_STEP_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'sweep')
    expect(clawEl().style.left).toBe(stops[1])
    expect(clawEl().style.left).not.toBe(clawAimLeft(0, 3))
    expect(clawEl().style.top).toBe(CLAW_REST_TOP)

    act(() => {
      vi.advanceTimersByTime(CLAW_SWEEP_STEP_MS * (CLAW_SWEEP_HOPS - 1))
    })

    expect(clawEl()).toHaveAttribute('data-step', 'aim')
    expect(clawEl().style.left).toBe(clawAimLeft(0, 3))
    expect(clawEl().style.top).toBe(CLAW_REST_TOP)
    expect(clawEl().style.transitionDuration).toBe(`${CLAW_AIM_MS}ms`)

    act(() => {
      vi.advanceTimersByTime(CLAW_AIM_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'drop')
    expect(clawEl().style.left).toBe(clawAimLeft(0, 3))
    expect(clawEl().style.top).toBe(clawDropTop(0, 3))
    expect(clawEl().style.transitionDuration).toBe(`${CLAW_DROP_MS}ms`)

    act(() => {
      vi.advanceTimersByTime(CLAW_DROP_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'grab')
    expect(clawEl()).toHaveAttribute('data-closed', 'true')
    expect(prizeEl('a')).toHaveAttribute('data-grabbed', 'true')
    expect(prizeEl('b')).toHaveAttribute('data-grabbed', 'false')
    expect(clawEl()).toHaveTextContent('Winner')
    expect(clawEl()).toHaveTextContent('Alpha')
    expect(clawEl().style.getPropertyValue('--capsule')).toBe(SLICE_COLORS[0])

    act(() => {
      vi.advanceTimersByTime(CLAW_GRAB_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'lift')
    expect(clawEl().style.top).toBe(CLAW_REST_TOP)
    expect(clawEl().style.transitionDuration).toBe(`${CLAW_LIFT_MS}ms`)
    expect(prizeEl('a')).toHaveAttribute('data-grabbed', 'true')
    expect(pickIndex).not.toHaveBeenCalled()
  })

  it('resets to rest on a repeat play and grabs the new winner', () => {
    const { rerender } = render(
      <ClawMachine options={options} winnerId="a" phase="spinning" />,
    )

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS + THEATER_MS['claw-machine'])
    })
    rerender(<ClawMachine options={options} winnerId="a" phase="revealed" />)
    expect(clawEl()).toHaveAttribute('data-step', 'lift')
    expect(prizeEl('a')).toHaveAttribute('data-grabbed', 'true')
    expect(clawEl()).toHaveTextContent('Alpha')

    rerender(<ClawMachine options={options} winnerId="c" phase="spinning" />)
    expect(clawEl()).toHaveAttribute('data-step', 'rest')
    expect(clawEl().style.left).toBe(CLAW_REST_LEFT)
    expect(clawEl().style.transitionDuration).toBe('0ms')
    expect(prizeEl('a')).toHaveAttribute('data-grabbed', 'false')
    expect(prizeEl('c')).toHaveAttribute('data-grabbed', 'false')

    act(() => {
      vi.advanceTimersByTime(THEATER_RESET_MS)
    })

    expect(clawEl()).toHaveAttribute('data-step', 'sweep')
    expect(clawEl().style.left).toBe(clawSweepLefts(3)[0])
    expect(clawEl().style.transitionDuration).toBe(`${CLAW_SWEEP_STEP_MS}ms`)
    expect(pickIndex).not.toHaveBeenCalled()
  })
})
