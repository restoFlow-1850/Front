import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAttendance } from '../attendanceApi'
import { Table, Button } from '../../../components/ui'

const STATUS_LABELS = {
    present: 'Keldi',
    absent: 'Kelmadi',
    late: 'Kechikdi',
    'half-day': "Yarim kun",
}

const STATUS_STYLES = {
    present: 'text-green-600',
    absent: 'text-red-500',
    late: 'text-yellow-600',
    'half-day': 'text-blue-500',
}

function formatTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString('uz-UZ')
}

function calcHours(checkIn, checkOut) {
    if (!checkIn || !checkOut) return '—'
    const diffMs = new Date(checkOut) - new Date(checkIn)
    if (diffMs <= 0) return '—'
    const hours = diffMs / (1000 * 60 * 60)
    return `${hours.toFixed(1)} soat`
}

export default function AttendanceTable() {
    const [page, setPage] = useState(1)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['attendance', page],
        queryFn: async () => {
            const res = await getAttendance({ page, limit: 20 })
            const payload = res.data?.data ?? res.data
            return {
                items: payload?.attendances ?? [],
                pagination: res.data?.pagination ?? null,
            }
        },
    })

    const columns = [
        {
            key: 'employee',
            title: 'Xodim',
            render: (row) => row.employee?.name ?? row.employee ?? '—',
        },
        { key: 'date', title: 'Sana', render: (row) => formatDate(row.date) },
        { key: 'checkIn', title: 'Kelgan vaqti', render: (row) => formatTime(row.checkIn) },
        { key: 'checkOut', title: 'Ketgan vaqti', render: (row) => formatTime(row.checkOut) },
        {
            key: 'hours',
            title: 'Ishlangan soat',
            render: (row) => calcHours(row.checkIn, row.checkOut),
        },
        {
            key: 'status',
            title: 'Holat',
            render: (row) => (
                <span className={STATUS_STYLES[row.status] ?? 'text-gray-400'}>
                    {STATUS_LABELS[row.status] ?? row.status}
                </span>
            ),
        },
    ]

    if (isError) {
        return <p className="text-red-500">Davomat ma'lumotlarini yuklashda xatolik yuz berdi</p>
    }

    return (
        <div>
            <Table
                columns={columns}
                data={data?.items ?? []}
                isLoading={isLoading}
                emptyMessage="Davomat yozuvlari topilmadi"
            />

            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                    <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                        Oldingi
                    </Button>
                    <span className="px-2 text-sm text-gray-500">
                        {page} / {data.pagination.totalPages}
                    </span>
                    <Button
                        variant="secondary"
                        disabled={page >= data.pagination.totalPages}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        Keyingi
                    </Button>
                </div>
            )}
        </div>
    )
}