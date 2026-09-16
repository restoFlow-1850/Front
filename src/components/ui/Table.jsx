export default function Table({ columns, data, isLoading, emptyMessage = 'Ma\'lumot topilmadi' }) {
    if (isLoading) {
        return <p className="py-6 text-center text-gray-500 dark:text-gray-400">Yuklanmoqda...</p>
    }

    if (!data || data.length === 0) {
        return <p className="py-6 text-center text-gray-500 dark:text-gray-400">{emptyMessage}</p>
    }

    return (
        <div className="overflow-x-auto rounded-md border border-gray-200 dark:border-gray-700">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className="px-4 py-2 font-semibold text-gray-700 dark:text-gray-200">
                                {col.title}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, i) => (
                        <tr
                            key={row.id ?? row._id ?? i}
                            className="border-t border-gray-200 dark:border-gray-700"
                        >
                            {columns.map((col) => (
                                <td key={col.key} className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                    {col.render ? col.render(row) : row[col.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}