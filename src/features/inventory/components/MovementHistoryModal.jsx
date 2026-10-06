import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'
import { Modal, Button, Skeleton, EmptyState, Badge } from '../../../components/ui'
import { getMovements } from '../api'
import { unwrapList, apiErrorMessage, formatDateTime } from '../../../lib/api'

const TYPE_STYLE = {
  kirim: { variant: 'success', label: 'Kirim' },
  chiqim: { variant: 'info', label: 'Chiqim' },
  hisobdan_chiqarish: { variant: 'danger', label: 'Hisobdan chiqarish' },
  inventarizatsiya: { variant: 'warning', label: 'Inventarizatsiya' },
}

export default function MovementHistoryModal({ isOpen, onClose, ingredient }) {
  const [error, setError] = useState(null)

  const query = useQuery({
    queryKey: ['ingredients', ingredient?._id, 'movements'],
    queryFn: async () => {
      setError(null)
      try {
        const res = await getMovements(ingredient._id, { limit: 50 })
        return unwrapList(res, 'movements')
      } catch (err) {
        setError(apiErrorMessage(err, "Harakatlar tarixi yuklanmadi"))
        return []
      }
    },
    enabled: isOpen && Boolean(ingredient?._id),
    staleTime: 15_000,
  })

  useEffect(() => {
    if (isOpen) query.refetch()
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!isOpen || !ingredient) return null

  const movements = query.data ?? []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-2xl"
      title={
        <span className="flex items-center gap-2">
          <History className="h-4 w-4 text-[#F97316]" />
          Harakatlar tarixi — {ingredient.name}
        </span>
      }
      footer={
        <Button variant="secondary" onClick={onClose}>
          Yopish
        </Button>
      }
    >
      {query.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : error ? (
        <EmptyState icon={History} title="Yuklanmadi" description={error} />
      ) : movements.length === 0 ? (
        <EmptyState
          icon={History}
          title="Harakatlar yo‘q"
          description="Ushbu xomashyo bo‘yicha hali kirim/chiqim yozilmagan."
        />
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
          {movements.map((m) => {
            const style = TYPE_STYLE[m.type] ?? TYPE_STYLE.chiqim
            const delta =
              m.type === 'kirim' || (m.type === 'inventarizatsiya' && m.quantity > (m.stockBefore ?? 0))
                ? '+'
                : '−'
            return (
              <div key={m._id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={style.variant}>{style.label}</Badge>
                    <span className={`font-extrabold ${m.type === 'kirim' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {delta} {m.quantity} {ingredient.unit}
                    </span>
                    {m.unitPrice > 0 && (
                      <span className="text-xs text-slate-400">
                        {Number(m.unitPrice).toLocaleString('ru-RU')} so‘m/
                        {ingredient.unit}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(m.createdAt)}</span>
                </div>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>
                    Qoldiq: <strong>{m.stockBefore ?? 0}</strong> → <strong>{m.stockAfter ?? 0}</strong>{' '}
                    {ingredient.unit}
                  </span>
                  {m.supplier && <span>Ta’minotchi: <strong>{m.supplier}</strong></span>}
                  {m.createdBy?.name && <span>Kim: <strong>{m.createdBy.name}</strong></span>}
                  {m.order && <span className="text-indigo-500">Buyurtma bo‘yicha</span>}
                </div>

                {m.reason && (
                  <p className="mt-1 text-xs italic text-slate-500 dark:text-slate-400">“{m.reason}”</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Modal>
  )
}