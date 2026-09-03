// Bronlar — ro'yxat, yaratish, tahrirlash, holat o'zgartirish va o'chirish.
import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CalendarDays, Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'

import {
  clearAllReservations,
  createReservation,
  deleteReservation,
  getReservations,
  updateReservation,
} from '../api'
import { getTables, updateTable } from '../../tables/api'
import TableMap2D from '../../tables/components/TableMap2D'
import { unwrapList, apiErrorMessage, formatDateTime } from '../../../lib/api'
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONE,
  ROLES,
  TABLE_STATUS,
} from '../../../constants/roles'
import {
  Badge,
  Button,
  Card,
  DateSelect,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  TableSelect,
  Skeleton,
} from '../../../components/ui'

const today = () => new Date().toLocaleDateString('en-CA')

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  table: '',
  date: today(),
  time: '19:00',
  guests: 2,
  notes: '',
  status: RESERVATION_STATUS.PENDING,
}

// datetime-local yoki ISO date → { date: 'YYYY-MM-DD', time: 'HH:MM' }
function splitDateTime(value) {
  if (!value) return { date: today(), time: '19:00' }
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return { date: today(), time: '19:00' }
  const tz = d.getTimezoneOffset() * 60_000
  const local = new Date(d.getTime() - tz)
  return {
    date: local.toISOString().slice(0, 10),
    time: local.toISOString().slice(11, 16),
  }
}

