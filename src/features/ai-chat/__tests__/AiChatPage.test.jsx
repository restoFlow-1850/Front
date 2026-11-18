import { afterEach, describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

import { AiChatError } from '../api'
import { sendAiMessage } from '../api'
import { toast } from 'react-toastify'
import AiChatPage from '../pages/AiChatPage'
import { AI_STORAGE_KEY } from '../lib/aiChat'

vi.mock('react-i18next', async () => {
  const uz = (await import('../../../locales/uz/common.json')).default
  const lookup = (path) =>
    path.split('.').reduce((acc, key) => (acc == null ? acc : acc[key]), uz)
  const t = (key, options) => {
    const value = lookup(key)
    if (typeof value === 'string') return value
    return options?.defaultValue ?? key
  }
  return { useTranslation: () => ({ t }) }
})

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}))

vi.mock('react-toastify', () => ({
  toast: { error: vi.fn(), info: vi.fn(), success: vi.fn() },
}))

vi.mock('../api', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, sendAiMessage: vi.fn() }
})

vi.mock('../../../components/ui', () => ({
  Button: ({ children, variant, ...props }) => <button {...props}>{children}</button>,
  Card: ({ children, padded, className }) => <div className={className}>{children}</div>,
  PageHeader: ({ title, actions }) => (
    <div>
      <h1>{title}</h1>
      {actions}
    </div>
  ),
}))

Element.prototype.scrollIntoView = vi.fn()

const BACKEND_MESSAGE = 'AI yordamchi faqat restoranga biriktirilgan xodimlar uchun'

const BACKEND_ERRORS = [
  [403, 'forbidden', BACKEND_MESSAGE],
  [503, 'notConfigured', "AI yordamchi sozlanmagan (ANTHROPIC_API_KEY yo'q)"],
  [429, 'rateLimit', "AI limiti tugadi (soatiga 30 ta savol). Birozdan keyin urinib ko'ring."],
  [429, 'rateLimit', "AI band, birozdan keyin urinib ko'ring"],
]

async function askQuestion() {
  const input = screen.getByPlaceholderText('Savolingizni yozing...')
  fireEvent.change(input, { target: { value: 'Bugungi savdo qanday?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }))
}

let confirmSpy

beforeEach(() => {
  sessionStorage.clear()
  sendAiMessage.mockReset()
  toast.error.mockClear()
  toast.info.mockClear()
  confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
})

afterEach(() => confirmSpy.mockRestore())

describe('AiChatPage xatolari', () => {
  it('403 da backend xabarini chat ichida ko‘rsatadi', async () => {
    sendAiMessage.mockRejectedValue(new AiChatError('forbidden', 403, BACKEND_MESSAGE))

    render(<AiChatPage />)
    await askQuestion()

    expect(await screen.findByText(BACKEND_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText('Faqat admin/menejer uchun')).not.toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it.each(BACKEND_ERRORS)(
    'HTTP %i da backend matni (%s) chat ichida ko‘rsatiladi',
    async (status, code, message) => {
      sendAiMessage.mockRejectedValue(new AiChatError(code, status, message))

      render(<AiChatPage />)
      await askQuestion()

      expect(await screen.findByText(message)).toBeInTheDocument()
      expect(toast.error).not.toHaveBeenCalled()
    },
  )

  it('403 da backend xabari bo‘lmasa umumiy matnni ko‘rsatadi', async () => {
    sendAiMessage.mockRejectedValue(new AiChatError('forbidden', 403))

    render(<AiChatPage />)
    await askQuestion()

    expect(await screen.findByText('Faqat admin/menejer uchun')).toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('uch marta «Qayta urinish» ham toast qo‘shmaydi', async () => {
    sendAiMessage.mockRejectedValue(new AiChatError('forbidden', 403, BACKEND_MESSAGE))

    render(<AiChatPage />)
    await askQuestion()
    await screen.findByTestId('ai-retry')

    for (let attempt = 0; attempt < 3; attempt += 1) {
      fireEvent.click(await screen.findByTestId('ai-retry'))
      await waitFor(() => expect(sendAiMessage).toHaveBeenCalledTimes(attempt + 2))
    }

    expect(toast.error).not.toHaveBeenCalled()
    expect(screen.getAllByText(BACKEND_MESSAGE)).toHaveLength(1)
    expect(sessionStorage.getItem(AI_STORAGE_KEY)).toBeTruthy()
  })
})

describe('AiChatPage tezkor savollar va suhbat tarixi', () => {
  const QUICK_LABELS = ['Bugungi tushum', 'Kam qolgan mahsulotlar', 'Ochiq buyurtmalar']

  it("bo'sh holatda uchta tezkor savol tugmasi ko'rinadi", () => {
    render(<AiChatPage />)

    expect(screen.getAllByTestId('ai-quick-prompt')).toHaveLength(3)
    for (const label of QUICK_LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('tezkor savol bosilganda yuboriladi va sessiyada saqlanadi', async () => {
    sendAiMessage.mockResolvedValue({ reply: 'Javob tayyor', source: 'server', toolCalls: [] })

    render(<AiChatPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Kam qolgan mahsulotlar' }))

    expect(await screen.findByText('Javob tayyor')).toBeInTheDocument()
    expect(sendAiMessage).toHaveBeenCalledWith(
      [{ role: 'user', content: 'Kam qolgan mahsulotlar' }],
      expect.anything(),
    )
    const stored = JSON.parse(sessionStorage.getItem(AI_STORAGE_KEY))
    expect(stored.map((message) => message.content)).toEqual([
      'Kam qolgan mahsulotlar',
      'Javob tayyor',
    ])
  })

  it('qayta ochilganda tarix sessionStorage dan tiklanadi', async () => {
    sendAiMessage.mockResolvedValue({ reply: 'Tushum hisoboti tayyor', source: 'server', toolCalls: [] })

    const { unmount } = render(<AiChatPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Bugungi tushum' }))
    expect(await screen.findByText('Tushum hisoboti tayyor')).toBeInTheDocument()
    unmount()

    render(<AiChatPage />)
    expect(screen.getByText('Bugungi tushum')).toBeInTheDocument()
    expect(screen.getByText('Tushum hisoboti tayyor')).toBeInTheDocument()
    expect(screen.queryByTestId('ai-quick-prompt')).not.toBeInTheDocument()
  })

  it('«Tozalash» tugmasi tarixni hamda saqlangan xabarlarni o‘chiradi', async () => {
    sendAiMessage.mockResolvedValue({ reply: 'Javob tayyor', source: 'server', toolCalls: [] })

    render(<AiChatPage />)
    fireEvent.click(screen.getByRole('button', { name: 'Ochiq buyurtmalar' }))
    expect(await screen.findByText('Javob tayyor')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Tozalash' }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(screen.queryByText('Javob tayyor')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Bugungi tushum' })).toBeInTheDocument()
    expect(sessionStorage.getItem(AI_STORAGE_KEY)).toBeNull()
    expect(toast.info).toHaveBeenCalled()
  })
})
