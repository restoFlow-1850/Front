import { Bot } from 'lucide-react'

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-2.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25">
        <Bot size={18} />
      </span>
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="size-2 animate-bounce rounded-full bg-[#F97316]"
            style={{ animationDelay: `${index * 140}ms`, animationDuration: '900ms' }}
          />
        ))}
      </div>
    </div>
  )
}
