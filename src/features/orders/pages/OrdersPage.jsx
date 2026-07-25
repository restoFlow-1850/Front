// Ofitsiant ekrani — stol tanlash, savatga taom qo'shish, buyurtma yuborish.
// Mas'ul: Abdugani (ekran), Ziyodulla (backend ulash).
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, Send } from 'lucide-react'
import OrderItemRow from '../components/OrderItemRow'
import { createOrder } from '../api'

const emptyItem = () => ({ product: '', quantity: 1 })

export default function OrdersPage() {
  const { t } = useTranslation()
  const [table, setTable] = useState('')
  const [items, setItems] = useState([emptyItem()])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const updateItem = (index, next) =>
    setItems((prev) => prev.map((it, i) => (i === index ? next : it)))

  const removeItem = (index) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))

  const addItem = () => setItems((prev) => [...prev, emptyItem()])

  const reset = () => {
    setTable('')
    setItems([emptyItem()])
    setNotes('')
  }

  const canSubmit =
    table.trim().length > 0 && items.some((it) => it.product.trim().length > 0)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!canSubmit || submitting) return

    const payload = {
      table: table.trim(),
      items: items
        .filter((it) => it.product.trim().length > 0)
        .map((it) => ({ product: it.product.trim(), quantity: it.quantity })),
      notes: notes.trim(),
    }

    setSubmitting(true)
    try {
      await createOrder(payload)
      toast.success(t('orders.submitSuccess'))
      reset()
    } catch {
      toast.error(t('orders.submitError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="font-display text-2xl text-charcoal dark:text-fog">{t('orders.title')}</h2>
      <p className="mt-1 text-sm text-slate">{t('orders.subtitle')}</p>

      <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-charcoal dark:text-fog">
            {t('common.table')}
          </span>
          <input
            type="text"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder={t('orders.tablePlaceholder')}
            className="rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold/40 dark:border-ink-border dark:bg-ink-2 dark:text-fog"
          />
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-charcoal dark:text-fog">
              {t('orders.items')}
            </span>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-sm font-medium text-gold hover:underline"
            >
              <Plus size={15} />
              {t('orders.addItem')}
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {items.map((item, index) => (
              <OrderItemRow
                key={index}
                item={item}
                onChange={(next) => updateItem(index, next)}
                onRemove={() => removeItem(index)}
              />
            ))}
          </div>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-charcoal dark:text-fog">
            {t('kitchen.note')}
          </span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('orders.notesPlaceholder')}
            className="resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-charcoal outline-none focus:ring-2 focus:ring-gold/40 dark:border-ink-border dark:bg-ink-2 dark:text-fog"
          />
        </label>

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-sm font-semibold text-ink transition-opacity hover:bg-gold-dim disabled:opacity-50"
        >
          <Send size={16} />
          {submitting ? t('common.loading') : t('orders.submit')}
        </button>
      </form>
    </div>
  )
}
