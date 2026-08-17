import { useReducer } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import OptionEditor from './OptionEditor'
import { canSpin, createInitialState, MAX_OPTIONS, pickerReducer } from '../state/pickerReducer'
import { validOptions } from '../domain/options'
import type { PickerState } from '../domain/types'

function EditorHarness({ initial }: { initial: PickerState }) {
  const [state, dispatch] = useReducer(pickerReducer, initial)
  const nextId = `opt-${state.options.length + 1}`

  return (
    <div>
      <OptionEditor
        options={state.options}
        disabled={state.phase === 'spinning'}
        canAdd={state.options.length < MAX_OPTIONS}
        onAdd={() => dispatch({ type: 'ADD_OPTION', id: nextId })}
        onChange={(id, label) => dispatch({ type: 'UPDATE_OPTION', id, label })}
        onRemove={(id) => dispatch({ type: 'REMOVE_OPTION', id })}
      />
      <button
        type="button"
        disabled={!canSpin(state)}
        onClick={() => {
          const winner = validOptions(state.options)[0]
          if (winner) {
            dispatch({ type: 'START_SPIN', winnerId: winner.id })
          }
        }}
      >
        Spin
      </button>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="count">{state.options.length}</span>
    </div>
  )
}

describe('OptionEditor', () => {
  it('applies idle add, edit, and remove', async () => {
    const user = userEvent.setup()
    render(
      <EditorHarness
        initial={createInitialState({
          options: [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
          ],
        })}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Add option' }))
    expect(screen.getByTestId('count')).toHaveTextContent('4')

    const second = screen.getByLabelText('Option 2 label')
    await user.clear(second)
    await user.type(second, 'Bravo')
    expect(second).toHaveValue('Bravo')

    await user.click(screen.getByRole('button', { name: 'Remove option 3' }))
    expect(screen.getByTestId('count')).toHaveTextContent('3')
  })

  it('locks the set while spinning', async () => {
    const user = userEvent.setup()
    render(
      <EditorHarness
        initial={createInitialState({
          options: [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: 'Beta' },
            { id: 'c', label: 'Gamma' },
          ],
          phase: 'spinning',
          winnerId: 'a',
        })}
      />,
    )

    const first = screen.getByLabelText('Option 1 label')
    expect(first).toBeDisabled()
    await user.type(first, 'Nope')
    expect(first).toHaveValue('Alpha')
    expect(screen.getByRole('button', { name: 'Add option' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Remove option 2' })).toBeDisabled()
    expect(screen.getByTestId('count')).toHaveTextContent('3')
  })

  it('blocks spin when a blank label leaves fewer than two valids', () => {
    render(
      <EditorHarness
        initial={createInitialState({
          options: [
            { id: 'a', label: 'Alpha' },
            { id: 'b', label: '   ' },
          ],
        })}
      />,
    )

    expect(screen.getByRole('button', { name: 'Spin' })).toBeDisabled()
    expect(screen.getByTestId('phase')).toHaveTextContent('idle')
  })

  it('caps the set at 12', async () => {
    const user = userEvent.setup()
    const twelve = Array.from({ length: 12 }, (_, index) => ({
      id: `o-${index}`,
      label: `Item ${index}`,
    }))
    render(<EditorHarness initial={createInitialState({ options: twelve })} />)

    expect(screen.getByRole('button', { name: 'Add option' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Add option' }))
    expect(screen.getByTestId('count')).toHaveTextContent('12')
  })
})
