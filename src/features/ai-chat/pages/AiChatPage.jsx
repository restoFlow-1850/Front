import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bot, RotateCcw, Sparkles, Trash2, WifiOff } from 'lucide-react'
import { toast } from 'react-toastify'

import { Button, Card, PageHeader } from '../../../components/ui'
import { apiErrorMessage } from '../../../lib/api'
import { AiUnavailableError, sendAiMessage } from '../api'
import ChatComposer from '../components/ChatComposer'
import ChatMessage from '../components/ChatMessage'
import QuickPrompts from '../components/QuickPrompts'
import TypingIndicator from '../components/TypingIndicator'
import {
  clearStoredMessages,
  createMessage,
  loadMessages,
  localAssistantReply,
  saveMessages,
  toApiMessages,
} from '../lib/aiChat'

const STATUS = {
  unknown: {
    label: 'Tayyor',
    dot: 'bg-slate-400',
    pill: 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  server: {
    label: 'Onlayn',
    dot: 'bg-emerald-500',
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300',
  },
  local: {
    label: 'Demo rejim',
    dot: 'bg-amber-500',
    pill: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300',
  },
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export default function AiChatPage() {
  const { t } = useTranslation()
  const [messages, setMessages] = useState(() => loadMessages())
  const [input, setInput] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [mode, setMode] = useState('unknown')
  const bottomRef = useRef(null)

  useEffect(() => {
    saveMessages(messages)
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isSending])

  const handleSend = async (rawText = input) => {
    const text = String(rawText ?? '').trim()
    if (!text || isSending) return

    const userMessage = createMessage('user', text)
    const nextMessages = [...messages, userMessage]

    setMessages(nextMessages)
    setInput('')
    setIsSending(true)

    try {
      const result = await sendAiMessage(toApiMessages(nextMessages))
      setMode('server')
      setMessages((prev) => [
        ...prev,
        createMessage('assistant', result.reply, {
          source: result.source,
          toolCalls: result.toolCalls,
        }),
      ])
    } catch (error) {
      if (error instanceof AiUnavailableError) {
        setMode('local')
        await delay(450)
        setMessages((prev) => [
          ...prev,
          createMessage('assistant', localAssistantReply(text), { source: 'local' }),
        ])
      } else {
        toast.error(apiErrorMessage(error, 'AI javobini olishda xatolik yuz berdi'))
        setMessages((prev) => [
          ...prev,
          createMessage(
            'assistant',
            "Javob olishda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.",
            { source: 'error' },
          ),
        ])
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleClear = () => {
    if (messages.length > 0 && !window.confirm('Suhbat tarixini tozalashni tasdiqlaysizmi?')) {
      return
    }
    setMessages([])
    setInput('')
    clearStoredMessages()
    toast.info('Suhbat tarixi tozalandi')
  }

  const status = STATUS[mode] ?? STATUS.unknown

  return (
    <div className="space-y-4">
      <PageHeader
        title={t('aiChat.title', 'AI yordamchi')}
        subtitle={t(
          'aiChat.subtitle',
          "Restoran boshqaruvi bo'yicha aqlli maslahatchi — savdo, menyu, ombor va jamoa",
        )}
        actions={
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.pill}`}
            >
              <span className={`size-2 rounded-full ${status.dot}`} />
              {status.label}
            </span>
            <Button variant="secondary" onClick={handleClear} disabled={messages.length === 0}>
              <RotateCcw className="mr-2 h-4 w-4" /> {t('aiChat.newChat', 'Yangi suhbat')}
            </Button>
          </div>
        }
      />

      <Card
        padded={false}
        className="flex h-[calc(100dvh-14rem)] min-h-[520px] flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="relative grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25">
              <Bot size={22} />
              <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white bg-emerald-500 dark:border-[#1F2937]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-900 dark:text-white">
                RestoFlow AI
              </p>
              <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                {isSending ? 'Javob yozmoqda...' : "Savollaringizga tayyor — o'zbek tilida"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={messages.length === 0}
            className="grid size-10 shrink-0 place-items-center rounded-xl text-slate-400 transition hover:bg-rose-50 hover:text-rose-500 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-950/40"
            aria-label={t('aiChat.clear', 'Suhbatni tozalash')}
            title={t('aiChat.clear', 'Suhbatni tozalash')}
          >
            <Trash2 size={17} />
          </button>
        </div>

        {mode === 'local' && (
          <div className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200 sm:px-5">
            <WifiOff size={15} className="mt-0.5 shrink-0" />
            <span>
              AI serveri hozircha ulanmagan. Javoblar lokal bilim bazasidan (demo rejim) berilmoqda.
            </span>
          </div>
        )}

        <div
          className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#F8FAFC] p-4 dark:bg-[#0B0F17] sm:p-5"
          aria-live="polite"
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <span className="grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-500/25">
                <Sparkles size={30} />
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  Qanday yordam bera olaman?
                </h2>
                <p className="mx-auto max-w-md text-sm font-medium text-slate-500 dark:text-slate-400">
                  Savdo tahlili, menyu, ombor, xodimlar yoki mijozlar fikrlari haqida so'rang.
                  Quyidagi tayyor savollardan birini tanlashingiz ham mumkin.
                </p>
              </div>
              <div className="w-full max-w-2xl">
                <QuickPrompts onSelect={handleSend} />
              </div>
            </div>
          ) : (
            messages.map((message) => <ChatMessage key={message.id} message={message} />)
          )}

          {isSending && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        <ChatComposer
          value={input}
          onChange={setInput}
          onSend={() => handleSend()}
          isSending={isSending}
        />
      </Card>
    </div>
  )
}
