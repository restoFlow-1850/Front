// Buyurtma "cheki" — Premium Orange brend dizayn sistemasi (Yorqin Oq va To'q Rejim).
// Zulfiqor backend API (PATCH /orders/:id/items/:itemId) va Socket.io real-time bilan to'liq ulangan.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clock, MessageSquare, StickyNote, User } from 'lucide-react'
import { ORDER_STATUS } from '../../../constants/roles'

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
  if (status === ORDER_STATUS.READY)
    return 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
  if (minutes < 5)
    return 'bg-orange-500/10 text-[#F97316] border border-orange-500/20 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800'
  if (minutes < 12)
    return 'bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800'
  return 'bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 animate-pulse'
}

export default function OrderTicket({
  order,
  onStartPreparing,
  onMarkReady,
  onToggleItemReady,
}) {
  const { t } = useTranslation()
  const minutes = useElapsedMinutes(order.createdAt)
  const orderId = order._id ?? order.id
  const table = order.table?.number ?? order.table ?? '—'
  const waiterName = order.waiter?.name ?? (typeof order.waiter === 'string' ? order.waiter : '')

  const isDelayed = minutes >= 15 && order.status === ORDER_STATUS.NEW

  const handleItemClick = (item, index) => {
    const targetKey = item._id || item.id || index
    const nextState = !item.isReady
    onToggleItemReady?.(orderId, targetKey, nextState)
  }

  return (
    <li
      className={`relative overflow-hidden rounded-2xl bg-white shadow-[0_10px_25px_rgba(0,0,0,0.04)] transition-all duration-200 dark:bg-[#0F172A] ${
        isDelayed
          ? 'border-2 border-rose-500 ring-4 ring-rose-500/20 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border border-slate-200/90 hover:border-orange-500/40 dark:border-slate-800 dark:hover:border-orange-500/40'
      }`}
    >
      {/* Perforatsiyalangan brend to'q sariq yuqori qirra */}
      <div
        aria-hidden="true"
        className="h-2.5 rounded-t-2xl opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1.4px, transparent 1.5px)',
          backgroundSize: '9px 9px',
          backgroundPosition: '4.5px 0',
          backgroundRepeat: 'repeat-x',
          color: '#F97316',
        }}
      />

      <div className="px-4 pb-4 pt-1">
        {/* Kechikayotgan buyurtma yorlig'i (Urgency Alert) */}
        {isDelayed && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-xs dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-400 animate-pulse">
            <span className="flex items-center gap-1.5">
              <AlertTriangle size={15} className="shrink-0 text-rose-500" />
              <span>Kechikmoqda!</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-wider opacity-90">
              15+ daqiqa
            </span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="inline-block rounded-lg border border-orange-500/20 bg-orange-500/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-[#F97316] dark:bg-orange-500/20 dark:text-orange-300 shadow-2xs">
              {t('kitchen.ticketNumber', {
                number: order.number ?? String(orderId).slice(-4).toUpperCase(),
              })}
            </span>
            <h4 className="mt-1 font-display text-2xl font-black bg-gradient-to-r from-slate-900 via-[#F97316] to-[#EA580C] bg-clip-text text-transparent dark:from-white dark:via-orange-300 dark:to-amber-400">
              {t('kitchen.table', { num: table })}
            </h4>
          </div>
          <span
            className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold shadow-2xs ${urgencyClasses(minutes, order.status)}`}
          >
            <Clock className="h-3.5 w-3.5" />
            {minutes < 1
              ? t('kitchen.justNow')
              : t('kitchen.elapsed', { minutes })}
          </span>
        </div>

        {/* Taomlar ro'yxati (Item Check-off with backend/socket sync) */}
        <ul className="mt-3.5 space-y-2 border-t border-dashed border-slate-200 pt-3 text-sm dark:border-slate-800">
          {order.items?.map((item, index) => {
            const isChecked = Boolean(item.isReady)
            const itemName = item.name ?? item.product
            const itemNote = item.note || item.comment || item.notes
            return (
              <li
                key={`${itemName}-${index}`}
                onClick={() => handleItemClick(item, index)}
                className="group flex flex-col gap-1 cursor-pointer select-none rounded-xl p-2.5 transition-all duration-150 border border-transparent hover:border-orange-500/30 hover:bg-orange-500/5 dark:hover:bg-orange-500/10"
                title="Bajarilganini belgilash uchun bosing"
              >
                <div className="flex items-baseline justify-between gap-2 font-medium">
                  <span
                    className={`flex items-center gap-2 transition-all ${
                      isChecked
                        ? 'line-through opacity-50 text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-slate-100 font-bold'
                    }`}
                  >
                    {isChecked && (
                      <Check size={16} className="text-emerald-500 shrink-0 stroke-[3]" />
                    )}
                    <span className="text-sm">{itemName}</span>
                  </span>
                  <span
                    className={`font-mono text-xs font-extrabold shrink-0 transition-opacity rounded-full px-2 py-0.5 ${
                      isChecked
                        ? 'opacity-40 text-slate-400 bg-slate-100 dark:bg-slate-800'
                        : 'bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-2xs'
                    }`}
                  >
                    ×{item.quantity}
                  </span>
                </div>
                {itemNote && (
                  <p
                    className={`mt-0.5 flex items-start gap-1.5 rounded-lg border border-amber-300/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 transition-opacity ${
                      isChecked ? 'opacity-40 line-through' : ''
                    }`}
                  >
                    <MessageSquare size={13} className="mt-0.5 shrink-0 text-amber-500 opacity-90" />
                    <span>{itemNote}</span>
                  </p>
                )}
              </li>
            )
          })}
        </ul>

        {order.notes && (
          <p className="mt-2.5 flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <StickyNote size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <span>{order.notes}</span>
          </p>
        )}

        {waiterName && (
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <User size={13} className="text-[#F97316]" />
            <span>
              Ofitsiant: <strong className="text-slate-900 dark:text-slate-200 font-bold">{waiterName}</strong>
            </span>
          </div>
        )}

        {order.status === ORDER_STATUS.NEW && (
          <button
            type="button"
            onClick={() => onStartPreparing(orderId)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] via-[#EA580C] to-[#C2410C] py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
          >
            <span>{t('kitchen.actions.startPreparing')}</span>
            <ArrowRight size={16} />
          </button>
        )}

        {order.status === ORDER_STATUS.IN_KITCHEN && (
          <button
            type="button"
            onClick={() => onMarkReady(orderId)}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold text-white shadow-lg shadow-green-500/30 transition-all duration-200 hover:scale-[1.01] active:scale-[0.98]"
          >
            <CheckCircle2 size={16} />
            <span>{t('kitchen.actions.markComplete')}</span>
          </button>
        )}

        {order.status === ORDER_STATUS.READY && (
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 py-3 text-sm font-bold text-emerald-600 dark:text-emerald-300">
            <CheckCircle2 size={16} />
            <span>{t('kitchen.columns.complete')}</span>
          </div>
        )}
      </div>
    </li>
  )
}
