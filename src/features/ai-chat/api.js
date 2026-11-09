import api from '../../services/axios'
import { unwrap } from '../../lib/api'

const AI_ENDPOINT = import.meta.env?.VITE_AI_CHAT_URL || '/ai/chat'

export class AiUnavailableError extends Error {
  constructor(message = "AI xizmati hozircha mavjud emas") {
    super(message)
    this.name = 'AiUnavailableError'
    this.code = 'AI_UNAVAILABLE'
  }
}

function extractReply(payload) {
  if (!payload) return ''
  if (typeof payload === 'string') return payload
  return (
    payload.reply ??
    payload.answer ??
    payload.message ??
    payload.content ??
    payload.text ??
    ''
  )
}

export async function sendAiMessage(messages = []) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === 'user')

  try {
    const response = await api.post(AI_ENDPOINT, {
      message: lastUserMessage?.content ?? '',
      messages,
    })
    const reply = extractReply(unwrap(response))
    if (!reply || typeof reply !== 'string') {
      throw new AiUnavailableError("AI bo'sh javob qaytardi")
    }
    return { reply: reply.trim(), source: 'server' }
  } catch (error) {
    if (error instanceof AiUnavailableError) throw error
    const status = error?.response?.status
    if (!status || status === 404 || status === 405 || status === 501) {
      throw new AiUnavailableError()
    }
    throw error
  }
}
