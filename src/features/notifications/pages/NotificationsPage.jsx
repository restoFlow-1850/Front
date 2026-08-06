import { useDispatch, useSelector } from 'react-redux'
import { markAllRead, clearNotifications } from '../notificationsSlice'
import { Badge, EmptyState } from '../../../components/ui'
import { FiBell } from 'react-icons/fi'

export default function NotificationsPage() {
    const dispatch = useDispatch()
    const items = useSelector((state) => state.notifications.items)
    const unreadCount = items.filter((item) => !item.read).length

    return (
        <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
                <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">Bildirishnomalar</h1>
                    {unreadCount > 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{unreadCount} ta o'qilmagan</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => dispatch(markAllRead())}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Hammasini o'qilgan qilish
                    </button>
                    <button
                        type="button"
                        onClick={() => dispatch(clearNotifications())}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Tozalash
                    </button>
                </div>
            </div>

            {items.length === 0 ? (
                <div className="rounded-lg bg-white shadow dark:bg-gray-800">
                    <EmptyState
                        icon={FiBell}
                        title="Hozircha bildirishnoma yo'q"
                        description="Yangi buyurtma tayyor bo'lganda shu yerda ko'rinadi."
                    />
                </div>
            ) : (
                <ul className="space-y-2">
                    {items.map((item) => (
                        <li
                            key={item.id}
                            className={`flex items-center justify-between rounded-lg border px-4 py-3 dark:border-gray-700 ${item.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-950/30'
                                }`}
                        >
                            <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{item.message}</p>
                                <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</p>
                            </div>
                            {!item.read && <Badge variant="info">Yangi</Badge>}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
