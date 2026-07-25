// Oshxona paneli — buyurtmalar Kutilmoqda → Tayyorlanmoqda → Tayyor.
// Socket.io orqali real-time yangilanadi; backend ulanmagan bo'lsa demo rejimda ishlaydi.
// Mas'ul: Ziyodulla.
import { useTranslation } from 'react-i18next'
import { Radio, WifiOff, FlaskConical } from 'lucide-react'
import { useKitchenOrders } from '../hooks/useKitchenOrders'
import KitchenColumn from '../components/KitchenColumn'
import { ORDER_STATUS } from '../../../constants/roles'

const CONNECTION_META = {
  live: { icon: Radio, className: 'text-leaf', labelKey: 'kitchen.connectionLive' },
  connecting: { icon: Radio, className: 'text-slate', labelKey: 'kitchen.connectionLive' },
  offline: { icon: WifiOff, className: 'text-cherry', labelKey: 'kitchen.connectionOffline' },
  demo: { icon: FlaskConical, className: 'text-amber', labelKey: 'kitchen.connectionDemo' },
}

export default function KitchenPage() {
  const { t } = useTranslation()
  const { columns, connection, setStatus } = useKitchenOrders()
  const meta = CONNECTION_META[connection] ?? CONNECTION_META.connecting
  const ConnIcon = meta.icon

  const onStartPreparing = (id) => setStatus(id, ORDER_STATUS.IN_KITCHEN)
  const onMarkReady = (id) => setStatus(id, ORDER_STATUS.READY)

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl text-charcoal dark:text-fog">
            {t('kitchen.title')}
          </h2>
          <p className="text-sm text-slate">{t('kitchen.subtitle')}</p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full bg-black/5 px-3 py-1.5 text-xs font-medium dark:bg-white/10 ${meta.className}`}>
          <ConnIcon size={14} />
          {t(meta.labelKey)}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible">
        <KitchenColumn
          id="pending"
          orders={columns.pending}
          onStartPreparing={onStartPreparing}
          onMarkReady={onMarkReady}
        />
        <KitchenColumn
          id="preparing"
          orders={columns.preparing}
          onStartPreparing={onStartPreparing}
          onMarkReady={onMarkReady}
        />
        <KitchenColumn
          id="ready"
          orders={columns.ready}
          onStartPreparing={onStartPreparing}
          onMarkReady={onMarkReady}
        />
      </div>
    </div>
  )
}
