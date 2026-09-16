// Oshxona ekrani (KDS) — Kutilmoqda / Tayyorlanmoqda / Tayyor ustunlari.
// Premium Orange brend dizayn sistemasi (Yorqin Oq va To'q Rejim).
import { useTranslation } from 'react-i18next'
import { RefreshCw, UtensilsCrossed, Volume2, VolumeX, Sparkles } from 'lucide-react'

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
    toggleItemReady,
    soundEnabled,
    toggleSound,
    testSound,
  } = useKitchenOrders()

  const onStartPreparing = (id) => setStatus(id, ORDER_STATUS.IN_KITCHEN, 'making')
  const onMarkReady = (id) => setStatus(id, ORDER_STATUS.READY, 'complete')

  return (
    <div className="min-h-full rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/90 shadow-2xs dark:bg-[#0B0F17] dark:border-slate-800/80 transition-colors">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] via-[#EA580C] to-[#C2410C] text-white shadow-lg shadow-orange-500/25">
              <UtensilsCrossed size={22} />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">
                <span className="bg-gradient-to-r from-slate-900 via-[#F97316] to-[#EA580C] bg-clip-text text-transparent dark:from-white dark:via-orange-300 dark:to-amber-400">
                  {t('kitchen.title')}
                </span>
              </h1>
            </div>
          </div>
        }
        subtitle={
          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Sparkles size={14} className="text-[#F97316]" />
            {t('kitchen.subtitle')}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={testSound}
              title={t('testSound')}
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {t('testSound')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={toggleSound}
              aria-pressed={soundEnabled}
              title={soundEnabled ? t('soundOn') : t('soundOff')}
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {soundEnabled ? (
                <Volume2 className="mr-2 h-4 w-4 text-[#F97316]" />
              ) : (
                <VolumeX className="mr-2 h-4 w-4 text-slate-400" />
              )}
              {soundEnabled ? t('soundOn') : t('soundOff')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => refetch()}
              className="rounded-xl border-slate-200 bg-slate-50 text-slate-700 hover:bg-orange-50 hover:text-[#F97316] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`mr-2 h-4 w-4 text-[#F97316] ${isFetching ? 'animate-spin' : ''}`} />
              {t('refresh')}
            </Button>
          </div>
        }
      />

      {isError && (
        <Card className="mb-4 border-rose-200 bg-rose-50 dark:border-rose-900/60 dark:bg-rose-950/40">
          <p className="text-sm font-semibold text-rose-600 dark:text-rose-400">
            {apiErrorMessage(error, t('kitchen.loadFailed'))}
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start w-full">
        {COLUMN_IDS.map((id) => (
          <KitchenColumn
            key={id}
            id={id}
            orders={columns[id]}
            isLoading={isLoading}
            onStartPreparing={onStartPreparing}
            onMarkReady={onMarkReady}
            onToggleItemReady={toggleItemReady}
          />
        ))}
      </div>
    </div>
  )
}
