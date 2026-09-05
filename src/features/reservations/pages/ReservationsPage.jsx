// Bronlar — ro'yxat, yaratish, tahrirlash, holat o'zgartirish va o'chirish.
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import { CalendarDays, Pencil, Plus, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'

import {
  createReservation,
  deleteReservation,
  getReservations,
  updateReservation,
} from '../api'
import { getTables } from '../../tables/api'
import { unwrapList, apiErrorMessage, formatDateTime } from '../../../lib/api'
import {
  RESERVATION_STATUS,
  RESERVATION_STATUS_LABELS,
  RESERVATION_STATUS_TONE,
  ROLES,
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

export default function ReservationsPage() {
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)
  const canDelete = [ROLES.ADMIN, ROLES.MANAGER].includes(role)

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const reservationsQuery = useQuery({
    queryKey: ['reservations'],
    queryFn: async () => unwrapList(await getReservations({ limit: 100 }), 'reservations'),
  })

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
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
    onError: (error) => toast.error(apiErrorMessage(error, 'Bronni saqlab bo\'lmadi')),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => updateReservation(id, { status }),
    onSuccess: () => {
      toast.success('Holat yangilandi')
      invalidate()
    },
    onError: (error) => toast.error(apiErrorMessage(error, "Holat o'zgarmadi")),
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
      // datetime-local "YYYY-MM-DDTHH:mm" formatini kutadi.
      date: reservation.date ? new Date(reservation.date).toISOString().slice(0, 16) : '',
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
  const tableOptions = (tablesQuery.data ?? []).map((t) => ({
    value: t._id,
    label: `Stol ${t.number} (${t.capacity} kishilik)`,
  }))

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

      {reservationsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : reservationsQuery.isError ? (
        <Card>
          <p className="text-sm text-rose-600">
            {apiErrorMessage(reservationsQuery.error, 'Bronlarni yuklab bo\'lmadi')}
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
                <div className="w-40">
                  <Select
                    value={reservation.status}
                    onChange={(e) =>
                      statusMutation.mutate({ id: reservation._id, status: e.target.value })
                    }
                    options={Object.values(RESERVATION_STATUS).map((s) => ({
                      value: s,
                      label: RESERVATION_STATUS_LABELS[s],
                    }))}
                  />
                </div>
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
          {editing && (
            <Select
              label="Holat"
              value={form.status}
              onChange={setField('status')}
              options={Object.values(RESERVATION_STATUS).map((s) => ({
                value: s,
                label: RESERVATION_STATUS_LABELS[s],
              }))}
            />
          )}
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
