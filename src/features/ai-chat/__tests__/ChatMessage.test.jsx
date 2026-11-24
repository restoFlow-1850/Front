import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

const { language } = vi.hoisted(() => ({ language: { current: 'uz' } }))

vi.mock('react-i18next', async () => {
  const uz = (await import('../../../locales/uz/common.json')).default
  const ru = (await import('../../../locales/ru/common.json')).default
  const en = (await import('../../../locales/en/common.json')).default
  const resources = { uz, ru, en }

  const t = (key, options) => {
    const value = key
      .split('.')
      .reduce((acc, part) => (acc == null ? acc : acc[part]), resources[language.current])
    return typeof value === 'string' ? value : options?.defaultValue ?? key
  }

  return { useTranslation: () => ({ t }) }
})

import ChatMessage from '../components/ChatMessage'

const ANSWER = "Bugungi savdo 1 250 000 so'm"

function assistantMessage() {
  return {
    id: 'a1',
    role: 'assistant',
    content: ANSWER,
    source: 'server',
    toolCalls: [],
    createdAt: new Date('2026-11-20T12:00:00Z').toISOString(),
  }
}

describe('ChatMessage «Nusxalash» tugmasi', () => {
  let writeText

  beforeEach(() => {
    language.current = 'uz'
    writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    })
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('javob ostidagi tugma matnni clipboard ga yozadi', async () => {
    render(<ChatMessage message={assistantMessage()} />)
    const button = screen.getByTestId('ai-copy')
    expect(button).toHaveTextContent('Nusxalash')

    await act(async () => {
      fireEvent.click(button)
    })

    expect(writeText).toHaveBeenCalledWith(ANSWER)
    expect(screen.getByTestId('ai-copy-check')).toHaveTextContent('✓')
    expect(button).toHaveTextContent('Nusxalandi')
  })

  it('bosilganda ✓ chiqadi, 1,5 s dan keyin «Nusxalash» ga qaytadi', async () => {
    vi.useFakeTimers()
    render(<ChatMessage message={assistantMessage()} />)
    const button = screen.getByTestId('ai-copy')

    await act(async () => {
      fireEvent.click(button)
    })
    expect(screen.getByTestId('ai-copy-check')).toHaveTextContent('✓')
    expect(button).toHaveTextContent('Nusxalandi')

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1500)
    })
    expect(screen.queryByTestId('ai-copy-check')).not.toBeInTheDocument()
    expect(button).toHaveTextContent('Nusxalash')
  })

  it.each([
    ['uz', 'Nusxalash', 'Nusxalandi'],
    ['ru', 'Копировать', 'Скопировано'],
    ['en', 'Copy', 'Copied'],
  ])('%s tilida tugma va ✓ holati matnlari to‘g‘ri', async (lng, idle, done) => {
    language.current = lng
    render(<ChatMessage message={assistantMessage()} />)
    const button = screen.getByTestId('ai-copy')
    expect(button).toHaveTextContent(idle)

    await act(async () => {
      fireEvent.click(button)
    })

    expect(screen.getByTestId('ai-copy-check')).toHaveTextContent('✓')
    expect(button).toHaveTextContent(done)
  })

  it('clipboard mavjud bo‘lmasa ✓ chiqmaydi', async () => {
    writeText.mockRejectedValueOnce(new Error('denied'))
    render(<ChatMessage message={assistantMessage()} />)

    await act(async () => {
      fireEvent.click(screen.getByTestId('ai-copy'))
    })

    expect(writeText).toHaveBeenCalledWith(ANSWER)
    expect(screen.queryByTestId('ai-copy-check')).not.toBeInTheDocument()
    expect(screen.getByTestId('ai-copy')).toHaveTextContent('Nusxalash')
  })
})
