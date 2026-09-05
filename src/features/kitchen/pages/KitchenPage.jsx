// Oshxona ekrani (KDS) — Kutilmoqda / Tayyorlanmoqda / Tayyor ustunlari.
// Oshpaz "Tayyorlashni boshlash" / "Tayyor" tugmalari orqali holatni suradi.
// Yangi buyurtma kelganda ovozli signal (chime + ovozli xabar) beriladi — sound
// toggle holati localStorage'da saqlanadi. Mock rejim yo'q — backend to'liq ulangan.
import { useTranslation } from 'react-i18next'
import { Bell, RefreshCw, Volume2, VolumeX } from 'lucide-react'

import { ORDER_STATUS } from '../../../constants/roles'
import { Button, Card, PageHeader } from '../../../components/ui'
import { apiErrorMessage } from '../../../lib/api'
import { useKitchenOrders } from '../hooks/useKitchenOrders'
import KitchenColumn from '../components/KitchenColumn'
import WaiterCallBanner from '../components/WaiterCallBanner'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'

const COLUMN_IDS = ['waiting', 'making', 'complete']

export default function KitchenPage() {
  const { t } = useTranslation()
  const {
    columns,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    setStatus,
    removeOrder,
    isDeleting,
    soundEnabled,
    toggleSound,
    testSound,
    waiterCalls,
    dismissWaiterCall,
    dismissAllWaiterCalls,
    unseenCount,
    acknowledgeNewOrders,
  } = useKitchenOrders()

  const onStartPreparing = (id) => setStatus(id, ORDER_STATUS.IN_KITCHEN, 'making')
  const onMarkReady = (id) => setStatus(id, ORDER_STATUS.READY, 'complete')

  return (
    <div>
      <PageHeader
        title={t('kitchen.title')}
        subtitle={t('kitchen.subtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Qizil bildirishnoma belgisi — yangi buyurtma kelganda ko'rinadi,
                bosilganda tozalanadi. */}
            <button
              type="button"
              onClick={acknowledgeNewOrders}
              title={t('newOrdersBadge', { count: unseenCount })}
              className="relative rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Bell className="h-4 w-4" />
              {unseenCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 animate-pulse items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                  {unseenCount > 9 ? '9+' : unseenCount}
                </span>
              )}
            </button>

            <Button type="button" variant="secondary" onClick={testSound} title={t('testSound')}>
              {t('testSound')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              title={soundEnabled ? t('soundOn') : t('soundOff')}
            >
              {soundEnabled ? (
                <Volume2 className="mr-2 h-4 w-4" />
              ) : (
                <VolumeX className="mr-2 h-4 w-4" />
              )}
              {soundEnabled ? t('soundOn') : t('soundOff')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => refetch()}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
            <LanguageSwitcher />
          </div>
        }
      />

      {isError && (
        <Card className="mb-4">
          <p className="text-sm text-rose-600">{apiErrorMessage(error, t('kitchen.loadFailed'))}</p>
        </Card>
      )}

      <WaiterCallBanner
        calls={waiterCalls}
        onDismiss={dismissWaiterCall}
        onDismissAll={dismissAllWaiterCalls}
      />

      <div className="flex items-start gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:items-start lg:overflow-visible">
        {COLUMN_IDS.map((id) => (
          <KitchenColumn
            key={id}
            id={id}
            orders={columns[id]}
            isLoading={isLoading}
            onStartPreparing={onStartPreparing}
            onMarkReady={onMarkReady}
            onDelete={removeOrder}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  )
}
