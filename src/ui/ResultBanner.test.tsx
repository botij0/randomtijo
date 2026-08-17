import { render, screen } from '@testing-library/react'
import ResultBanner from './ResultBanner'

describe('ResultBanner', () => {
  it('announces Cafe Luna as live text', () => {
    render(
      <ResultBanner
        phase="revealed"
        winner={{ id: 'a', label: 'Cafe Luna' }}
      />,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-live', 'polite')
    expect(status).toHaveTextContent('Cafe Luna')
  })
})
