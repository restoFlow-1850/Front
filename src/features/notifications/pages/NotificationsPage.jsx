import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { RefreshCw, CheckCheck, Trash2 } from 'lucide-react'
import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  clearAllNotifications,
} from '../notificationsSlice'
import { Badge, Button, EmptyState } from '../../../components/ui'
import { FiBell } from 'react-icons/fi'

export default function NotificationsPage() {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const items = useSelector((state) => state.notifications.items)
  const loading = useSelector((state) => state.notifications.loading)
  const unreadCount = items.filter((item) => !item.read).length

  const handleRefresh = useCallback(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  const handleMarkAllRead = useCallback(() => {
    dispatch(markAllNotificationsRead())
  }, [dispatch])

  const handleClear = useCallback(() => {
    dispatch(clearAllNotifications())
  }, [dispatch])

  const handleNotificationClick = useCallback(
    (item) => {
      if (!item.read) {
        dispatch(markNotificationRead(item._id ?? item.id))
      }
    },
    [dispatch],
  )

  return (
    <div className="p-2 sm:p-4">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('notifications.title')}
          </h1>
          {unreadCount > 0 && (
            <p className="mt-1 text-xs font-semibold text-[#F97316]">
              {unreadCount} {t('notifications.unread')}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </Button>
          <Button variant="ghost" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-1.5 h-4 w-4 text-[#F97316]" />
            {t('notifications.markAllRead')}
          </Button>
          <Button variant="ghost" onClick={handleClear} className="text-red-500 hover:text-red-600">
            <Trash2 className="mr-1.5 h-4 w-4" />
            {t('notifications.clear')}
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <EmptyState
            icon={FiBell}
            title={t('notifications.emptyTitle')}
            description={t('notifications.emptyDesc')}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li
              key={item._id ?? item.id}
              onClick={() => handleNotificationClick(item)}
              className={`flex items-center justify-between rounded-2xl border p-4 transition-all duration-150 ${
                item.read
                  ? 'border-[#E5E7EB] bg-white dark:border-gray-800 dark:bg-gray-800/80'
                  : 'cursor-pointer border-orange-500/30 bg-orange-50/70 shadow-md shadow-orange-500/5 hover:bg-orange-100/70 dark:border-orange-800/60 dark:bg-orange-950/30 dark:hover:bg-orange-950/50'
              }`}
            >
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#111827] dark:text-white">
                  {item.title ?? item.message}
                </p>
                {item.message && item.title && item.title !== item.message && (
                  <p className="text-xs font-medium text-[#6B7280] dark:text-gray-300">{item.message}</p>
                )}
                <p className="text-[11px] font-medium text-gray-400">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
              {!item.read && <Badge variant="info">{t('notifications.new')}</Badge>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
