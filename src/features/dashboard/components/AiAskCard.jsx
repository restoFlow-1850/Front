import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import { Card } from '../../../components/ui'

const QUESTIONS = [
  { id: 'revenue', key: 'dashboard.aiAsk.revenue', fallback: "Bugun tushum qancha?" },
  { id: 'lowStock', key: 'dashboard.aiAsk.lowStock', fallback: 'Omborda nima tugayapti?' },
  { id: 'openOrders', key: 'dashboard.aiAsk.openOrders', fallback: 'Hozir nechta buyurtma ochiq?' },
]

export default function AiAskCard() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const ask = (question) => {
    navigate(`/ai-chat?q=${encodeURIComponent(question)}`)
  }

  return (
    <Card className="mb-5 border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:border-orange-900/60 dark:from-orange-950/30 dark:via-[#1F2937] dark:to-amber-950/20">
      <div className="flex items-start gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-xl shadow-md shadow-orange-500/25">
          🤖
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            {t('dashboard.aiAsk.title', "AI'dan so'rang")}
          </h2>
          <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            {t(
              'dashboard.aiAsk.subtitle',
              "Tayyor savollardan birini tanlang — javob bir zumda tayyor bo'ladi",
            )}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        {QUESTIONS.map((item) => {
          const label = t(item.key, item.fallback)
          return (
            <button
              key={item.id}
              type="button"
              data-testid={`ai-ask-${item.id}`}
              onClick={() => ask(label)}
              className="group flex items-center justify-between gap-2 rounded-xl border border-orange-200/80 bg-white/80 px-3.5 py-3 text-left text-xs font-bold text-slate-700 transition hover:border-[#F97316] hover:bg-white hover:text-[#EA580C] dark:border-orange-900/50 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-orange-700 dark:hover:text-orange-300"
            >
              <span>{label}</span>
              <ArrowRight
                size={14}
                className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-[#F97316]"
              />
            </button>
          )
        })}
      </div>
    </Card>
  )
}
