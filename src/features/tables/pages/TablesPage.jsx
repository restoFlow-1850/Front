// Stollar — holat bo'yicha ko'rinish; admin/menejer uchun to'liq CRUD.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { Eye, Grid3X3, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { toast } from 'react-toastify'

import { createTable, deleteTable, getTables, updateTable } from '../api'
import { getOrders } from '../../orders/api'
import { unwrapList, apiErrorMessage } from '../../../lib/api'
import { ROLES, ORDER_STATUS, ORDER_STATUS_LABELS } from '../../../constants/roles'
import { TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_TONE } from '../../../constants/tableStatus'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
} from '../../../components/ui'

const EMPTY_FORM = { number: '', capacity: 4, location: '', status: TABLE_STATUS.AVAILABLE }

const CARD_STYLES = {
  [TABLE_STATUS.AVAILABLE]: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40',
  [TABLE_STATUS.OCCUPIED]: 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40',
  [TABLE_STATUS.RESERVED]: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40',
  [TABLE_STATUS.CLEANING]: 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40',
}

// Stol "band" bo'lganda ko'rsatiladigan buyurtma faqat hali yopilmagan
// (berilgan/yopilgan emas) buyurtmalar orasidan tanlanadi.
const ACTIVE_ORDER_STATUSES = [ORDER_STATUS.NEW, ORDER_STATUS.IN_KITCHEN, ORDER_STATUS.READY]

