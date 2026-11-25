import { describe, it, expect, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, options) => options?.defaultValue ?? key,
  }),
}))

import QueryError from '../QueryError'

describe('QueryError', () => {
  it('shows a backend-unavailable message for 502 and lets the user retry', () => {
    const onRetry = vi.fn()
    render(<QueryError error={{ response: { status: 502 } }} onRetry={onRetry} />)

    expect(screen.getByText(/Backend vaqtinchalik ishlamayapti/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Qayta urinish' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('shows the server message for client errors', () => {
    render(
      <QueryError
        error={{ response: { status: 403, data: { message: 'Ruxsat yo\'q' } } }}
        fallback="Xatolik"
      />,
    )
    expect(screen.getByText('Ruxsat yo\'q')).toBeInTheDocument()
  })

  it('uses the provided fallback for errors without a message', () => {
    render(<QueryError error={{ response: { status: 400, data: {} } }} fallback="Yomon so'rov" />)
    expect(screen.getByText("Yomon so'rov")).toBeInTheDocument()
  })
})
