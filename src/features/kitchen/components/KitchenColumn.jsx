// Bitta ustun (Kutilmoqda / Tayyorlanmoqda / Tayyor).
// Premium Orange brend dizayn sistemasi (Yorqin Oq va To'q Rejim).
import { useTranslation } from 'react-i18next'
import { ChefHat, Clock, Flame, CheckCheck } from 'lucide-react'
import OrderTicket from './OrderTicket'
import { EmptyState, Skeleton } from '../../../components/ui'

const COLUMN_CONFIG = {
  waiting: {
    icon: Flame,
    colorDot: 'bg-[#F97316] shadow-[0_0_10px_rgba(249,115,22,0.6)] animate-pulse',
    badgeTone: 'border-orange-500/30 bg-orange-500/10 text-[#F97316] dark:bg-orange-500/20 dark:text-orange-300',
  },
  making: {
    icon: Clock,
    colorDot: 'bg-[#FBBF24] shadow-[0_0_10px_rgba(251,191,36,0.6)] animate-pulse',
    badgeTone: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-300',
  },
  complete: {
    icon: CheckCheck,
    colorDot: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]',
    badgeTone: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
}

export default function KitchenColumn({
  id,
  orders,
  isLoading,
  onStartPreparing,
  onMarkReady,
  onToggleItemReady,
}) {
  const { t } = useTranslation()
  const config = COLUMN_CONFIG[id] ?? COLUMN_CONFIG.waiting
  const ColumnIcon = config.icon

  const totalOrders = orders.length
  const totalDishes = orders.reduce(
    (sum, order) =>
      sum +
      (order.items?.reduce(
        (itemSum, item) => itemSum + (Number(item.quantity) || 1),
        0,
      ) || 0),
    0,
  )

  return (
    <div className="flex w-full flex-col rounded-3xl bg-[#F8FAFC] p-3.5 sm:p-4 border border-slate-200/90 shadow-2xs dark:bg-[#1E293B]/90 dark:border-slate-800/90 transition-all">
      <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-xl bg-white border border-slate-200 dark:bg-slate-900/40 dark:border-slate-700">
            <span className={`size-2.5 rounded-full ${config.colorDot}`} />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <ColumnIcon size={16} className="text-[#F97316]" />
            <span>{t(`kitchen.columns.${id}`)}</span>
          </h3>
        </div>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-2xs ${config.badgeTone}`}>
          {totalOrders} ta ({totalDishes} taom)
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-36 rounded-2xl" />
          <Skeleton className="h-36 rounded-2xl" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300/70 py-12 text-center bg-white dark:bg-slate-900/40 dark:border-slate-800">
          <EmptyState icon={ChefHat} title={t(`kitchen.empty.${id}`)} />
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderTicket
              key={order._id ?? order.id}
              order={order}
              onStartPreparing={onStartPreparing}
              onMarkReady={onMarkReady}
              onToggleItemReady={onToggleItemReady}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
