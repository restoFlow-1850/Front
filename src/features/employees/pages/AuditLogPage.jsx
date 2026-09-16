import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getAuditLogs } from '../auditApi'
import { Table, Input, Button } from '../../../components/ui'

function formatDateTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default function AuditLogPage() {
    const [action, setAction] = useState('')
    const [entity, setEntity] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [page, setPage] = useState(1)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['audit', page, action, entity, startDate, endDate],
        queryFn: async () => {
            const res = await getAuditLogs({
                page,
                limit: 20,
                action: action || undefined,
                entity: entity || undefined,
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            })
            const payload = res.data?.data ?? res.data
            return {
                items: payload?.logs ?? [],
                pagination: res.data?.pagination ?? null,
            }
        },
    })

    const columns = [
        {
            key: 'user',
            title: 'Foydalanuvchi',
            render: (row) => row.user?.name ?? row.user?.email ?? row.user ?? '—',
        },
        { key: 'action', title: 'Amal', render: (row) => row.action ?? '—' },
        { key: 'entity', title: 'Obyekt', render: (row) => row.entity ?? '—' },
        {
            key: 'createdAt',
            title: 'Vaqt',
            render: (row) => formatDateTime(row.createdAt ?? row.date),
        },
    ]

    return (
        <div className="p-4">
            <h1 className="mb-4 text-xl font-bold">Audit jurnali</h1>

            <div className="mb-4 flex flex-wrap gap-3">
                <Input
                    placeholder="Amal (masalan ORDER_CREATED)"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                />
                <Input
                    placeholder="Obyekt (masalan Order, Table)"
                    value={entity}
                    onChange={(e) => setEntity(e.target.value)}
                />
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-md border px-3 py-2 text-sm dark:bg-gray-700 dark:text-white"
                />
            </div>

            {isError ? (
                <p className="text-red-500">Audit jurnalini yuklashda xatolik yuz berdi</p>
            ) : (
                <Table
                    columns={columns}
                    data={data?.items ?? []}
                    isLoading={isLoading}
                    emptyMessage="Audit yozuvlari topilmadi"
                />
            )}

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