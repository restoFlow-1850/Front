import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '@testing-library/jest-dom/vitest'

import api from '../../../services/axios'
import { getFeedbackStats } from '../api'
import FeedbackPage from '../pages/FeedbackPage'

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
    on: vi.fn(),
    off: vi.fn(),
  },
}))

vi.mock('../../../utils/sound', () => ({
  playNotificationSound: vi.fn(),
}))

vi.mock('react-toastify', () => ({
  toast: {
    info: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
  },
}))

function renderFeedbackPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <FeedbackPage />
    </QueryClientProvider>,
  )
}

const BACKEND_FEEDBACKS = [
  {
    _id: '673f1a2b3c4d5e6f7a8b9c01',
    restaurant: '673f1a2b3c4d5e6f7a8b9c00',
    rating: 5,
    category: "Taom ta'mi",
    customerName: 'Dilshod',
    customerPhone: '+998901234567',
    tableNumber: '4',
    comment: 'Osh juda mazali chiqibdi!',
    status: 'new',
    adminReply: null,
    repliedAt: null,
    createdAt: '2026-11-21T10:00:00.000Z',
  },
  {
    _id: '673f1a2b3c4d5e6f7a8b9c02',
    restaurant: '673f1a2b3c4d5e6f7a8b9c00',
    rating: 2,
    category: 'Xizmat tezligi',
    customerName: 'Malika',
    customerPhone: '—',
    tableNumber: '7',
    comment: 'Buyurtma biroz kechikdi.',
    status: 'replied',
    adminReply: 'Uzr so‘raymiz, keyingi safar tezroq xizmat ko‘rsatamiz!',
    repliedAt: '2026-11-21T10:15:00.000Z',
    createdAt: '2026-11-21T09:30:00.000Z',
  },
]

const BACKEND_STATS = {
  total: 2,
  avgRating: 3.5,
  positivePercent: 50,
  attentionCount: 1,
  newCount: 1,
}

function backendListResponse(feedbacks) {
  return {
    data: {
      success: true,
      message: "Mijozlar fikrlari ro'yxati",
      data: { feedbacks },
      pagination: {
        page: 1,
        limit: 200,
        total: feedbacks.length,
        totalPages: 1,
      },
    },
  }
}

