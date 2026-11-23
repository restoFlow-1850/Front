import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'
import { toast } from 'react-toastify'

import api from '../../../services/axios'
import FeedbackModal from '../components/FeedbackModal'

vi.mock('../../../services/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

vi.mock('../../../services/socket', () => ({
  socket: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
}))

vi.mock('../../../utils/sound', () => ({
  playNotificationSound: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    warn: vi.fn(),
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
  },
}))

const RESTAURANT_ID = '673f1a2b3c4d5e6f7a8b9c00'
const COMMENT = 'E2E fikr: osh juda mazali!'

function renderModal(props = {}) {
  const onClose = vi.fn()
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  render(
    <QueryClientProvider client={queryClient}>
      <FeedbackModal isOpen onClose={onClose} restaurantId={RESTAURANT_ID} {...props} />
    </QueryClientProvider>,
  )

  return { onClose }
}

function submitFeedback(text) {
  if (text !== undefined) {
    fireEvent.change(screen.getByPlaceholderText('Fikr va takliflaringizni yozib qoldiring...'), {
      target: { value: text },
    })
  }
  fireEvent.submit(screen.getByRole('button', { name: /Yuborish/i }).closest('form'))
}

beforeEach(() => {
  vi.clearAllMocks()
  api.post.mockResolvedValue({
    data: { data: { feedback: { _id: 'feedback-1', comment: COMMENT } } },
  })
})

describe('FeedbackModal — mehmon fikri', () => {
  it('yuborishda restoran ID ni ?restaurant= parametr sifatida yuboradi', async () => {
    renderModal()

    submitFeedback(COMMENT)

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
    expect(api.post).toHaveBeenCalledWith(
      '/feedbacks',
      expect.objectContaining({ comment: COMMENT, rating: 5 }),
      { params: { restaurant: RESTAURANT_ID } },
    )
  })

  it("bo'sh fikrda ogohlantirish ko'rsatadi va so'rov yubormaydi", () => {
    renderModal()

    submitFeedback('   ')

    expect(toast.warn).toHaveBeenCalledWith('Iltimos, fikringizni yozib qoldiring')
    expect(api.post).not.toHaveBeenCalled()
  })

  it('muvaffaqiyatli yuborishdan keyin Yopish tugmasi modalni yopadi', async () => {
    const { onClose } = renderModal()

    submitFeedback(COMMENT)

    expect(await screen.findByText('Tashakkur!')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Yopish' }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('restoran ID berilmasa ?restaurant= parametri yuborilmaydi', async () => {
    renderModal({ restaurantId: null })

    submitFeedback(COMMENT)

    await waitFor(() => expect(api.post).toHaveBeenCalledTimes(1))
    expect(api.post).toHaveBeenCalledWith('/feedbacks', expect.any(Object), undefined)
  })
})
