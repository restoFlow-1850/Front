import { useEffect, useState } from 'react'
import { ArrowDownToLine, ArrowUpFromLine, Trash2 } from 'lucide-react'
import { Modal, Button, Input } from '../../../components/ui'

const TYPE_META = {
  kirim: {
    label: 'Kirim (ta’minot)',
    icon: ArrowDownToLine,
    color: 'text-emerald-600',
    submitLabel: 'Kirimni saqlash',
    qtyHelp: 'Qoldiqqa qo‘shiladi',
  },
  chiqim: {
    label: 'Chiqim (ishlatish)',
    icon: ArrowUpFromLine,
    color: 'text-indigo-600',
    submitLabel: 'Chiqimni saqlash',
    qtyHelp: 'Qoldiqdan ayiriladi',
  },
  hisobdan_chiqarish: {
    label: 'Hisobdan chiqarish (buzilgan)',
    icon: Trash2,
    color: 'text-rose-600',
    submitLabel: 'Hisobdan chiqarish',
    qtyHelp: 'Qoldiqdan ayiriladi',
  },
}

export default function MovementModal({ isOpen, onClose, ingredient, type, onSubmit, submitting }) {
  const meta = TYPE_META[type] ?? TYPE_META.kirim
  const isKirim = type === 'kirim'

  const [quantity, setQuantity] = useState('')
  const [unitPrice, setUnitPrice] = useState('')
  const [supplier, setSupplier] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setQuantity('')
    setUnitPrice('')
    setSupplier('')
    setReason('')
  }, [isOpen, type, ingredient])

  if (!isOpen || !ingredient) return null

  const Icon = meta.icon
  const qtyNum = Number(quantity) || 0
  const nextStock =
    type === 'kirim' ? (ingredient.stock || 0) + qtyNum : (ingredient.stock || 0) - qtyNum

  const handleSubmit = (e) => {
    e.preventDefault()
    if (qtyNum <= 0) return
    onSubmit({
      type,
      quantity: qtyNum,
      unitPrice: Number(unitPrice) || 0,
      ...(isKirim && supplier.trim() ? { supplier: supplier.trim() } : {}),
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${meta.color}`} />
          {meta.label}
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting} disabled={qtyNum <= 0}>
            {meta.submitLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Xomashyo"
          value={ingredient.name}
          disabled
        />

        {isKirim && (
          <Input
            label="Ta’minotchi *"
            placeholder="Masalan: “Baraka oziq-ovqat” MChJ"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            autoFocus
          />
        )}

        <div className={isKirim ? 'grid grid-cols-2 gap-4' : ''}>
          <Input
            label={`Miqdor (${ingredient.unit}) *`}
            type="number"
            step="any"
            min="0"
            placeholder="Masalan: 25"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            autoFocus={!isKirim}
          />
          {isKirim && (
            <Input
              label="Birlik narxi (so‘m)"
              type="number"
              step="100"
              min="0"
              placeholder="Masalan: 12000"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          )}
        </div>

        <Input
          label={isKirim ? 'Izoh (ixtiyoriy)' : 'Sabab *'}
          placeholder={isKirim ? 'Masalan: sentabr oyi xaridi' : 'Masalan: ishlatildi / buzildi'}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Joriy qoldiq</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {ingredient.stock ?? 0} {ingredient.unit}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">{meta.qtyHelp}</span>
            <span className="font-bold text-[#F97316]">
              {type === 'kirim' ? '+' : '−'} {qtyNum} {ingredient.unit}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between border-t border-slate-200 pt-1.5 dark:border-slate-700">
            <span className="font-semibold text-slate-600 dark:text-slate-300">Keyingi qoldiq</span>
            <span className={`font-extrabold ${nextStock < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {nextStock} {ingredient.unit}
            </span>
          </div>
        </div>
      </form>
    </Modal>
  )
}