function backendStatsResponse(stats = BACKEND_STATS) {
  return {
    data: {
      success: true,
      message: 'Mijozlar fikrlari statistikasi',
      data: { stats, ...stats },
    },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('/feedback sahifasi — loading, bo‘sh ro‘yxat, xato + qayta urinish va GET /feedbacks/stats', () => {
  it('getFeedbackStats() GET /feedbacks/stats endpointini chaqiradi (200 ta fikrdan emas)', async () => {
    api.get.mockResolvedValueOnce(
      backendStatsResponse({
        total: 350,
        avgRating: 4.6,
        positivePercent: 88,
        attentionCount: 12,
        newCount: 19,
      }),
    )

    const stats = await getFeedbackStats()

    expect(api.get).toHaveBeenCalledTimes(1)
    expect(api.get).toHaveBeenCalledWith('/feedbacks/stats')
    expect(stats).toEqual({
      total: 350,
      avgRating: 4.6,
      positivePercent: 88,
      attentionCount: 12,
      newCount: 19,
    })
  })

  it('1) loading: so‘rov tugamaguncha yuklash (skeleton) holatini ko‘rsatadi', () => {
    api.get.mockReturnValue(new Promise(() => {}))

    renderFeedbackPage()

    expect(screen.getByTestId('feedback-loading')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-empty')).not.toBeInTheDocument()
    expect(screen.queryByTestId('feedback-error')).not.toBeInTheDocument()
  })

  it('2) bo‘sh ro‘yxat: backend bo‘sh massiv qaytarsa «Fikrlar topilmadi» ko‘rsatiladi', async () => {
    api.get.mockImplementation((url) =>
      url === '/feedbacks/stats'
        ? Promise.resolve(backendStatsResponse({ total: 0, avgRating: 0, positivePercent: 0, attentionCount: 0, newCount: 0 }))
        : Promise.resolve(backendListResponse([])),
    )

    renderFeedbackPage()

    expect(await screen.findByTestId('feedback-empty')).toBeInTheDocument()
    expect(screen.getByText('Fikrlar topilmadi')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-error')).not.toBeInTheDocument()
  })

  it('3) xato + qayta urinish: API xato berganda xato xabari va «Qayta urinish» tugmasi chiqadi; bosilganda qayta yuklaydi', async () => {
    const serverError = Object.assign(new Error('Request failed'), {
      response: { status: 500, data: { message: 'Server vaqtincha javob bermadi' } },
    })
    api.get.mockRejectedValueOnce(serverError).mockRejectedValueOnce(serverError)

    renderFeedbackPage()

    const errorBox = await screen.findByTestId('feedback-error')
    expect(errorBox).toBeInTheDocument()
    expect(screen.getByText('Fikrlarni yuklashda xatolik yuz berdi')).toBeInTheDocument()
    expect(screen.getByText('Server vaqtincha javob bermadi')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-empty')).not.toBeInTheDocument()

    // Keyingi urinishda /feedbacks va /feedbacks/stats muvaffaqiyatli javob qaytaradi
    api.get.mockImplementation((url) =>
      url === '/feedbacks/stats'
        ? Promise.resolve(backendStatsResponse(BACKEND_STATS))
        : Promise.resolve(backendListResponse(BACKEND_FEEDBACKS)),
    )

    fireEvent.click(screen.getByTestId('feedback-retry'))

    expect(await screen.findByText('Dilshod')).toBeInTheDocument()
    expect(screen.getByText('"Osh juda mazali chiqibdi!"')).toBeInTheDocument()
    expect(screen.getByText('Malika')).toBeInTheDocument()
    expect(screen.queryByTestId('feedback-error')).not.toBeInTheDocument()
  })

  it('4) yangi backend moduli (/api/feedbacks va /api/feedbacks/stats) javobini to‘g‘ri ko‘rsatadi, filtrlaydi va javob yuboradi', async () => {
    api.get.mockImplementation((url) =>
      url === '/feedbacks/stats'
        ? Promise.resolve(backendStatsResponse(BACKEND_STATS))
        : Promise.resolve(backendListResponse(BACKEND_FEEDBACKS)),
    )
    api.patch.mockResolvedValue({
      data: {
        success: true,
        message: 'Fikr yangilandi',
        data: {
          feedback: {
            ...BACKEND_FEEDBACKS[0],
            status: 'reviewed',
          },
        },
      },
    })

    renderFeedbackPage()

    expect(await screen.findByText('Dilshod')).toBeInTheDocument()
    expect(screen.getByText('Stol № 4')).toBeInTheDocument()
    expect(screen.getByText('Uzr so‘raymiz, keyingi safar tezroq xizmat ko‘rsatamiz!')).toBeInTheDocument()

    // Statistika /feedbacks/stats dan keladi: 3.5 / 5.0; ijobiy = 50%
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/feedbacks/stats')
      expect(screen.getByText('3.5 / 5.0')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    // Qidiruv filtri (client-side)
    const searchInput = screen.getByPlaceholderText('Mijoz ismi, izoh yoki stol bo\'yicha qidiruv...')
    fireEvent.change(searchInput, { target: { value: 'Dilshod' } })
    expect(screen.getByText('Dilshod')).toBeInTheDocument()
    expect(screen.queryByText('Malika')).not.toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: '' } })

    // «Ko'rib chiqildi deb belgilash» tugmasi PATCH /feedbacks/:id chaqiradi
    fireEvent.click(screen.getByRole('button', { name: /Ko'rib chiqildi deb belgilash/i }))
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/feedbacks/673f1a2b3c4d5e6f7a8b9c01', {
        status: 'reviewed',
        adminReply: undefined,
      })
    })
  })
})
