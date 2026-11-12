import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../../services/axios', () => ({
  default: { post: vi.fn() },
}))

import api from '../../../services/axios'
import { AiUnavailableError, sendAiMessage } from '../api'

beforeEach(() => {
  api.post.mockReset()
})

describe('sendAiMessage', () => {
  it('sends { question, history: [{ role, text }] }', async () => {
    api.post.mockResolvedValue({ data: { data: { answer: 'Javob' } } })

    await sendAiMessage([
      { role: 'user', content: 'Birinchi savol' },
      { role: 'assistant', content: 'Birinchi javob' },
      { role: 'user', content: 'Ikkinchi savol' },
    ])

    expect(api.post).toHaveBeenCalledWith('/ai/chat', {
      question: 'Ikkinchi savol',
      history: [
        { role: 'user', text: 'Birinchi savol' },
        { role: 'assistant', text: 'Birinchi javob' },
      ],
    })
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
})
