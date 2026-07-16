import { useQuery } from '@tanstack/react-query'
import { getTables } from '../../api/tablesApi'
import { Skeleton } from '../../components/ui'

const statusStyles = {
    available: 'bg-green-100 border-green-400 text-green-800',
    occupied: 'bg-red-100 border-red-400 text-red-800',
    reserved: 'bg-yellow-100 border-yellow-400 text-yellow-800',
}

const statusLabels = {
    available: "Bo'sh",
    occupied: 'Band',
    reserved: 'Bron qilingan',
}

export default function TablesPage() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ['tables'],
        queryFn: async () => {
            const res = await getTables()
            return res.data.tables ?? []
        },
    })

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                ))}
            </div>
        )
    }

    if (isError) {
        return <p className="p-4 text-red-500">Stollarni yuklashda xatolik yuz berdi</p>
    }

    if (data.length === 0) {
        return <p className="p-4 text-gray-500 dark:text-gray-400">Hozircha stollar mavjud emas</p>
    }

    return (
        <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4">
            {data.map((table) => (
                <div
                    key={table._id}
                    className={`flex h-28 flex-col items-center justify-center gap-1 rounded-lg border-2 font-semibold ${statusStyles[table.status] ?? 'bg-gray-100 border-gray-300 text-gray-800'
                        }`}
                >
                    <span className="text-lg">Stol {table.number}</span>
                    <span className="text-xs">{table.capacity} kishilik</span>
                    <span className="text-xs">{statusLabels[table.status] ?? table.status}</span>
                    {table.location && (
                        <span className="text-[10px] text-gray-500">{table.location}</span>
                    )}
                </div>
            ))}
        </div>
    )
}