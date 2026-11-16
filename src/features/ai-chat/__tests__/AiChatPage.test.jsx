import { describe, it, expect, vi, beforeEach } from 'vitest'
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

async function askQuestion() {
  const input = screen.getByPlaceholderText('Savolingizni yozing...')
  fireEvent.change(input, { target: { value: 'Bugungi savdo qanday?' } })
  fireEvent.click(screen.getByRole('button', { name: 'Yuborish' }))
}

beforeEach(() => {
  sessionStorage.clear()
  sendAiMessage.mockReset()
  toast.error.mockClear()
})

describe('AiChatPage xatolari', () => {
  it('403 da backend xabarini chat ichida ko‘rsatadi', async () => {
    sendAiMessage.mockRejectedValue(new AiChatError('forbidden', 403, BACKEND_MESSAGE))

    render(<AiChatPage />)
    await askQuestion()

    expect(await screen.findByText(BACKEND_MESSAGE)).toBeInTheDocument()
    expect(screen.queryByText('Faqat admin/menejer uchun')).not.toBeInTheDocument()
    expect(toast.error).not.toHaveBeenCalled()
  })

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
