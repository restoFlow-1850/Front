import { useEffect, useRef } from 'react'
import { Loader2, Send } from 'lucide-react'

const MAX_LENGTH = 2000

export default function ChatComposer({ value, onChange, onSend, isSending, disabled }) {
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
        <button
          type="button"
          onClick={submit}
          disabled={!value.trim() || isSending || disabled}
          className="mb-0.5 grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25 transition hover:from-[#EA580C] hover:to-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Yuborish"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-medium text-slate-400">
        <span>Enter — yuborish · Shift+Enter — yangi qator</span>
        <span className="tabular-nums">
          {value.length}/{MAX_LENGTH}
        </span>
      </div>
    </div>
  )
}
