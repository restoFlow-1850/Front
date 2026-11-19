import { ArrowUpRight } from 'lucide-react'

import { QUICK_PROMPTS } from '../lib/aiChat'

export default function QuickPrompts({ onSelect }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {QUICK_PROMPTS.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item.prompt)}
          className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/70 px-3.5 py-3 text-left text-xs font-semibold text-slate-700 transition hover:border-[#F97316]/50 hover:bg-orange-50 hover:text-[#EA580C] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          <span>{item.label}</span>
          <ArrowUpRight size={14} className="shrink-0 text-slate-400 transition group-hover:text-[#F97316]" />
        </button>
      ))}
    </div>
  )
}
