import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { STORAGE_KEY } from './persistence/localStore'
import { pickIndex } from './domain/pick'

vi.mock('./domain/pick', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./domain/pick')>()
  return {
    ...actual,
    pickIndex: vi.fn(() => 0),
  }
})

function stubMatchMedia(reduced: boolean) {
  window.matchMedia = ((query: string) =>
    ({
      matches: reduced && query.includes('prefers-reduced-motion'),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList)
}

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    stubMatchMedia(false)
    vi.mocked(pickIndex).mockReturnValue(0)
  })

  it('keeps picker mode above the option list', () => {
    render(<App />)

    const mode = screen.getByRole('radiogroup', { name: 'Picker mode' })
    const options = screen.getByRole('heading', { name: 'Options' })
    expect(mode.compareDocumentPosition(options) & Node.DOCUMENT_POSITION_FOLLOWING).toBeGreaterThan(
      0,
    )
  })

  it('shows the horse race track when that mode is chosen', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('radio', { name: 'Horse race' }))

    expect(screen.getByTestId('horse-race')).toBeInTheDocument()
    expect(screen.getByTestId('horse-race')).toHaveAttribute('data-winner-id', '')
    expect(screen.getByText('Cafe Luna')).toBeInTheDocument()
  })

  it('skips theater under reduced motion and still reveals the winner', async () => {
    stubMatchMedia(true)
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Spin!' }))

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Cafe Luna')
    })
    expect(screen.getByRole('button', { name: 'Spin!' })).toBeEnabled()
  })

  it('restores options A, B, C and slots without a winner', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        options: [
          { id: 'a', label: 'A' },
          { id: 'b', label: 'B' },
          { id: 'c', label: 'C' },
        ],
        mode: 'slots',
        winnerId: 'b',
        phase: 'revealed',
        history: ['a', 'c'],
      }),
    )

    render(<App />)

    expect(screen.getByLabelText('Option 1 label')).toHaveValue('A')
    expect(screen.getByLabelText('Option 2 label')).toHaveValue('B')
    expect(screen.getByLabelText('Option 3 label')).toHaveValue('C')
    expect(screen.getByRole('radio', { name: 'Slots' })).toBeChecked()
    expect(screen.getByRole('status')).not.toHaveTextContent('Winner:')
    expect(screen.getByTestId('slots')).toHaveAttribute('data-winner-id', '')
  })

  it('stays usable when storage throws', async () => {
    const user = userEvent.setup()
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })

    render(<App />)

    expect(screen.getByLabelText('Option 1 label')).toHaveValue('Cafe Luna')
    await user.click(screen.getByRole('button', { name: 'Spin!' }))
    const spinningButton = screen.getByRole('button', { name: 'Spinning…' })
    expect(spinningButton).toBeDisabled()
    expect(spinningButton).toHaveAttribute('data-spinning', 'true')
    expect(spinningButton).toHaveAttribute('aria-busy', 'true')
  })
})