export default function TablesPage() {
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)
  const canManage = [ROLES.ADMIN, ROLES.MANAGER].includes(role)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  // Band stol ustidagi "ko'z" tugmasi bosilganda shu stolning joriy buyurtmasi ko'rsatiladi.
  const [viewingOrderTable, setViewingOrderTable] = useState(null)

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
  })

  // TASDIQLANMAGAN TAXMIN: backend /orders so'rovida stol bo'yicha server tarafida
  // filtrlashni qo'llab-quvvatlamaydi deb faraz qilindi, shuning uchun so'nggi
  // buyurtmalar olinib, mijoz tomonda table._id bo'yicha moslashtiriladi. Agar
  // backend `/orders?table=<id>` qo'llab-quvvatlasa, shu so'rovni optimallashtirish
  // mumkin.
  const ordersQuery = useQuery({
    queryKey: ['orders', 'tables-view'],
    queryFn: async () => unwrapList(await getOrders({ limit: 100 }), 'orders'),
    enabled: Boolean(viewingOrderTable),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tables'] })

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        number: Number(form.number),
        capacity: Number(form.capacity),
        ...(form.location.trim() ? { location: form.location.trim() } : {}),
        ...(editing ? { status: form.status } : {}),
      }
      return editing ? updateTable(editing._id, payload) : createTable(payload)
    },
    onSuccess: () => {
      toast.success(editing ? 'Stol yangilandi' : "Stol qo'shildi")
      closeModal()
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Stolni saqlab bo'lmadi")),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateTable(id, { status }),
    onSuccess: invalidate,
    onError: (error) => toast.error(apiErrorMessage(error, "Holat o'zgarmadi")),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTable(id),
    onSuccess: () => {
      toast.success("Stol o'chirildi")
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "O'chirib bo'lmadi")),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (table) => {
    setEditing(table)
    setForm({
      number: table.number ?? '',
      capacity: table.capacity ?? 4,
      location: table.location ?? '',
      status: table.status ?? TABLE_STATUS.AVAILABLE,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const tables = [...(tablesQuery.data ?? [])].sort((a, b) => a.number - b.number)
  const counts = {
    [TABLE_STATUS.AVAILABLE]: tables.filter((t) => t.status === TABLE_STATUS.AVAILABLE).length,
    [TABLE_STATUS.OCCUPIED]: tables.filter((t) => t.status === TABLE_STATUS.OCCUPIED).length,
    [TABLE_STATUS.RESERVED]: tables.filter((t) => t.status === TABLE_STATUS.RESERVED).length,
  }

  const viewingOrder = viewingOrderTable
    ? (ordersQuery.data ?? [])
        .filter((o) => (o.table?._id ?? o.table) === viewingOrderTable._id)
        .filter((o) => ACTIVE_ORDER_STATUSES.includes(o.status))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0]
    : null

  const closeOrderView = () => setViewingOrderTable(null)

  return (
    <div>
      <PageHeader
        title="Stollar"
        subtitle={`Jami ${tables.length} ta · Bo'sh ${counts[TABLE_STATUS.AVAILABLE]} · Band ${counts[TABLE_STATUS.OCCUPIED]} · Bron ${counts[TABLE_STATUS.RESERVED]}`}
        actions={
          canManage && (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Stol qo'shish
            </Button>
          )
        }
      />

      {tablesQuery.isLoading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : tablesQuery.isError ? (
        <Card>
          <p className="text-sm text-rose-600">
            {apiErrorMessage(tablesQuery.error, "Stollarni yuklab bo'lmadi")}
          </p>
        </Card>
      ) : tables.length === 0 ? (
        <Card>
          <EmptyState
            icon={Grid3X3}
            title="Stollar yo'q"
            description={
              canManage ? "Birinchi stolni qo'shing." : "Administrator hali stol qo'shmagan."
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {tables.map((table) => (
            <Card key={table._id} className={`border-2 ${CARD_STYLES[table.status] ?? ''}`}>
              <div className="flex items-start justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {table.number}
                </span>
                <div className="flex items-center gap-1.5">
                  {table.status === TABLE_STATUS.OCCUPIED && (
                    <button
                      type="button"
                      onClick={() => setViewingOrderTable(table)}
                      title="Buyurtmani ko'rish"
                      className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-slate-200"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                  <Badge variant={TABLE_STATUS_TONE[table.status]}>
                    {TABLE_STATUS_LABELS[table.status] ?? table.status}
                  </Badge>
                </div>
              </div>

              <p className="mt-2 flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300">
                <Users className="h-3 w-3" /> {table.capacity} kishilik
              </p>
              {table.location && (
                <p className="mt-0.5 truncate text-xs text-slate-500">{table.location}</p>
              )}

              {canManage && (
                <div className="mt-3 space-y-2">
                  <Select
                    value={table.status}
                    onChange={(e) => statusMutation.mutate({ id: table._id, status: e.target.value })}
                    options={Object.values(TABLE_STATUS).map((s) => ({
                      value: s,
                      label: TABLE_STATUS_LABELS[s],
                    }))}
                  />
                  <div className="flex gap-1">
                    <Button variant="ghost" className="flex-1" onClick={() => openEdit(table)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        if (window.confirm(`Stol ${table.number} ni o'chirasizmi?`)) {
                          deleteMutation.mutate(table._id)
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? `Stol ${editing.number}` : 'Yangi stol'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Bekor qilish
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!form.number || !form.capacity}
              isLoading={saveMutation.isPending}
            >
              Saqlash
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label="Stol raqami"
            type="number"
            min={1}
            value={form.number}
            onChange={setField('number')}
          />
          <Input
            label="Sig'imi (necha kishilik)"
            type="number"
            min={1}
            value={form.capacity}
            onChange={setField('capacity')}
          />
          <Input
            label="Joylashuvi (ixtiyoriy)"
            value={form.location}
            onChange={setField('location')}
            placeholder="Asosiy zal / Terassa"
          />
          {editing && (
            <Select
              label="Holat"
              value={form.status}
              onChange={setField('status')}
              options={Object.values(TABLE_STATUS).map((s) => ({
                value: s,
                label: TABLE_STATUS_LABELS[s],
              }))}
            />
          )}
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(viewingOrderTable)}
        onClose={closeOrderView}
        title={viewingOrderTable ? `Stol ${viewingOrderTable.number} — buyurtma` : ''}
        footer={
          <Button variant="secondary" onClick={closeOrderView}>
            Yopish
          </Button>
        }
      >
        {ordersQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : ordersQuery.isError ? (
          <p className="text-sm text-rose-600">
            {apiErrorMessage(ordersQuery.error, "Buyurtmani yuklab bo'lmadi")}
          </p>
        ) : !viewingOrder ? (
          <p className="text-sm text-slate-500">
            Bu stol uchun faol buyurtma topilmadi. (Stol holati "Band" bo'lsa-da,
            buyurtma boshqa ro'yxatda bo'lishi yoki hali yaratilmagan bo'lishi mumkin.)
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wide text-slate-400">
                Buyurtma #{viewingOrder.number ?? String(viewingOrder._id).slice(-4).toUpperCase()}
              </span>
              <Badge>{ORDER_STATUS_LABELS[viewingOrder.status] ?? viewingOrder.status}</Badge>
            </div>

            <ul className="space-y-1.5 border-t border-dashed border-slate-200 pt-3 dark:border-slate-700">
              {viewingOrder.items?.map((item, index) => (
                <li
                  key={`${item.product ?? item.name}-${index}`}
                  className="flex justify-between text-sm text-slate-700 dark:text-slate-200"
                >
                  <span className="truncate">{item.name ?? item.product}</span>
                  <span className="shrink-0 font-mono font-semibold text-slate-400">
                    ×{item.quantity}
                  </span>
                </li>
              ))}
            </ul>

            {viewingOrder.notes && (
              <p className="rounded-lg border border-amber-300 bg-amber-100 px-3 py-2 text-sm font-medium text-amber-900 dark:border-amber-500/40 dark:bg-amber-950/60 dark:text-amber-300">
                {viewingOrder.notes}
              </p>
            )}

            {(viewingOrder.waiter?.name ?? viewingOrder.waiter) && (
              <p className="text-xs text-slate-400">
                Ofitsiant: {viewingOrder.waiter?.name ?? viewingOrder.waiter}
              </p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
