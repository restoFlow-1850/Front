// Buyurtmalar ro'yxati — filtr, sahifalash, status boshqaruvi va stol almashtirish.
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { ArrowRightLeft, ClipboardList, RefreshCw } from 'lucide-react'
import { toast } from 'react-toastify'

import { getOrders, updateOrderStatus, transferOrderTable } from '../api'
import { getTables } from '../../tables/api'
import { unwrapList, unwrapPagination, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_LIST,
  ORDER_STATUS_TONE,
  NEXT_ORDER_STATUS,
  ROLES,
} from '../../../constants/roles'
import { Badge, Button, Card, EmptyState, Modal, PageHeader, Select, Skeleton } from '../../../components/ui'

const PAGE_SIZE = 10

export default function OrdersPage() {
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)

  const [status, setStatus] = useState('')
  const [paid, setPaid] = useState('')
  const [page, setPage] = useState(1)
  const [transferOrder, setTransferOrder] = useState(null)

  const canTransfer = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER].includes(role)

  const params = useMemo(() => {
    const p = { page, limit: PAGE_SIZE }
    if (status) p.status = status
    if (paid) p.paid = paid
    return p
  }, [status, paid, page])

  const ordersQuery = useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await getOrders(params)
      return { orders: unwrapList(res, 'orders'), pagination: unwrapPagination(res) }
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => updateOrderStatus(id, nextStatus),
    onSuccess: (_data, { nextStatus }) => {
      toast.success(`Holat "${ORDER_STATUS_LABELS[nextStatus]}" ga o'zgartirildi`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Holatni o\'zgartirib bo\'lmadi')),
  })

  const orders = ordersQuery.data?.orders ?? []
  const pagination = ordersQuery.data?.pagination

  const resetFilters = () => {
    setStatus('')
    setPaid('')
    setPage(1)
  }

  return (
    <div>
      <PageHeader
        title="Buyurtmalar"
        subtitle="Barcha buyurtmalar, ularning holati va to'lov ma'lumoti"
        actions={
          <Button variant="secondary" onClick={() => ordersQuery.refetch()}>
            <RefreshCw className={`mr-2 h-4 w-4 ${ordersQuery.isFetching ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Select
              label="Holat"
              placeholder="Barchasi"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              options={ORDER_STATUS_LIST.map((s) => ({ value: s, label: ORDER_STATUS_LABELS[s] }))}
            />
          </div>
          <div className="w-44">
            <Select
              label="To'lov"
              placeholder="Barchasi"
              value={paid}
              onChange={(e) => {
                setPaid(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'true', label: "To'langan" },
                { value: 'false', label: "To'lanmagan" },
              ]}
            />
          </div>
          {(status || paid) && (
            <Button variant="ghost" onClick={resetFilters}>
              Tozalash
            </Button>
          )}
        </div>
      </Card>

      {ordersQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : ordersQuery.isError ? (
        <Card>
          <p className="text-sm text-rose-600">
            {apiErrorMessage(ordersQuery.error, 'Buyurtmalarni yuklab bo\'lmadi')}
          </p>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title="Buyurtma topilmadi"
            description="Tanlangan filtrlar bo'yicha buyurtma yo'q."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              canTransfer={canTransfer}
              onAdvance={(nextStatus) =>
                statusMutation.mutate({ id: order._id, nextStatus })
              }
              onTransfer={() => setTransferOrder(order)}
              isBusy={statusMutation.isPending}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Oldingi
          </Button>
          <span className="text-sm text-slate-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Keyingi
          </Button>
        </div>
      )}

      <TransferTableModal
        order={transferOrder}
        onClose={() => setTransferOrder(null)}
        onDone={() => {
          setTransferOrder(null)
          queryClient.invalidateQueries({ queryKey: ['orders'] })
          queryClient.invalidateQueries({ queryKey: ['tables'] })
        }}
      />
    </div>
  )
}

function OrderRow({ order, onAdvance, onTransfer, canTransfer, isBusy }) {
  const next = NEXT_ORDER_STATUS[order.status]
  const paidTotal = order.paidTotal ?? 0
  const isPaid = order.isPaid ?? paidTotal >= order.totalAmount

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            Stol {order.table?.number ?? '—'}
          </span>
          <Badge variant={ORDER_STATUS_TONE[order.status]}>
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </Badge>
          <Badge variant={isPaid ? 'success' : 'warning'}>
            {isPaid ? "To'langan" : "To'lanmagan"}
          </Badge>
          <span className="text-xs text-slate-400">{formatTime(order.createdAt)}</span>
        </div>

        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
          {order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Ofitsiant: {order.waiter?.name ?? '—'}
          {order.notes ? ` · Izoh: ${order.notes}` : ''}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-slate-900 dark:text-white">{formatSom(order.totalAmount)}</p>
        {!isPaid && paidTotal > 0 && (
          <p className="text-xs text-slate-400">To'langan: {formatSom(paidTotal)}</p>
        )}
      </div>

      <div className="flex gap-2">
        {canTransfer && order.status !== ORDER_STATUS.CLOSED && (
          <Button variant="ghost" onClick={onTransfer} title="Boshqa stolga o'tkazish">
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        )}
        {next && (
          <Button onClick={() => onAdvance(next)} disabled={isBusy}>
            {ORDER_STATUS_LABELS[next]}
          </Button>
        )}
      </div>
    </Card>
  )
}

function TransferTableModal({ order, onClose, onDone }) {
  const [tableId, setTableId] = useState('')

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
    enabled: Boolean(order),
  })

  const mutation = useMutation({
    mutationFn: () => transferOrderTable(order._id, tableId),
    onSuccess: () => {
      toast.success("Buyurtma boshqa stolga o'tkazildi")
      setTableId('')
      onDone()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Stolni o'zgartirib bo'lmadi")),
  })

  if (!order) return null

  // Joriy stolni ro'yxatdan chiqarib tashlaymiz — o'zini o'ziga ko'chirish mantiqsiz.
  const options = (tablesQuery.data ?? [])
    .filter((t) => t._id !== (order.table?._id ?? order.table))
    .map((t) => ({ value: t._id, label: `Stol ${t.number} (${t.capacity} kishilik)` }))

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Stol ${order.table?.number ?? ''} → boshqa stol`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!tableId} isLoading={mutation.isPending}>
            O'tkazish
          </Button>
        </>
      }
    >
      <Select
        label="Yangi stol"
        placeholder="Stolni tanlang"
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
        options={options}
      />
    </Modal>
  )
}
