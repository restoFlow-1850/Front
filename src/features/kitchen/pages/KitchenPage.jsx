// Oshxona ekrani (KDS) — Kutilmoqda / Tayyorlanmoqda / Tayyor ustunlari.
// Oshpaz "Tayyorlashni boshlash" / "Tayyor" tugmalari orqali holatni suradi.
// Yangi buyurtma kelganda ovozli signal (chime + ovozli xabar) beriladi — sound
// toggle holati localStorage'da saqlanadi. Mock rejim yo'q — backend to'liq ulangan.
import { useTranslation } from 'react-i18next'
import { RefreshCw, Volume2, VolumeX } from 'lucide-react'

import { ORDER_STATUS } from '../../../constants/roles'
import { Button, Card, PageHeader } from '../../../components/ui'
import { apiErrorMessage } from '../../../lib/api'
import { useKitchenOrders } from '../hooks/useKitchenOrders'
import KitchenColumn from '../components/KitchenColumn'
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
    soundEnabled,
    toggleSound,
    testSound,
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

      <div className="flex items-start gap-4 overflow-x-auto pb-2 lg:grid lg:grid-cols-3 lg:items-start lg:overflow-visible">
        {COLUMN_IDS.map((id) => (
          <KitchenColumn
            key={id}
            id={id}
            orders={columns[id]}
            isLoading={isLoading}
            onStartPreparing={onStartPreparing}
            onMarkReady={onMarkReady}
          />
        ))}
      </div>
    </div>
  )
}
