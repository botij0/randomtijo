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

  it('exposes the revealed phase hook with a confetti burst', () => {
    render(
      <ResultBanner
        phase="revealed"
        winner={{ id: 'a', label: 'Cafe Luna' }}
      />,
    )

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('data-phase', 'revealed')
    expect(status.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(6)
  })

  it('stays quiet while idle or spinning', () => {
    const { rerender } = render(<ResultBanner phase="idle" winner={null} />)

    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('data-phase', 'idle')
    expect(status.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(0)

    rerender(<ResultBanner phase="spinning" winner={{ id: 'a', label: 'Cafe Luna' }} />)
    expect(status).toHaveAttribute('data-phase', 'spinning')
    expect(status.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(0)
  })
})
