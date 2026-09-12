// Bitta taom qatori — savatdagi mahsulot va miqdorini tahrirlash.
// Mas'ul: Ziyodulla (backend ulash), Abdugani (ekran mantiqi).
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function OrderItemRow({ item, onChange, onRemove }) {
  const { t } = useTranslation()

  return (
    <div className="flex items-center gap-2 rounded-xl border border-black/10 bg-white p-2.5 dark:border-ink-border dark:bg-ink-2">
      <input
        type="text"
        value={item.product}
        onChange={(e) => onChange({ ...item, product: e.target.value })}
        placeholder={t('orders.productPlaceholder')}
        className="min-w-0 flex-1 bg-transparent text-sm text-charcoal outline-none placeholder:text-slate dark:text-fog"
      />

      <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-black/5 px-1.5 py-1 dark:bg-white/5">
        <button
          type="button"
          onClick={() => onChange({ ...item, quantity: Math.max(1, item.quantity - 1) })}
          aria-label={t('orders.decreaseQty')}
          className="rounded-md p-1 text-slate hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Minus size={14} />
        </button>
        <span className="w-6 text-center font-mono text-sm text-charcoal dark:text-fog">
          {item.quantity}
        </span>
        <button
          type="button"
          onClick={() => onChange({ ...item, quantity: item.quantity + 1 })}
          aria-label={t('orders.increaseQty')}
          className="rounded-md p-1 text-slate hover:bg-black/5 dark:hover:bg-white/10"
        >
          <Plus size={14} />
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={t('orders.removeItem')}
        className="shrink-0 rounded-md p-1.5 text-slate hover:bg-cherry/10 hover:text-cherry"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
