import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Bot, Check, Copy, User } from 'lucide-react'

import { formatMessageTime, humanizeToolName, normalizeToolCalls, TOOL_EMOJI } from '../lib/aiChat'

export default function ChatMessage({ message }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isError = message.source === 'error'
  const isLocal = message.source === 'local'
  const toolCalls = normalizeToolCalls(message.toolCalls)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25">
          <Bot size={18} />
        </span>
      )}

      <div className={`flex max-w-[86%] flex-col gap-1 sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`group relative whitespace-pre-wrap break-words rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
            isUser
              ? 'rounded-br-md bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white'
              : isError
                ? 'rounded-bl-md border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200'
                : 'rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          }`}
        >
          {isError && (
            <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
              <AlertTriangle size={12} /> Xatolik
            </span>
          )}
          {message.content}

          {!isUser && toolCalls.length > 0 && (
            <div
              data-testid="ai-tool-calls"
              className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-slate-100 pt-2 dark:border-slate-700"
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                {t('aiChat.toolsUsed', 'Ishlatilgan vositalar')}
              </span>
              {toolCalls.map((tool) => {
                const fallback = humanizeToolName(tool.name)
                const label =
                  tool.key === 'custom'
                    ? fallback
                    : t(`aiChat.tools.${tool.key}`, { defaultValue: fallback })
                return (
                  <span
                    key={`${tool.key}:${tool.name}`}
                    data-testid="ai-tool-badge"
                    className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-700/60 dark:text-slate-200"
                  >
                    <span aria-hidden="true">{TOOL_EMOJI[tool.key] ?? TOOL_EMOJI.custom}</span>
                    {label}
                  </span>
                )
              })}
            </div>
          )}

          <button
            type="button"
            onClick={handleCopy}
            className={`absolute -top-2 ${isUser ? '-left-2' : '-right-2'} grid size-7 place-items-center rounded-full border bg-white text-slate-400 opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300`}
            aria-label="Matnni nusxalash"
            title="Matnni nusxalash"
          >
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
          </button>
        </div>

        <div className={`flex items-center gap-1.5 px-1 text-[10px] font-medium text-slate-400 ${isUser ? 'flex-row-reverse' : ''}`}>
          <span>{isUser ? 'Siz' : 'RestoFlow AI'}</span>
          <span>·</span>
          <span>{formatMessageTime(message.createdAt)}</span>
          {isLocal && (
            <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
              Demo
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
          <User size={17} />
        </span>
      )}
    </div>
  )
}
