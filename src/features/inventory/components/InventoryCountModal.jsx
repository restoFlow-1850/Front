import { useEffect, useState } from 'react'
import { ClipboardCheck } from 'lucide-react'
import { Modal, Button, Input } from '../../../components/ui'

const MOVEMENT_TYPE = 'inventarizatsiya'

// Haqiqiy qoldiq kiritiladi — tizim farqni ko'rsatadi va tasdiqlansa
// StockMovement('inventarizatsiya') yoziladi (qoldiq mutlaq qiymatga tenglanadi).
export default function InventoryCountModal({ isOpen, onClose, ingredient, onConfirm, submitting }) {
  const [actual, setActual] = useState('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    if (!isOpen) return
    setActual(ingredient?.stock != null ? String(ingredient.stock) : '')
    setReason('')
  }, [isOpen, ingredient])

  if (!isOpen || !ingredient) return null

  const current = Number(ingredient.stock) || 0
  const actualNum = Number(actual)
  const valid = Number.isFinite(actualNum) && actualNum >= 0
  const diff = valid ? actualNum - current : null
  const diffLabel =
    diff == null ? '—' : diff === 0 ? 'Farq yo‘q' : `${diff > 0 ? '+' : ''}${diff} ${ingredient.unit}`

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!valid) return
    onConfirm({
      type: MOVEMENT_TYPE,
      quantity: actualNum,
      ...(reason.trim() ? { reason: reason.trim() } : {}),
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <ClipboardCheck className="h-4 w-4 text-[#F97316]" /> Inventarizatsiya
        </span>
      }
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={handleSubmit} isLoading={submitting} disabled={!valid}>
            Inventarizatsiyani yakunlash
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

        <Input
          label={`Haqiqiy qoldiq (${ingredient.unit}) *`}
          type="number"
          step="any"
          min="0"
          placeholder="Jismonan hisoblagan miqdorni kiriting"
          value={actual}
          onChange={(e) => setActual(e.target.value)}
          autoFocus
        />

        {/* Tizim farqni ko'rsatadi */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs dark:border-slate-700 dark:bg-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Tizimdagi qoldiq</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {current} {ingredient.unit}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400">Haqiqiy qoldiq</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {valid ? `${actualNum} ${ingredient.unit}` : '—'}
            </span>
          </div>
          <div
            className={`mt-2 flex items-center justify-between rounded-lg px-3 py-2 ${
              diff == null
                ? 'bg-slate-100 dark:bg-slate-700'
                : diff < 0
                  ? 'bg-rose-50 dark:bg-rose-950/40'
                  : diff > 0
                    ? 'bg-emerald-50 dark:bg-emerald-950/40'
                    : 'bg-slate-100 dark:bg-slate-700'
            }`}
          >
            <span className="font-semibold text-slate-600 dark:text-slate-300">Farq</span>
            <span
              className={`font-extrabold ${
                diff == null
                  ? 'text-slate-400'
                  : diff < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : diff > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500'
              }`}
            >
              {diffLabel}
            </span>
          </div>
          {diff != null && diff < 0 && (
            <p className="mt-1.5 text-[11px] text-rose-500">
              Manfiy farq — kamomad. Qoldiq mos ravishda kamayadi va hisobga yoziladi.
            </p>
          )}
          {diff != null && diff > 0 && (
            <p className="mt-1.5 text-[11px] text-emerald-500">
              Ijobiy farq — ortiqcha topildi. Qoldiq oshiriladi va hisobga yoziladi.
            </p>
          )}
        </div>

        <Input
          label="Izoh (ixtiyoriy)"
          placeholder="Masalan: oy oxiri hisob-kitobi"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </form>
    </Modal>
  )
}