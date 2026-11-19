import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Send, Square } from 'lucide-react'

const MAX_LENGTH = 2000

export default function ChatComposer({ value, onChange, onSend, onStop, isSending, disabled }) {
  const { t } = useTranslation()
  const textareaRef = useRef(null)

  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`
  }, [value])

  const submit = () => {
    if (!value.trim() || isSending || disabled) return
    onSend()
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <div className="border-t border-slate-200 bg-white/80 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 sm:p-4">
      <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition focus-within:border-[#F97316] focus-within:ring-2 focus-within:ring-orange-100 dark:border-slate-700 dark:bg-slate-800 dark:focus-within:ring-orange-950">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Savolingizni yozing..."
          disabled={disabled}
          className="max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-white"
        />
        {isSending ? (
          <button
            type="button"
            onClick={onStop}
            data-testid="ai-stop"
            className="mb-0.5 inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 text-xs font-bold text-rose-600 shadow-sm transition hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/70"
            aria-label={t('aiChat.stop', "To'xtatish")}
            title={t('aiChat.stop', "To'xtatish")}
          >
            <Square size={14} fill="currentColor" />
            <span>{t('aiChat.stop', "To'xtatish")}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            className="mb-0.5 grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25 transition hover:from-[#EA580C] hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={t('aiChat.send', 'Yuborish')}
          >
            <Send size={18} />
          </button>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 px-1 text-[10px] font-medium text-slate-400">
        <span className="hidden truncate sm:inline">
          Enter — yuborish · Shift+Enter — yangi qator
        </span>
        <span className="tabular-nums">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  )
}
