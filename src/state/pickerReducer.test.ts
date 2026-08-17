import { createInitialState, pickerReducer } from './pickerReducer'

function option(id: string, label: string) {
  return { id, label }
}

describe('pickerReducer', () => {
  it('chooses a winner once through idle → spinning → revealed', () => {
    let state = createInitialState({
      options: [option('a', 'Alpha'), option('b', 'Beta'), option('c', 'Gamma')],
      phase: 'idle',
      winnerId: null,
    })

    state = pickerReducer(state, { type: 'START_SPIN', winnerId: 'b' })
    expect(state.phase).toBe('spinning')
    expect(state.winnerId).toBe('b')

    const whileSpinning = pickerReducer(state, { type: 'START_SPIN', winnerId: 'c' })
    expect(whileSpinning.phase).toBe('spinning')
    expect(whileSpinning.winnerId).toBe('b')

    state = pickerReducer(state, { type: 'COMPLETE_SPIN' })
    expect(state.phase).toBe('revealed')
    expect(state.winnerId).toBe('b')
  })

  it('stays idle with no winner when fewer than 2 valid labels', () => {
    const state = createInitialState({
      options: [option('a', 'Alpha'), option('b', '   ')],
      phase: 'idle',
      winnerId: null,
    })

    const next = pickerReducer(state, { type: 'START_SPIN', winnerId: 'a' })
    expect(next.phase).toBe('idle')
    expect(next.winnerId).toBeNull()
  })

  it('locks edits while spinning', () => {
    const spinning = createInitialState({
      options: [option('a', 'Alpha'), option('b', 'Beta'), option('c', 'Gamma')],
      phase: 'spinning',
      winnerId: 'a',
    })

    expect(pickerReducer(spinning, { type: 'ADD_OPTION', id: 'd' }).options).toHaveLength(3)
    expect(
      pickerReducer(spinning, { type: 'UPDATE_OPTION', id: 'b', label: 'Changed' }).options.find(
        (item) => item.id === 'b',
      )?.label,
    ).toBe('Beta')
    expect(pickerReducer(spinning, { type: 'REMOVE_OPTION', id: 'c' }).options).toHaveLength(3)
  })

  it('caps the set at 12 options', () => {
    const twelve = Array.from({ length: 12 }, (_, index) => option(`o-${index}`, `Item ${index}`))
    const state = createInitialState({ options: twelve, phase: 'idle' })
    const next = pickerReducer(state, { type: 'ADD_OPTION', id: 'o-12' })
    expect(next.options).toHaveLength(12)
  })
})
