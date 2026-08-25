import { armTheater, theaterCompleteMs, THEATER_RESET_MS } from './theater'

describe('theaterCompleteMs', () => {
  it('is THEATER_MS alone for roulette and slots', () => {
    expect(theaterCompleteMs('roulette')).toBe(4000)
    expect(theaterCompleteMs('slots')).toBe(3000)
  })

  it('adds THEATER_RESET_MS for horse race, claw, and elimination', () => {
    expect(THEATER_RESET_MS).toBe(40)
    expect(theaterCompleteMs('horse-race')).toBe(6040)
    expect(theaterCompleteMs('claw-machine')).toBe(9580)
    expect(theaterCompleteMs('elimination-board')).toBe(5040)
  })
})

describe('armTheater', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires onComplete once after the delay', () => {
    const onComplete = vi.fn()
    armTheater(250, onComplete)

    vi.advanceTimersByTime(249)
    expect(onComplete).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(onComplete).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(250)
    expect(onComplete).toHaveBeenCalledTimes(1)
  })

  it('cancel prevents onComplete', () => {
    const onComplete = vi.fn()
    const cancel = armTheater(250, onComplete)

    cancel()
    vi.advanceTimersByTime(250)

    expect(onComplete).not.toHaveBeenCalled()
  })

  it('a new arm after cancel fires once', () => {
    const onComplete = vi.fn()
    const first = armTheater(250, onComplete)
    first()

    armTheater(100, onComplete)
    vi.advanceTimersByTime(100)

    expect(onComplete).toHaveBeenCalledTimes(1)
  })
})
