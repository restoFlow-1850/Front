import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  History,
  Package,
  PackageX,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Wallet,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react'
import { toast } from 'react-toastify'

import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
  addMovement,
  exportMovements,
} from '../api'
import IngredientModal from '../components/IngredientModal'
import MovementModal from '../components/MovementModal'
import InventoryCountModal from '../components/InventoryCountModal'
import MovementHistoryModal from '../components/MovementHistoryModal'
import { ROLES } from '../../../constants/roles'
import { unwrapList, apiErrorMessage, formatSom } from '../../../lib/api'
import { Button, Card, EmptyState, PageHeader, Skeleton, StatCard, Modal, Badge, Select } from '../../../components/ui'
import { useSelector } from 'react-redux'

const UNITS = [
  { value: 'all', label: 'Barcha birliklar' },
  { value: 'kg', label: 'kg' },
  { value: 'l', label: 'l' },
  { value: 'dona', label: 'dona' },
]

const formatQty = (n) => {
  const v = Number(n ?? 0)
  return Number.isInteger(v)
    ? v.toLocaleString('ru-RU')
    : v.toLocaleString('ru-RU', { maximumFractionDigits: 3 })
}

export default function InventoryPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)
  const canManage = [ROLES.ADMIN, ROLES.MANAGER].includes(role)

  const [search, setSearch] = useState('')
  const [unitFilter, setUnitFilter] = useState('all')
  const [showLowOnly, setShowLowOnly] = useState(false)

  const [isIngredientOpen, setIsIngredientOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState(null)

  const [movementIngredient, setMovementIngredient] = useState(null)
  const [movementType, setMovementType] = useState(null)

  const [countIngredient, setCountIngredient] = useState(null)
  const [historyIngredient, setHistoryIngredient] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const ingredientsQuery = useQuery({
    queryKey: ['ingredients'],
    queryFn: async () => unwrapList(await getIngredients({ limit: 500 }), 'ingredients'),
  })
  const ingredients = ingredientsQuery.data ?? []

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredients'] })
  }

  const createMutation = useMutation({
    mutationFn: (data) => createIngredient(data),
    onSuccess: () => {
      toast.success("Xomashyo qo‘shildi")
      setIsIngredientOpen(false)
      invalidateAll()
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Qo‘shishda xatolik')),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateIngredient(id, data),
    onSuccess: () => {
      toast.success("Xomashyo yangilandi")
      setIsIngredientOpen(false)
      setEditingIngredient(null)
      invalidateAll()
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Yangilashda xatolik')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteIngredient(id),
    onSuccess: () => {
      toast.success("Xomashyo o‘chirildi")
      setDeleteTarget(null)
      invalidateAll()
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'O‘chirishda xatolik')),
  })

  const movementMutation = useMutation({
    mutationFn: ({ id, data }) => addMovement(id, data),
    onSuccess: () => {
      toast.success("Xomashyo harakati yozildi")
      setMovementIngredient(null)
      setMovementType(null)
      invalidateAll()
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Harakat yozilmadi')),
  })

  const inventoryMutation = useMutation({
    mutationFn: ({ id, data }) => addMovement(id, data),
    onSuccess: () => {
      toast.success("Inventarizatsiya yakunlandi")
      setCountIngredient(null)
      invalidateAll()
    },
    onError: (err) => toast.error(apiErrorMessage(err, 'Inventarizatsiya saqlanmadi')),
  })

  const isLowStock = (ing) => (ing.stock ?? 0) < (ing.minStock ?? 0)

  const filtered = useMemo(() => {
    return ingredients.filter((ing) => {
      const matchesSearch =
        !search.trim() || String(ing.name).toLowerCase().includes(search.toLowerCase())
      const matchesUnit = unitFilter === 'all' || ing.unit === unitFilter
      const matchesLow = !showLowOnly || isLowStock(ing)
      return matchesSearch && matchesUnit && matchesLow
    })
  }, [ingredients, search, unitFilter, showLowOnly])

  const stats = useMemo(() => {
    let lowCount = 0
    let totalValue = 0
    ingredients.forEach((ing) => {
      if (isLowStock(ing)) lowCount += 1
      totalValue += Number(ing.stock ?? 0) * Number(ing.lastPrice ?? 0)
    })
    return { lowCount, totalValue }
  }, [ingredients])

  const openMovement = (ing, type) => {
    setMovementType(type)
    setMovementIngredient(ing)
  }

  const handleSaveIngredient = (data) => {
    if (editingIngredient) {
      updateMutation.mutate({ id: editingIngredient._id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleSaveMovement = (data) => {
    movementMutation.mutate({ id: movementIngredient._id, data })
  }

  const handleConfirmCount = (data) => {
    inventoryMutation.mutate({ id: countIngredient._id, data })
  }

  const anyPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    movementMutation.isPending ||
    inventoryMutation.isPending

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    try {
      const blob = await exportMovements({})
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ombor-harakati-${new Date().toISOString().slice(0, 10)}.xlsx`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(apiErrorMessage(err, 'Excel yuklab olishda xatolik'))
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.title', { defaultValue: 'Ombor' })}
        subtitle={t('inventory.subtitle', {
          defaultValue: 'Xomashyolar, qoldiq hisobi, kirim/chiqim va inventarizatsiya',
        })}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="secondary" onClick={() => ingredientsQuery.refetch()}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${ingredientsQuery.isFetching ? 'animate-spin' : ''}`} />
              Yangilash
            </Button>
            {canManage && (
              <Button variant="secondary" onClick={handleExport} disabled={isExporting}>
                <FileSpreadsheet className={`mr-1.5 h-4 w-4 text-emerald-500 ${isExporting ? 'animate-pulse' : ''}`} />
                Excel hisoboti
              </Button>
            )}
            {canManage && (
              <Button
                onClick={() => {
                  setEditingIngredient(null)
                  setIsIngredientOpen(true)
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t('inventory.addIngredient', { defaultValue: 'Yangi xomashyo' })}
              </Button>
            )}
          </div>
        }
      />

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Package}
          tone="indigo"
          label="Xomashyolar soni"
          value={`${ingredients.length} ta`}
        />
        <StatCard
          icon={PackageX}
          tone="rose"
          label="Minimaldan kam (qizil)"
          value={`${stats.lowCount} ta`}
          hint={stats.lowCount === 0 ? 'Barchasi yetarli' : 'Tez orada kirim qiling'}
        />
        <StatCard
          icon={Wallet}
          tone="emerald"
          label="Zaxiradagi qiymat"
          value={formatSom(stats.totalValue)}
          hint="Qoldiq × oxirgi narx"
        />
      </div>

      {/* Filtrlar */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Xomashyo qidirish..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div className="w-44">
            <Select
              value={unitFilter}
              options={UNITS}
              onChange={(e) => setUnitFilter(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={showLowOnly}
              onChange={(e) => setShowLowOnly(e.target.checked)}
              className="h-4 w-4 rounded text-[#F97316] accent-[#F97316]"
            />
            Faqat kam qolganlar
          </label>
        </div>
      </Card>

      {/* Ro‘yxat */}
      {ingredientsQuery.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-16" />
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title={showLowOnly ? 'Kam qolgan xomashyolar yo‘q' : 'Xomashyolar topilmadi'}
            description={
              showLowOnly
                ? 'Barcha xomashyolar minimal qoldiq darajasidan yuqori.'
                : 'Birinchi xomashyoni qo‘shing yoki qidiruvni o‘zgartiring.'
            }
          />
          {canManage && !showLowOnly && (
            <div className="pb-8 text-center">
              <Button
                onClick={() => {
                  setEditingIngredient(null)
                  setIsIngredientOpen(true)
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" /> {t('inventory.addIngredient', { defaultValue: 'Yangi xomashyo' })}
              </Button>
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold dark:border-slate-700">
                  <th className="py-3 pl-4 pr-3">Xomashyo</th>
                  <th className="py-3 px-3">Birlik</th>
                  <th className="py-3 px-3 text-center">Qoldiq</th>
                  <th className="py-3 px-3 text-center">Minimal</th>
                  <th className="py-3 px-3 text-right">Oxirgi narx</th>
                  <th className="py-3 px-3 text-center">Holat</th>
                  {canManage && <th className="py-3 pr-4 pl-3 text-right">Amallar</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((ing) => {
                  const low = isLowStock(ing)
                  return (
                    <tr
                      key={ing._id}
                      className={`transition-colors ${low ? 'bg-rose-50/70 dark:bg-rose-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      <td className="py-3 pl-4 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        {ing.name}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        <Badge variant="neutral">{ing.unit}</Badge>
                      </td>
                      <td className={`py-3 px-3 text-center font-extrabold ${low ? 'text-rose-600 dark:text-rose-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatQty(ing.stock)}
                      </td>
                      <td className="py-3 px-3 text-center text-slate-500">{formatQty(ing.minStock)}</td>
                      <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatSom(ing.lastPrice)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {low ? (
                          <Badge variant="danger">Kam qolgan</Badge>
                        ) : (
                          <Badge variant="success">Yetarli</Badge>
                        )}
                      </td>
                      {canManage && (
                        <td className="py-3 pr-4 pl-3">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openMovement(ing, 'kirim')}
                              className="rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                              title="Kirim (ta’minot)"
                            >
                              <ArrowDownToLine className="mr-1 inline h-3.5 w-3.5" />Kirim
                            </button>
                            <button
                              type="button"
                              onClick={() => openMovement(ing, 'chiqim')}
                              className="rounded-lg bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
                              title="Chiqim (ishlatish)"
                            >
                              <ArrowUpFromLine className="mr-1 inline h-3.5 w-3.5" />Chiqim
                            </button>
                            <button
                              type="button"
                              onClick={() => setCountIngredient(ing)}
                              className="rounded-lg bg-amber-50 px-2 py-1 text-[11px] font-bold text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400"
                              title="Inventarizatsiya"
                            >
                              <ClipboardCheck className="mr-1 inline h-3.5 w-3.5" />Hisob
                            </button>
                            <button
                              type="button"
                              onClick={() => setHistoryIngredient(ing)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Harakatlar tarixi"
                            >
                              <History size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingIngredient(ing)
                                setIsIngredientOpen(true)
                              }}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                              title="Tahrirlash"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(ing)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                              title="O‘chirish"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modals */}
      <IngredientModal
        isOpen={isIngredientOpen}
        onClose={() => {
          setIsIngredientOpen(false)
          setEditingIngredient(null)
        }}
        ingredient={editingIngredient}
        submitting={anyPending}
        onSave={handleSaveIngredient}
      />

      <MovementModal
        isOpen={Boolean(movementIngredient) && Boolean(movementType)}
        onClose={() => {
          setMovementIngredient(null)
          setMovementType(null)
        }}
        ingredient={movementIngredient}
        type={movementType}
        submitting={movementMutation.isPending}
        onSubmit={handleSaveMovement}
      />

      <InventoryCountModal
        isOpen={Boolean(countIngredient)}
        onClose={() => setCountIngredient(null)}
        ingredient={countIngredient}
        submitting={inventoryMutation.isPending}
        onConfirm={handleConfirmCount}
      />

      <MovementHistoryModal
        isOpen={Boolean(historyIngredient)}
        onClose={() => setHistoryIngredient(null)}
        ingredient={historyIngredient}
      />

      {/* O‘chirish tasdiqlash */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('confirm', { defaultValue: 'Tasdiqlash' })}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              {t('cancel', { defaultValue: 'Bekor qilish' })}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
            >
              {t('delete', { defaultValue: 'O‘chirish' })}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            “{deleteTarget?.name}” xomashyosi o‘chirilsinmi?
          </p>
        </div>
      </Modal>
    </div>
  )
}