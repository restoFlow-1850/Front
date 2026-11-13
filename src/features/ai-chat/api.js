import api from '../../services/axios'
import { unwrap } from '../../lib/api'
import { normalizeToolCalls } from './lib/aiChat'

const AI_ENDPOINT = import.meta.env?.VITE_AI_CHAT_URL || '/ai/chat'

export class AiUnavailableError extends Error {
  constructor(message = "AI xizmati hozircha mavjud emas") {
    super(message)
    this.name = 'AiUnavailableError'
    this.code = 'AI_UNAVAILABLE'
  }
}

// Foydalanuvchiga ko'rsatiladigan xato turlari. Har biri i18n'da
// `aiChat.errors.<code>` kalitiga ega (uz/ru/en).
export const AI_ERROR_CODES = ['rateLimit', 'forbidden', 'notConfigured', 'network', 'generic']

export class AiChatError extends Error {
  constructor(code = 'generic', status = null, message = '') {
    super(message || code)
    this.name = 'AiChatError'
    this.code = AI_ERROR_CODES.includes(code) ? code : 'generic'
    this.status = status
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

export async function sendAiMessage(messages = []) {
  const list = Array.isArray(messages) ? messages : []
  let lastUserIndex = -1
  list.forEach((message, index) => {
    if (message?.role === 'user') lastUserIndex = index
  })

  const question =
    lastUserIndex >= 0 ? String(list[lastUserIndex]?.content ?? '').trim() : ''
  const history = toHistory(lastUserIndex > 0 ? list.slice(0, lastUserIndex) : [])

  try {
    const response = await api.post(AI_ENDPOINT, { question, history })
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
    if (error instanceof AiUnavailableError || error instanceof AiChatError) throw error
    const status = error?.response?.status
    if (status === 404 || status === 405 || status === 501) {
      throw new AiUnavailableError()
    }
    throw new AiChatError(resolveAiErrorCode(error), status ?? null)
  }
}
