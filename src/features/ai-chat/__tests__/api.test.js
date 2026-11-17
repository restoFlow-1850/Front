import { createElement } from 'react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('../../../services/axios', () => ({
  default: { post: vi.fn() },
}))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (_key, options) => options?.defaultValue ?? '' }),
}))

import api from '../../../services/axios'
import ChatMessage from '../components/ChatMessage'
import {
  AI_TIMEOUT_MS,
  AiAbortedError,
  AiChatError,
  AiUnavailableError,
  extractBackendMessage,
  resolveAiErrorCode,
  sendAiMessage,
} from '../api'

const BACKEND_ERRORS = [
  {
    status: 403,
    code: 'forbidden',
    message: 'AI yordamchi faqat restoranga biriktirilgan xodimlar uchun',
  },
  {
    status: 503,
    code: 'notConfigured',
    message: "AI yordamchi sozlanmagan (ANTHROPIC_API_KEY yo'q)",
  },
  {
    status: 429,
    code: 'rateLimit',
    message: 'AI limiti tugadi (soatiga 30 ta savol). Birozdan keyin urinib ko\'ring.',
  },
  {
    status: 429,
    code: 'rateLimit',
    message: "AI band, birozdan keyin urinib ko'ring",
  },
]

beforeEach(() => {
  api.post.mockReset()
})

afterEach(cleanup)

describe('sendAiMessage', () => {
  it('sends { question, history: [{ role, text }] }', async () => {
    api.post.mockResolvedValue({ data: { data: { answer: 'Javob' } } })

    await sendAiMessage([
      { role: 'user', content: 'Birinchi savol' },
      { role: 'assistant', content: 'Birinchi javob' },
      { role: 'user', content: 'Ikkinchi savol' },
    ])

    expect(api.post).toHaveBeenCalledWith(
      '/ai/chat',
      {
        question: 'Ikkinchi savol',
        history: [
          { role: 'user', text: 'Birinchi savol' },
          { role: 'assistant', text: 'Birinchi javob' },
        ],
      },
      expect.objectContaining({ signal: expect.anything() }),
    )
  })

  it('sends at most the last 20 messages (question + 19 history)', async () => {
    api.post.mockResolvedValue({ data: { data: { answer: 'Javob' } } })
    const messages = Array.from({ length: 30 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `xabar-${index}`,
    }))

    await sendAiMessage(messages)

    const [, body] = api.post.mock.calls[0]
    expect(body.question).toBe('xabar-28')
    expect(body.history).toHaveLength(19)
    expect(body.history.length + 1).toBe(20)
    expect(body.history[0].text).toBe('xabar-9')
    expect(body.history.at(-1).text).toBe('xabar-27')
  })

  it('aborts the request after AI_TIMEOUT_MS and reports a timeout', async () => {
    let requestSignal
    api.post.mockImplementation(
      (_url, _body, config) =>
        new Promise((_resolve, reject) => {
          requestSignal = config.signal
          config.signal.addEventListener('abort', () =>
            reject(Object.assign(new Error('canceled'), { name: 'CanceledError', code: 'ERR_CANCELED' })),
          )
        }),
    )

    vi.useFakeTimers()
    try {
      const promise = sendAiMessage([{ role: 'user', content: 'Salom' }])
      const assertion = expect(promise).rejects.toMatchObject({
        name: 'AiChatError',
        code: 'timeout',
      })
      await vi.advanceTimersByTimeAsync(AI_TIMEOUT_MS)
      await assertion
      expect(requestSignal.aborted).toBe(true)
    } finally {
      vi.useRealTimers()
    }
  })

  it("rejects with AiAbortedError when the caller presses «To'xtatish»", async () => {
    api.post.mockImplementation(
      (_url, _body, config) =>
        new Promise((_resolve, reject) => {
          config.signal.addEventListener('abort', () =>
            reject(Object.assign(new Error('canceled'), { name: 'CanceledError', code: 'ERR_CANCELED' })),
          )
        }),
    )

    const controller = new AbortController()
    const promise = sendAiMessage([{ role: 'user', content: 'Salom' }], {
      signal: controller.signal,
    })
    controller.abort()

    await expect(promise).rejects.toBeInstanceOf(AiAbortedError)
  })

  it('reads the reply from data.answer', async () => {
    api.post.mockResolvedValue({ data: { data: { answer: '  Salom  ' } } })

    await expect(sendAiMessage([{ role: 'user', content: 'Salom' }])).resolves.toEqual({
      reply: 'Salom',
      source: 'server',
      toolCalls: [],
    })
  })

  it('extracts and normalizes data.toolCalls', async () => {
    api.post.mockResolvedValue({
      data: {
        data: {
          answer: 'Javob',
          toolCalls: [{ name: 'daily_sales' }, { tool: 'inventory' }, 'orders', { name: 'daily-sales' }],
        },
      },
    })

    const result = await sendAiMessage([{ role: 'user', content: 'Savol' }])

    expect(result.toolCalls).toEqual([
      { name: 'daily_sales', key: 'dailySales' },
      { name: 'inventory', key: 'inventory' },
      { name: 'orders', key: 'orders' },
    ])
  })

  it('accepts toolCalls at the response root and snake_case name', async () => {
    api.post.mockResolvedValue({
      data: { answer: 'Javob', tool_calls: [{ function: { name: 'sales_report' } }] },
    })

    const result = await sendAiMessage([{ role: 'user', content: 'Savol' }])

    expect(result.toolCalls).toEqual([{ name: 'sales_report', key: 'dailySales' }])
  })

  it('returns an empty toolCalls array when the response has none', async () => {
    api.post.mockResolvedValue({ data: { answer: 'Javob' } })

    const result = await sendAiMessage([{ role: 'user', content: 'Savol' }])

    expect(result.toolCalls).toEqual([])
  })

  it('also accepts answer at the response root', async () => {
    api.post.mockResolvedValue({ data: { answer: 'Root javob' } })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).resolves.toMatchObject({
      reply: 'Root javob',
    })
  })

  it('throws AiUnavailableError when answer is empty', async () => {
    api.post.mockResolvedValue({ data: { data: {} } })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toBeInstanceOf(
      AiUnavailableError,
    )
  })

  it('throws AiUnavailableError when the endpoint is missing (404)', async () => {
    api.post.mockRejectedValue({ response: { status: 404 } })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toBeInstanceOf(
      AiUnavailableError,
    )
  })

  it.each([
    [429, 'rateLimit'],
    [403, 'forbidden'],
    [503, 'notConfigured'],
    [500, 'generic'],
  ])('maps HTTP %i to the "%s" error code', async (status, code) => {
    api.post.mockRejectedValue({ response: { status } })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toMatchObject({
      name: 'AiChatError',
      code,
      status,
    })
  })

  it('keeps the backend message on 403 and exposes it as backendMessage', async () => {
    const message = 'AI yordamchi faqat restoranga biriktirilgan xodimlar uchun'
    api.post.mockRejectedValue({
      response: { status: 403, data: { success: false, message } },
    })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toMatchObject({
      name: 'AiChatError',
      code: 'forbidden',
      status: 403,
      message,
      backendMessage: message,
    })
  })

  it('leaves backendMessage empty on 403 without a backend message', async () => {
    api.post.mockRejectedValue({ response: { status: 403, data: { success: false } } })

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toMatchObject({
      name: 'AiChatError',
      code: 'forbidden',
      status: 403,
      backendMessage: '',
    })
  })

  it('maps a network failure (no response) to the "network" error code', async () => {
    api.post.mockRejectedValue(new Error('Network Error'))

    await expect(sendAiMessage([{ role: 'user', content: 'Savol' }])).rejects.toMatchObject({
      name: 'AiChatError',
      code: 'network',
    })
  })
})

