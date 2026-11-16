import api from '../../services/axios'
import { unwrap } from '../../lib/api'
import { MAX_HISTORY, normalizeToolCalls } from './lib/aiChat'

const AI_ENDPOINT = import.meta.env?.VITE_AI_CHAT_URL || '/ai/chat'

// Javob shu vaqtdan ko'p kutilsa — so'rov bekor qilinadi va foydalanuvchiga
// «Javob kechikdi, qayta urinib ko'ring» xabari ko'rsatiladi.
export const AI_TIMEOUT_MS = 60_000

export class AiUnavailableError extends Error {
  constructor(message = "AI xizmati hozircha mavjud emas") {
    super(message)
    this.name = 'AiUnavailableError'
    this.code = 'AI_UNAVAILABLE'
  }
}

// Foydalanuvchi «To'xtatish» tugmasini bosganda — xato ko'rsatilmaydi.
export class AiAbortedError extends Error {
  constructor(message = "So'rov to'xtatildi") {
    super(message)
    this.name = 'AiAbortedError'
    this.code = 'AI_ABORTED'
  }
}

// Foydalanuvchiga ko'rsatiladigan xato turlari. Har biri i18n'da
// `aiChat.errors.<code>` kalitiga ega (uz/ru/en).
export const AI_ERROR_CODES = [
  'rateLimit',
  'forbidden',
  'notConfigured',
  'timeout',
  'network',
  'generic',
]

export class AiChatError extends Error {
  constructor(code = 'generic', status = null, message = '') {
    super(message || code)
    this.name = 'AiChatError'
    this.code = AI_ERROR_CODES.includes(code) ? code : 'generic'
    this.status = status
    // Faqat backend yuborgan matn (bo'sh bo'lishi mumkin). `message`
    // esa bo'sh bo'lganda kodga tushadi, shuning uchun alohida saqlanadi.
    this.backendMessage = message
  }
}

/** HTTP holat kodidan foydalanuvchi xatosi turini aniqlaydi. */
export function resolveAiErrorCode(error) {
  if (error instanceof AiChatError) return error.code
  const status = error?.response?.status
  if (status === 429) return 'rateLimit'
  if (status === 403) return 'forbidden'
  if (status === 503) return 'notConfigured'
  if (!error?.response) return 'network'
  return 'generic'
}

function toHistory(messages = []) {
  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .filter((message) => typeof message.content === 'string' && message.content.trim())
    .map((message) => ({ role: message.role, text: message.content }))
}

function extractAnswer(payload) {
  if (!payload || typeof payload !== 'object') return ''
  return typeof payload.answer === 'string' ? payload.answer : ''
}

function extractToolCalls(payload, root) {
  return normalizeToolCalls(
    payload?.toolCalls ??
      payload?.tool_calls ??
      payload?.tools ??
      root?.toolCalls ??
      root?.tool_calls,
  )
}

/**
 * Backend 403 bilan birga yuboradigan tushuntirish matnini oladi.
 * Masalan: «AI yordamchi faqat restoranga biriktirilgan xodimlar uchun».
 * Matn bo'lmasa — bo'sh satr (UI umumiy matnni ko'rsatadi).
 */
export function extractBackendMessage(error) {
  const data = error?.response?.data
  if (!data || typeof data !== 'object') return ''
  const candidate = data.message ?? data.error ?? data.data?.message
  return typeof candidate === 'string' ? candidate.trim() : ''
}

export async function sendAiMessage(messages = [], { signal } = {}) {
  const list = Array.isArray(messages) ? messages : []
  let lastUserIndex = -1
  list.forEach((message, index) => {
    if (message?.role === 'user') lastUserIndex = index
  })

  const question =
    lastUserIndex >= 0 ? String(list[lastUserIndex]?.content ?? '').trim() : ''
  // Backend ham eng ko'pi bilan 20 ta xabarni qabul qiladi: savol + tarix
  // birgalikda MAX_HISTORY dan oshmasligi kerak.
  const history = toHistory(lastUserIndex > 0 ? list.slice(0, lastUserIndex) : []).slice(
    -(MAX_HISTORY - 1),
  )

  const controller = new AbortController()
  let timedOut = false
  const timeoutId = setTimeout(() => {
    timedOut = true
    controller.abort()
  }, AI_TIMEOUT_MS)

  const abortFromCaller = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', abortFromCaller, { once: true })
  }

  try {
    const response = await api.post(
      AI_ENDPOINT,
      { question, history },
      { signal: controller.signal },
    )
    const payload = unwrap(response)
    const answer = extractAnswer(payload).trim()
    if (!answer) {
      throw new AiUnavailableError("AI bo'sh javob qaytardi")
    }
    return {
      reply: answer,
      source: 'server',
      toolCalls: extractToolCalls(payload, response?.data),
    }
  } catch (error) {
    if (timedOut) {
      throw new AiChatError('timeout', null)
    }
    if (
      signal?.aborted ||
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      throw new AiAbortedError()
    }
    if (error instanceof AiUnavailableError || error instanceof AiChatError) throw error
    const status = error?.response?.status
    if (status === 404 || status === 405 || status === 501) {
      throw new AiUnavailableError()
    }
    // 403 da backend sababini aynan ko'rsatamiz — admin ham «admin emassan»
    // degan umumiy matnni emas, backend yozgan tushuntirishni ko'radi.
    const backendMessage = status === 403 ? extractBackendMessage(error) : ''
    throw new AiChatError(resolveAiErrorCode(error), status ?? null, backendMessage)
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', abortFromCaller)
  }
}
