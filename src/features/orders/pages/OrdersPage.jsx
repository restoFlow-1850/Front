// Buyurtmalar ro'yxati — filtr, sahifalash, status boshqaruvi va stol almashtirish.
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ArrowRightLeft, ClipboardList, RefreshCw, Trash2, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'

import { clearAllOrders, deleteOrder, getOrders, updateOrderStatus, transferOrderTable, cancelOrder } from '../api'
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
import { Badge, Button, Card, EmptyState, Input, Modal, PageHeader, Select, Skeleton } from '../../../components/ui'

const PAGE_SIZE = 10

export default function OrdersPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)

  const [status, setStatus] = useState('')
  const [paid, setPaid] = useState('')
  const [page, setPage] = useState(1)
  const [transferOrder, setTransferOrder] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const canTransfer = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER].includes(role)
  const canCancel = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER].includes(role)
  const canDelete = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER].includes(role)

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
      toast.success(`${t('kitchen.statusChanged', { status: t(`orderStatus.${nextStatus}`, ORDER_STATUS_LABELS[nextStatus]) })}`)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('kitchen.statusChangeFailed'))),
  })

  const cancelMutation = useMutation({
    mutationFn: ({ id, reason }) => cancelOrder(id, reason),
    onSuccess: () => {
      toast.success(t('cashier.orderCancelled'))
      setCancelTarget(null)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('cashier.cancelFailed'))),
  })

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllOrders(),
    onMutate: async () => {
      setClearConfirmOpen(false)
      queryClient.setQueryData(['orders', params], { orders: [], pagination: { page: 1, totalPages: 1, total: 0 } })
    },
    onSuccess: () => {
      toast.success(t('orders.allCleared', { defaultValue: "Barcha buyurtmalar o'chirildi" }))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('orders.clearFailed', { defaultValue: "Buyurtmalarni o'chirib bo'lmadi" }))),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteOrder(id),
    onMutate: async (id) => {
      setDeleteTarget(null)
      queryClient.setQueryData(['orders', params], (old) => {
        if (!old) return old
        return {
          ...old,
          orders: old.orders.filter((o) => o._id !== id),
        }
      })
    },
    onSuccess: () => {
      toast.success(t('orders.deleted', { defaultValue: "Buyurtma o'chirildi" }))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('orders.deleteFailed', { defaultValue: "Buyurtmani o'chirib bo'lmadi" }))),
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
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            {canDelete && orders.length > 0 && (
              <Button
                variant="danger"
                onClick={() => setClearConfirmOpen(true)}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> {t('waiter.clearCart')}
              </Button>
            )}
            <Button variant="secondary" onClick={() => ordersQuery.refetch()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${ordersQuery.isFetching ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="w-44">
            <Select
              label={t('status')}
              placeholder={t('all')}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value)
                setPage(1)
              }}
              options={ORDER_STATUS_LIST.map((s) => ({ value: s, label: t(`orderStatus.${s}`, ORDER_STATUS_LABELS[s]) }))}
            />
          </div>
          <div className="w-44">
            <Select
              label={t('cashier.cashierAndPay')}
              placeholder={t('all')}
              value={paid}
              onChange={(e) => {
                setPaid(e.target.value)
                setPage(1)
              }}
              options={[
                { value: 'true', label: t('cashier.paid') },
                { value: 'false', label: t('cashier.unpaid') },
              ]}
            />
          </div>
          {(status || paid) && (
            <Button variant="ghost" onClick={resetFilters}>
              {t('cancel')}
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
            {apiErrorMessage(ordersQuery.error, t('kitchen.loadFailed'))}
          </p>
        </Card>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={ClipboardList}
            title={t('dashboard.noOrders')}
            description={t('waiter.tryAnotherCat')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
              canTransfer={canTransfer}
              canCancel={canCancel}
              canDelete={canDelete}
              onAdvance={(nextStatus) =>
                statusMutation.mutate({ id: order._id, nextStatus })
              }
              onTransfer={() => setTransferOrder(order)}
              onCancel={() => setCancelTarget(order)}
              onDelete={() => setDeleteTarget(order)}
              isBusy={statusMutation.isPending}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-center gap-3">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t('back')}
          </Button>
          <span className="text-sm text-slate-500">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            {t('confirm')}
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

      <CancelOrderModal
        order={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => cancelMutation.mutate({ id: cancelTarget._id, reason })}
        isLoading={cancelMutation.isPending}
      />

      {/* Barchasini tozalash modali */}
      <Modal
        isOpen={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        title={t('confirm')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setClearConfirmOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={clearAllMutation.isPending}
              onClick={() => clearAllMutation.mutate()}
            >
              {t('confirm')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('cashier.confirmCancel')}
          </p>
        </div>
      </Modal>

      {/* Yakka buyurtmani o'chirish modali */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('confirm')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate(deleteTarget._id)}
            >
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {t('dashboard.table')} {deleteTarget?.table?.number ?? '—'} {t('cashier.confirmCancel')}
          </p>
        </div>
      </Modal>
    </div>
  )
}

function OrderRow({ order, onAdvance, onTransfer, onCancel, onDelete, canTransfer, canCancel, canDelete, isBusy }) {
  const { t } = useTranslation()
  const next = NEXT_ORDER_STATUS[order.status]
  const paidTotal = order.paidTotal ?? 0
  const isPaid = order.isPaid ?? paidTotal >= order.totalAmount
  const isActive = order.status !== ORDER_STATUS.CLOSED && order.status !== ORDER_STATUS.CANCELLED

  return (
    <Card className="flex flex-wrap items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-900 dark:text-white">
            {t('dashboard.table')} {order.table?.number ?? '—'}
          </span>
          <Badge variant={ORDER_STATUS_TONE[order.status]}>
            {t(`orderStatus.${order.status}`, ORDER_STATUS_LABELS[order.status] ?? order.status)}
          </Badge>
          <Badge variant={isPaid ? 'success' : 'warning'}>
            {isPaid ? t('cashier.paid') : t('cashier.unpaid')}
          </Badge>
          <span className="text-xs text-slate-400">{formatTime(order.createdAt)}</span>
        </div>

        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
          {order.items?.map((i) => `${i.name} ×${i.quantity}`).join(', ')}
        </p>

        <p className="mt-1 text-xs text-slate-400">
          {t('dashboard.waiter')}: {order.waiter?.name ?? '—'}
          {order.notes ? ` · ${t('note')}: ${order.notes}` : ''}
        </p>
      </div>

      <div className="text-right">
        <p className="font-bold text-slate-900 dark:text-white">{formatSom(order.totalAmount)}</p>
        {!isPaid && paidTotal > 0 && (
          <p className="text-xs text-slate-400">{t('cashier.paidAmount')}: {formatSom(paidTotal)}</p>
        )}
      </div>

      <div className="flex gap-2">
        {canTransfer && isActive && (
          <Button variant="ghost" onClick={onTransfer} title={t('waiter.transfer')}>
            <ArrowRightLeft className="h-4 w-4" />
          </Button>
        )}
        {canCancel && isActive && (
          <Button variant="ghost" onClick={onCancel} title={t('cashier.cancelOrder')} className="text-rose-600 hover:text-rose-700">
            <XCircle className="h-4 w-4" />
          </Button>
        )}
        {canDelete && (
          <Button variant="ghost" onClick={onDelete} title={t('delete')}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
        )}
        {next && (
          <Button onClick={() => onAdvance(next)} disabled={isBusy}>
            {t(`orderStatus.${next}`, ORDER_STATUS_LABELS[next])}
          </Button>
        )}
      </div>
    </Card>
  )
}

function TransferTableModal({ order, onClose, onDone }) {
  const { t } = useTranslation()
  const [tableId, setTableId] = useState('')

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
    enabled: Boolean(order),
  })

  const mutation = useMutation({
    mutationFn: () => transferOrderTable(order._id, tableId),
    onSuccess: () => {
      toast.success(t('waiter.transferSuccess'))
      setTableId('')
      onDone()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('waiter.transferFailed'))),
  })

  if (!order) return null

  const options = (tablesQuery.data ?? [])
    .filter((tbl) => tbl._id !== (order.table?._id ?? order.table))
    .map((tbl) => ({ value: tbl._id, label: `${t('dashboard.table')} ${tbl.number}` }))

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${t('dashboard.table')} ${order.table?.number ?? ''} → ${t('waiter.transfer')}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('cancel')}
          </Button>
          <Button onClick={() => mutation.mutate()} disabled={!tableId} isLoading={mutation.isPending}>
            {t('waiter.transfer')}
          </Button>
        </>
      }
    >
      <Select
        label={t('waiter.selectNewTable')}
        placeholder={t('waiter.selectNewTable')}
        value={tableId}
        onChange={(e) => setTableId(e.target.value)}
        options={options}
      />
    </Modal>
  )
}

function CancelOrderModal({ order, onClose, onConfirm, isLoading }) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')

  if (!order) return null

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${t('dashboard.table')} ${order.table?.number ?? ''} — ${t('cashier.cancelOrder')}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('back')}
          </Button>
          <Button
            variant="danger"
            onClick={() => onConfirm(reason)}
            isLoading={isLoading}
          >
            {t('cashier.yesCancel')}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
        {t('cashier.confirmCancel')}
      </p>
      <Input
        label={t('note')}
        placeholder={t('waiter.orderNotePlaceholder')}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
      />
    </Modal>
  )
}
