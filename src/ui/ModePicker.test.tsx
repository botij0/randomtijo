import { useReducer } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ModePicker from './ModePicker'
import { createInitialState, pickerReducer } from '../state/pickerReducer'
import type { PickerState } from '../domain/types'

function ModeHarness({ initial }: { initial: PickerState }) {
  const [state, dispatch] = useReducer(pickerReducer, initial)
  return (
    <div>
      <ModePicker
        mode={state.mode}
        disabled={state.phase === 'spinning'}
        onChange={(mode) => dispatch({ type: 'SET_MODE', mode })}
      />
      <span data-testid="mode">{state.mode}</span>
    </div>
  )
}

describe('ModePicker', () => {
  it('switches to slots while idle', async () => {
    const user = userEvent.setup()
    render(<ModeHarness initial={createInitialState({ phase: 'idle', mode: 'roulette' })} />)

    await user.click(screen.getByRole('radio', { name: 'Slots' }))
    expect(screen.getByTestId('mode')).toHaveTextContent('slots')
    expect(screen.getByRole('radio', { name: 'Slots' })).toBeChecked()
  })

  it('switches to horse race while idle', async () => {
    const user = userEvent.setup()
    render(<ModeHarness initial={createInitialState({ phase: 'idle', mode: 'roulette' })} />)

    await user.click(screen.getByRole('radio', { name: 'Horse race' }))
    expect(screen.getByTestId('mode')).toHaveTextContent('horse-race')
    expect(screen.getByRole('radio', { name: 'Horse race' })).toBeChecked()
  })

  it('rejects switching to slots while roulette is spinning', async () => {
    const user = userEvent.setup()
    render(
      <ModeHarness
        initial={createInitialState({
          phase: 'spinning',
          mode: 'roulette',
          winnerId: 'opt-1',
        })}
      />,
    )

    const slots = screen.getByRole('radio', { name: 'Slots' })
    expect(slots).toBeDisabled()
    await user.click(slots)
    expect(screen.getByTestId('mode')).toHaveTextContent('roulette')
    expect(screen.getByRole('radio', { name: 'Roulette' })).toBeChecked()
  })

  it('rejects switching to horse race while roulette is spinning', async () => {
    const user = userEvent.setup()
    render(
      <ModeHarness
        initial={createInitialState({
          phase: 'spinning',
          mode: 'roulette',
          winnerId: 'opt-1',
        })}
      />,
    )

    const horseRace = screen.getByRole('radio', { name: 'Horse race' })
    expect(horseRace).toBeDisabled()
    await user.click(horseRace)
    expect(screen.getByTestId('mode')).toHaveTextContent('roulette')
    expect(screen.getByRole('radio', { name: 'Roulette' })).toBeChecked()
  })
})