export default function ReservationsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)
  const canDelete = [ROLES.ADMIN, ROLES.MANAGER].includes(role)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const [startDate, setStartDate] = useState(today)
  const [endDate, setEndDate] = useState(today)
  const [confirming, setConfirming] = useState(null)
  const [selectedTable, setSelectedTable] = useState(null)

  const reservationsQuery = useQuery({
    queryKey: ['reservations', startDate, endDate],
    queryFn: async () => {
      const params = { limit: 100 }
      if (startDate) params.startDate = `${startDate}T00:00:00.000Z`
      if (endDate) params.endDate = `${endDate}T23:59:59.999Z`
      return unwrapList(await getReservations(params), 'reservations')
    },
  })
  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables({ page: 1, limit: 100 }), 'tables'),
  })

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['reservations'] })
    queryClient.invalidateQueries({ queryKey: ['tables'] })
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const isoDateTime = new Date(`${form.date}T${form.time}:00`).toISOString()

      if (editing) {
        return updateReservation(editing._id, {
          status: form.status,
          date: isoDateTime,
          guests: Number(form.guests),
          notes: form.notes.trim(),
        })
      }
      return createReservation({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        table: form.table,
        date: isoDateTime,
        guests: Number(form.guests),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      })
    },
    onSuccess: () => {
      toast.success(editing ? t('reservations.updated', { defaultValue: "Bron yangilandi" }) : t('reservations.created', { defaultValue: "Bron yaratildi" }))
      closeModal()
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('kitchen.loadFailed'))),
  })

  const confirmMutation = useMutation({
    mutationFn: async ({ reservation, table }) => {
      await updateReservation(reservation._id, {
        status: RESERVATION_STATUS.CONFIRMED,
        table: table._id ?? table.id,
      })
      await updateTable(table._id ?? table.id, { status: TABLE_STATUS.BUSY })
    },
    onSuccess: () => {
      toast.success(t('reservations.confirmed', { defaultValue: "Bron tasdiqlandi" }))
      setConfirming(null)
      setSelectedTable(null)
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('kitchen.statusChangeFailed'))),
  })

  const [confirmAction, setConfirmAction] = useState(null)

  const cancelMutation = useMutation({
    mutationFn: async (reservation) => {
      await updateReservation(reservation._id, { status: RESERVATION_STATUS.CANCELLED })
      const tableId = reservation.table?._id ?? reservation.table
      if (reservation.status === RESERVATION_STATUS.CONFIRMED && tableId) {
        await updateTable(tableId, { status: TABLE_STATUS.FREE })
      }
    },
    onMutate: async (reservation) => {
      setConfirmAction(null)
      queryClient.setQueryData(['reservations', startDate, endDate], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((r) => (r._id === reservation._id ? { ...r, status: RESERVATION_STATUS.CANCELLED } : r))
      })
    },
    onSuccess: () => {
      toast.success(t('cashier.orderCancelled'))
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('cashier.cancelFailed'))),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReservation(id),
    onMutate: async (id) => {
      setConfirmAction(null)
      queryClient.setQueryData(['reservations', startDate, endDate], (old) => {
        if (!Array.isArray(old)) return old
        return old.filter((r) => r._id !== id)
      })
    },
    onSuccess: () => {
      toast.success(t('orders.deleted', { defaultValue: "Bron o'chirildi" }))
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('orders.deleteFailed'))),
  })

  const clearAllMutation = useMutation({
    mutationFn: () => clearAllReservations(),
    onMutate: async () => {
      setConfirmAction(null)
      queryClient.setQueryData(['reservations', startDate, endDate], [])
    },
    onSuccess: () => {
      toast.success(t('orders.allCleared', { defaultValue: "Barcha bronlar o'chirildi" }))
      setStartDate(today())
      setEndDate(today())
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('orders.clearFailed'))),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (reservation) => {
    setEditing(reservation)
    const dt = splitDateTime(reservation.date)
    setForm({
      customerName: reservation.customerName ?? '',
      customerPhone: reservation.customerPhone ?? '',
      table: reservation.table?._id ?? reservation.table ?? '',
      date: dt.date,
      time: dt.time,
      guests: reservation.guests ?? 2,
      notes: reservation.notes ?? '',
      status: reservation.status ?? RESERVATION_STATUS.PENDING,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditing(null)
    setForm(EMPTY_FORM)
  }

  const setField = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const isValid =
    form.customerName.trim() && form.customerPhone.trim() && form.table && form.date && form.time && form.guests > 0

  const reservations = reservationsQuery.data ?? []

  const confirmedReservationByTable = useMemo(() => {
    const map = new Map()
    for (const r of reservations) {
      if (r.status !== RESERVATION_STATUS.CONFIRMED) continue
      const tableId = r.table?._id ?? r.table
      if (tableId) map.set(tableId, r)
    }
    return map
  }, [reservations])

  const tableOptions = (tablesQuery.data ?? []).map((tVal) => ({
    value: tVal._id,
    label: `${t('dashboard.table')} ${tVal.number} — ${tVal.capacity} ${t('tables.capacity')}`,
    number: tVal.number,
    capacity: tVal.capacity,
    isVip: Boolean(tVal.location && /vip/i.test(tVal.location)),
  }))

  const selectableTables = (tablesQuery.data ?? []).map((table) => {
    const tableId = table._id ?? table.id
    const reservation = confirmedReservationByTable.get(tableId)
    return {
      ...table,
      id: tableId,
      ...(reservation
        ? {
            customerName: reservation.customerName,
            date: reservation.date ? new Date(reservation.date).toLocaleDateString() : undefined,
            time: reservation.date ? new Date(reservation.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            guestCount: reservation.guests,
          }
        : {}),
      disabled:
        table.status !== TABLE_STATUS.FREE &&
        tableId !== (confirming?.table?._id ?? confirming?.table),
    }
  })

  return (
    <div>
      <PageHeader
        title={t('reservations.title')}
        subtitle={t('reservations.subtitle')}
        actions={
          <div className="flex items-center gap-2">
            {canDelete && reservations.length > 0 && (
              <Button
                variant="danger"
                onClick={() => setConfirmAction({ type: 'clear_all' })}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> {t('waiter.clearCart')}
              </Button>
            )}
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> {t('reservations.newReservation')}
            </Button>
          </div>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('reservations.startDate')}
            </label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              {t('reservations.endDate')}
            </label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <Button
            variant="ghost"
            onClick={() => setConfirmAction({ type: 'clear_all' })}
            disabled={clearAllMutation.isPending}
          >
            {t('cancel')}
          </Button>
        </div>
      </Card>

      {reservationsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : reservationsQuery.isError ? (
        <Card>
          <p className="text-sm text-rose-600">
            {apiErrorMessage(reservationsQuery.error, t('kitchen.loadFailed'))}
          </p>
        </Card>
      ) : reservations.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title={t('reservations.noReservations')}
            description={t('waiter.tryAnotherCat')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <Card key={reservation._id} className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {reservation.customerName}
                  </span>
                  <Badge variant={RESERVATION_STATUS_TONE[reservation.status]}>
                    {t(`reservationStatus.${reservation.status}`, RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status)}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {reservation.customerPhone} · {t('dashboard.table')} {reservation.table?.number ?? '—'} ·{' '}
                  {reservation.guests} {t('tables.capacity')}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(reservation.date)}
                  {reservation.notes ? ` · ${reservation.notes}` : ''}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {reservation.status === RESERVATION_STATUS.PENDING && (
                  <Button
                    onClick={() => {
                      setConfirming(reservation)
                      setSelectedTable(reservation.table ?? null)
                    }}
                    title={t('confirm')}
                  >
                    <Check className="mr-1 h-4 w-4" /> {t('confirm')}
                  </Button>
                )}
                {[RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED].includes(reservation.status) && (
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmAction({ type: 'cancel', reservation })}
                    disabled={cancelMutation.isPending}
                    title={t('cancel')}
                  >
                    <X className="mr-1 h-4 w-4" /> {t('cancel')}
                  </Button>
                )}
                <Button variant="ghost" onClick={() => openEdit(reservation)} title={t('edit')}>
                  <Pencil className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    title={t('delete')}
                    onClick={() => setConfirmAction({ type: 'delete', reservation })}
                  >
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={Boolean(confirming)}
        onClose={() => {
          if (!confirmMutation.isPending) {
            setConfirming(null)
            setSelectedTable(null)
          }
        }}
        title={confirming ? `${t('confirm')} ${confirming.customerName}` : t('confirm')}
        footer={
          <>
            <Button
              variant="secondary"
              disabled={confirmMutation.isPending}
              onClick={() => {
                setConfirming(null)
                setSelectedTable(null)
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              disabled={!selectedTable || confirmMutation.isPending}
              isLoading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate({ reservation: confirming, table: selectedTable })}
            >
              {t('save')}
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {t('tables.selectFreeTable')}
        </p>
        {tablesQuery.isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <TableMap2D
            pickerMode
            tables={selectableTables}
            selectedTable={selectedTable}
            onTableClick={(table) => {
              if (table.disabled) {
                toast.info(t('tables.onlyFreeSelected'))
                return
              }
              setSelectedTable(table)
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? t('reservations.editReservation') : t('reservations.newReservation')}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              {t('cancel')}
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!isValid}
              isLoading={saveMutation.isPending}
            >
              {t('save')}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input
            label={t('reservations.customerName')}
            value={form.customerName}
            onChange={setField('customerName')}
            placeholder="Alisher Karimov"
            disabled={Boolean(editing)}
          />
          <Input
            label={t('reservations.phone')}
            value={form.customerPhone}
            onChange={setField('customerPhone')}
            placeholder="+998 90 123 45 67"
            disabled={Boolean(editing)}
          />
          <TableSelect
            label={t('dashboard.table')}
            placeholder={t('waiter.selectTableFirst')}
            value={form.table}
            onChange={setField('table')}
            options={tableOptions}
            disabled={Boolean(editing)}
          />
          <DateSelect
            label={t('reservations.dateAndTime')}
            dateValue={form.date}
            timeValue={form.time}
            onDateChange={(v) => setForm((p) => ({ ...p, date: v }))}
            onTimeChange={(v) => setForm((p) => ({ ...p, time: v }))}
          />
          <Input
            label={t('reservations.guests')}
            type="number"
            min={1}
            value={form.guests}
            onChange={setField('guests')}
          />
          <Input
            label={t('note')}
            value={form.notes}
            onChange={setField('notes')}
            placeholder={t('waiter.orderNotePlaceholder')}
          />
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(confirmAction)}
        onClose={() => setConfirmAction(null)}
        title={t('confirm')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmAction(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={cancelMutation.isPending || deleteMutation.isPending || clearAllMutation.isPending}
              onClick={() => {
                if (confirmAction?.type === 'cancel') {
                  cancelMutation.mutate(confirmAction.reservation)
                } else if (confirmAction?.type === 'delete') {
                  deleteMutation.mutate(confirmAction.reservation._id)
                } else if (confirmAction?.type === 'clear_all') {
                  clearAllMutation.mutate()
                }
              }}
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
            {confirmAction?.type === 'cancel'
              ? `"${confirmAction?.reservation?.customerName}" ${t('cashier.confirmCancel')}`
              : confirmAction?.type === 'delete'
              ? `"${confirmAction?.reservation?.customerName}" ${t('cashier.confirmCancel')}`
              : t('cashier.confirmCancel')}
          </p>
        </div>
      </Modal>
    </div>
  )
}
