// Buyurtma "cheki" — perforatsiyalangan yuqori qirra bilan real chekka o'xshatilgan.
// Vaqt o'tishi bilan urgency rangi indigo → amber → rose ga o'zgaradi.
// Mas'ul: Ziyodulla.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, CheckCircle2, Clock, StickyNote, Trash2, User } from 'lucide-react'
import { ORDER_STATUS } from '../../../constants/roles'
import { Button } from '../../../components/ui'

function useElapsedMinutes(createdAt) {
  const [minutes, setMinutes] = useState(() =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setMinutes(Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000))
    }, 15000)
    return () => clearInterval(id)
  }, [createdAt])

  return minutes
}

function urgencyClasses(minutes, status) {
  if (status === ORDER_STATUS.READY) {
    return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
  }
  if (minutes < 5) return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400'
  if (minutes < 12) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'
  return 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
}

export default function OrderTicket({ order, onStartPreparing, onMarkReady, onDelete, isDeleting }) {
  const { t } = useTranslation()
  const minutes = useElapsedMinutes(order.createdAt)
  const table = order.table?.number ?? order.table ?? '—'
  const id = order._id ?? order.id

  const handleDelete = () => {
    // Yo'q qilish qaytarib bo'lmaydi — tasodifiy bosishdan himoya uchun tasdiqlash.
    if (window.confirm(t('kitchen.confirmDelete'))) onDelete(id)
  }

  return (
    <li className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-black/[0.02] transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
      {/* Perforatsiyalangan yuqori qirra — signature detali */}
      <div
        aria-hidden="true"
        className="h-2.5 w-full opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1.4px, transparent 1.5px)',
          backgroundSize: '9px 9px',
          backgroundPosition: '4.5px 0',
          backgroundRepeat: 'repeat-x',
          color: '#0f172a',
        }}
      />

      {/* O'chirish tugmasi — eski/keraksiz buyurtmalarni tezda tozalash uchun. */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        title={t('kitchen.deleteOrder')}
        className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-300 opacity-0 transition-opacity hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 disabled:opacity-50 dark:text-slate-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="px-4 pb-4 pt-2.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-mono text-[11px] font-medium uppercase tracking-wide text-slate-400">
              {t('kitchen.ticketNumber', {
                number: order.number ?? String(id).slice(-4).toUpperCase(),
              })}
            </p>
            <p className="mt-0.5 text-lg font-bold leading-tight text-slate-900 dark:text-white">
              {t('kitchen.table', { num: table })}
            </p>
          </div>
          <span
            className={`flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${urgencyClasses(minutes, order.status)}`}
          >
            <Clock className="h-3 w-3" />
            {minutes < 1 ? t('kitchen.justNow') : t('kitchen.elapsed', { minutes })}
          </span>
        </div>

        <ul className="mt-3 space-y-3 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
          {order.items?.map((item, index) => (
            <li key={`${item.product ?? item.name}-${index}`} className="flex flex-col gap-0.5">
              <span className="truncate text-lg font-bold text-slate-800 dark:text-white">
                {item.name ?? item.product}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-400">
                ×{item.quantity}
              </span>
            </li>
          ))}
        </ul>

        {order.notes && (
          <p className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300">
            <StickyNote className="mt-0.5 h-4 w-4 shrink-0" />
            {order.notes}
          </p>
        )}

        {(order.waiter?.name ?? order.waiter) && (
          <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400">
            <User className="h-3.5 w-3.5" />
            {order.waiter?.name ?? order.waiter}
          </div>
        )}

        {order.status === ORDER_STATUS.NEW && (
          <Button className="mt-3.5 w-full" onClick={() => onStartPreparing(id)}>
            {t('kitchen.actions.startPreparing')}
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        )}

        {order.status === ORDER_STATUS.IN_KITCHEN && (
          <button
            type="button"
            onClick={() => onMarkReady(id)}
            className="mt-3.5 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            {t('kitchen.actions.markComplete')}
          </button>
        )}

        {order.status === ORDER_STATUS.READY && (
          <div className="mt-3.5 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2.5 text-sm font-semibold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            {t('kitchen.columns.complete')}
          </div>
        )}
      </div>
    </li>
  )
}
