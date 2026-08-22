// Bronlar — ro'yxat, yaratish, tahrirlash, holat o'zgartirish va o'chirish.
import { useState, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { CalendarDays, Check, Pencil, Plus, Trash2, X } from 'lucide-react'
import { toast } from 'react-toastify'

import {
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
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Skeleton,
} from '../../../components/ui'

const EMPTY_FORM = {
  customerName: '',
  customerPhone: '',
  table: '',
  date: '',
  guests: 2,
  notes: '',
  status: RESERVATION_STATUS.PENDING,
}

const formatLocalDatetime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const tzOffsetMs = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - tzOffsetMs).toISOString().slice(0, 16)
}

const today = () => new Date().toLocaleDateString('en-CA')

export default function ReservationsPage() {
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
    queryFn: async () =>
      unwrapList(
        await getReservations({
          limit: 100,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        }),
        'reservations',
      ),
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
      // DIQQAT: backend PUT /reservations/:id faqat status/date/guests/notes ni
      // qabul qiladi (Backend/src/validations/reservation.validation.js). Mijoz
      // ismi, telefoni va stolini yuborish foydasiz — Zod ularni jimgina tashlab
      // yuboradi va "saqlandi" degan yolg'on taassurot qoladi. Shu sabab tahrirda
      // faqat qo'llab-quvvatlanadigan maydonlar yuboriladi.
      if (editing) {
        return updateReservation(editing._id, {
          status: form.status,
          date: new Date(form.date).toISOString(),
          guests: Number(form.guests),
          notes: form.notes.trim(),
        })
      }
      return createReservation({
        customerName: form.customerName.trim(),
        customerPhone: form.customerPhone.trim(),
        table: form.table,
        date: new Date(form.date).toISOString(),
        guests: Number(form.guests),
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      })
    },
    onSuccess: () => {
      toast.success(editing ? 'Bron yangilandi' : 'Bron yaratildi')
      closeModal()
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Bronni saqlab bo'lmadi")),
  })

  const confirmMutation = useMutation({
    mutationFn: async ({ reservation, table }) => {
      // Backend PUT /reservations/:id only accepts status/date/guests/notes
      // (Zod strips unknown fields silently), so we don't send `table` here.
      // Instead we update the reservation status and manage table statuses
      // explicitly so the shared table map immediately reflects the booking.
      await updateReservation(reservation._id, {
        status: RESERVATION_STATUS.CONFIRMED,
      })

      const newTableId = table._id ?? table.id
      const oldTableId = reservation.table?._id ?? reservation.table

      // If the user picked a different table, free the old one first.
      if (oldTableId && oldTableId !== newTableId) {
        await updateTable(oldTableId, { status: TABLE_STATUS.FREE })
      }

      await updateTable(newTableId, { status: TABLE_STATUS.RESERVED })
    },
    onSuccess: () => {
      toast.success("Bron tasdiqlandi va stol bron qilingan holatiga o'tdi")
      setConfirming(null)
      setSelectedTable(null)
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Bronni tasdiqlab bo'lmadi")),
  })

  const cancelMutation = useMutation({
    mutationFn: async (reservation) => {
      await updateReservation(reservation._id, { status: RESERVATION_STATUS.CANCELLED })
      const tableId = reservation.table?._id ?? reservation.table
      if (reservation.status === RESERVATION_STATUS.CONFIRMED && tableId) {
        await updateTable(tableId, { status: TABLE_STATUS.FREE })
      }
    },
    onSuccess: () => {
      toast.success('Bron bekor qilindi')
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Bronni bekor qilib bo'lmadi")),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReservation(id),
    onSuccess: () => {
      toast.success("Bron o'chirildi")
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "O'chirib bo'lmadi")),
  })

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setModalOpen(true)
  }

  const openEdit = (reservation) => {
    setEditing(reservation)
    setForm({
      customerName: reservation.customerName ?? '',
      customerPhone: reservation.customerPhone ?? '',
      table: reservation.table?._id ?? reservation.table ?? '',
      date: reservation.date ? formatLocalDatetime(reservation.date) : '',
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
    form.customerName.trim() && form.customerPhone.trim() && form.table && form.date && form.guests > 0

  const reservations = reservationsQuery.data ?? []

  // Build a map: tableId -> confirmed reservation, so RESERVED tables can
  // show the customer name and time on the 2D map.
  const confirmedReservationByTable = useMemo(() => {
    const map = new Map()
    for (const r of reservations) {
      if (r.status !== RESERVATION_STATUS.CONFIRMED) continue
      const tableId = r.table?._id ?? r.table
      if (tableId) map.set(tableId, r)
    }
    return map
  }, [reservations])

  const tableOptions = (tablesQuery.data ?? []).map((t) => ({
    value: t._id,
    label: `Stol ${t.number} (${t.capacity} kishilik)`,
  }))
  const selectableTables = (tablesQuery.data ?? []).map((table) => {
    const tableId = table._id ?? table.id
    const reservation = confirmedReservationByTable.get(tableId)
    return {
      ...table,
      id: tableId,
      // Enrich RESERVED tables with reservation data so TableMap2D
      // can display customerName, date, time, guestCount.
      ...(reservation
        ? {
            customerName: reservation.customerName,
            date: reservation.date ? new Date(reservation.date).toLocaleDateString('uz-UZ') : undefined,
            time: reservation.date ? new Date(reservation.date).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : undefined,
            guestCount: reservation.guests,
          }
        : {}),
      // Reservation picker supports only a free table, plus the one already
      // attached to this reservation (if it is being reconfirmed).
      disabled:
        table.status !== TABLE_STATUS.FREE &&
        tableId !== (confirming?.table?._id ?? confirming?.table),
    }
  })

  return (
    <div>
      <PageHeader
        title="Bronlar"
        subtitle="Mijozlar uchun stol bandliklarini boshqarish"
        actions={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Yangi bron
          </Button>
        }
      />

      <Card className="mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Boshlanish sanasi
            </label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
              Yakuniy sana
            </label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          {(startDate || endDate) && (
            <Button
              variant="ghost"
              onClick={() => {
                setStartDate('')
                setEndDate('')
              }}
            >
              Tozalash
            </Button>
          )}
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
            {apiErrorMessage(reservationsQuery.error, "Bronlarni yuklab bo'lmadi")}
          </p>
        </Card>
      ) : reservations.length === 0 ? (
        <Card>
          <EmptyState
            icon={CalendarDays}
            title="Bron yo'q"
            description="Hozircha birorta stol bron qilinmagan."
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
                    {RESERVATION_STATUS_LABELS[reservation.status] ?? reservation.status}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {reservation.customerPhone} · Stol {reservation.table?.number ?? '—'} ·{' '}
                  {reservation.guests} mehmon
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
                    title="Tasdiqlash va stol tanlash"
                  >
                    <Check className="mr-1 h-4 w-4" /> Tasdiqlash
                  </Button>
                )}
                {[RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED].includes(reservation.status) && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (window.confirm(`"${reservation.customerName}" bronini bekor qilasizmi?`)) {
                        cancelMutation.mutate(reservation)
                      }
                    }}
                    disabled={cancelMutation.isPending}
                    title="Bronni bekor qilish"
                  >
                    <X className="mr-1 h-4 w-4" /> Bekor qilish
                  </Button>
                )}
                <Button variant="ghost" onClick={() => openEdit(reservation)} title="Tahrirlash">
                  <Pencil className="h-4 w-4" />
                </Button>
                {canDelete && (
                  <Button
                    variant="ghost"
                    title="O'chirish"
                    onClick={() => {
                      if (window.confirm(`"${reservation.customerName}" bronini o'chirasizmi?`)) {
                        deleteMutation.mutate(reservation._id)
                      }
                    }}
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
        title={confirming ? `${confirming.customerName} bronini tasdiqlash` : 'Bronni tasdiqlash'}
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
              Bekor qilish
            </Button>
            <Button
              disabled={!selectedTable || confirmMutation.isPending}
              isLoading={confirmMutation.isPending}
              onClick={() => confirmMutation.mutate({ reservation: confirming, table: selectedTable })}
            >
              Saqlash
            </Button>
          </>
        }
      >
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Bo'sh stolni xaritadan tanlang. Sariq stollar avvaldan bron qilingan, qizil stollar band.
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
                toast.info("Faqat bo'sh stolni tanlash mumkin")
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
        title={editing ? 'Bronni tahrirlash' : 'Yangi bron'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Bekor qilish
            </Button>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={!isValid}
              isLoading={saveMutation.isPending}
            >
              Saqlash
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {editing && (
            <p className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Mavjud bronda mijoz ismi, telefoni va stolini o'zgartirib bo'lmaydi — backend bu
              maydonlarni tahrirlashni qo'llab-quvvatlamaydi. Kerak bo'lsa bronni o'chirib, yangisini
              yarating.
            </p>
          )}

          <Input
            label="Mijoz ismi"
            value={form.customerName}
            onChange={setField('customerName')}
            placeholder="Alisher Karimov"
            disabled={Boolean(editing)}
          />
          <Input
            label="Telefon"
            value={form.customerPhone}
            onChange={setField('customerPhone')}
            placeholder="+998 90 123 45 67"
            disabled={Boolean(editing)}
          />
          <Select
            label="Stol"
            placeholder="Stolni tanlang"
            value={form.table}
            onChange={setField('table')}
            options={tableOptions}
            disabled={Boolean(editing)}
          />
          <Input
            label="Sana va vaqt"
            type="datetime-local"
            value={form.date}
            onChange={setField('date')}
          />
          <Input
            label="Mehmonlar soni"
            type="number"
            min={1}
            value={form.guests}
            onChange={setField('guests')}
          />
          <Input
            label="Izoh (ixtiyoriy)"
            value={form.notes}
            onChange={setField('notes')}
            placeholder="Deraza yonidagi stol"
          />
        </div>
      </Modal>
    </div>
  )
}