describe('backend xato matnlari', () => {
  it.each(BACKEND_ERRORS)(
    'HTTP %i: $message matni AiChatError.code=$code va UI da ko‘rinadi',
    async ({ status, code, message }) => {
      api.post.mockRejectedValue({
        response: { status, data: { success: false, message, data: null } },
      })

      let error
      try {
        await sendAiMessage([{ role: 'user', content: 'Savol' }])
      } catch (caught) {
        error = caught
      }

      expect(error).toBeInstanceOf(AiChatError)
      expect(error).toMatchObject({
        code,
        status,
        message,
        backendMessage: message,
      })

      render(
        createElement(ChatMessage, {
          message: {
            id: 'error-1',
            role: 'assistant',
            content: message,
            source: 'error',
            errorCode: error.code,
            backendMessage: error.backendMessage,
            retryText: 'Savol',
          },
          onRetry: vi.fn(),
        }),
      )

      expect(screen.getByText(message)).toBeInTheDocument()
    },
  )
})

describe('extractBackendMessage', () => {
  it('reads message from response.data.message', () => {
    expect(extractBackendMessage({ response: { data: { message: '  Sabab  ' } } })).toBe('Sabab')
  })

  it('supports nested data.message and trims it', () => {
    expect(extractBackendMessage({ response: { data: { data: { message: 'Ichki sabab' } } } })).toBe(
      'Ichki sabab',
    )
  })

  it('returns an empty string when there is no message', () => {
    expect(extractBackendMessage({ response: { data: {} } })).toBe('')
    expect(extractBackendMessage({ response: {} })).toBe('')
    expect(extractBackendMessage(null)).toBe('')
  })
})

describe('resolveAiErrorCode', () => {
  it('prefers the code of an AiChatError instance', () => {
    expect(resolveAiErrorCode(new AiChatError('forbidden', 403))).toBe('forbidden')
  })

  it("falls back to 'generic' for non-AI errors with a response", () => {
    expect(resolveAiErrorCode({ response: { status: 500 } })).toBe('generic')
  })
})
