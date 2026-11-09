// Ofitsiant ekranida mehmon so'rovlari (chaqiruv / hisob) banneri.
// Mehmon QR-menyudan POST /tables/:id/call-waiter yuborganda backend
// `table:waiter_called` socket event'ini chiqaradi — shu oqimga ulanamiz.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BellRing, Wallet, X } from 'lucide-react'
import { socket } from '../../../services/socket'

const REQUESTS_MAX = 10

export default function WaiterRequestsBanner() {
  const { t } = useTranslation()
  const [requests, setRequests] = useState([])

  useEffect(() => {
    const handleWaiterCalled = (payload) => {
      const rawTable = payload?.table ?? payload?.tableId ?? payload
      const tableNumber = typeof rawTable === 'object' ? rawTable?.number ?? rawTable?._id : rawTable
      const type = payload?.type ?? payload?.requestType ?? 'call'
      const entry = {
        id: `req-${tableNumber ?? '?'}-${type}-${Date.now()}`,
        tableNumber: tableNumber ?? '?',
        type,
        createdAt: new Date().toISOString(),
      }
      setRequests((prev) => [entry, ...prev].slice(0, REQUESTS_MAX))
    }

    const handleNotificationNew = (payload) => {
      const type = payload?.type
      if (type !== 'call_waiter' && type !== 'waiter_call' && type !== 'table:waiter_called') return
      const tableNumber = payload?.tableNumber ?? payload?.table ?? '?'
      const entry = {
        id: `notif-${Date.now()}`,
        tableNumber,
        type: 'call',
        createdAt: new Date().toISOString(),
      }
      setRequests((prev) => [entry, ...prev].slice(0, REQUESTS_MAX))
    }

    if (socket && !socket.connected) {
      try {
        socket.connect()
      } catch {
        // Ulanish ixtiyoriy
      }
    }
    socket.on('table:waiter_called', handleWaiterCalled)
    socket.on('notification:new', handleNotificationNew)

    return () => {
      socket.off('table:waiter_called', handleWaiterCalled)
      socket.off('notification:new', handleNotificationNew)
    }
  }, [])

  if (requests.length === 0) return null

  const dismiss = (id) => setRequests((prev) => prev.filter((r) => r.id !== id))
  const dismissAll = () => setRequests([])

  return (
    <div className="mb-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
          <BellRing className="h-5 w-5 animate-pulse" />
          {t('waiter.requests.bannerTitle', { count: requests.length })}
        </h3>
        {requests.length > 1 && (
          <button
            type="button"
            onClick={dismissAll}
            className="text-sm font-medium text-slate-500 underline decoration-dashed underline-offset-2 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t('waiter.requests.dismissAll')}
          </button>
        )}
      </div>
      <div className="grid gap-2.5">
        {requests.map((req) => {
          const isBill = req.type === 'bill_cash' || req.type === 'bill_card'
          return (
            <div
              key={req.id}
              className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 shadow-sm ${
                isBill
                  ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-600/70 dark:bg-emerald-950/50'
                  : 'border-amber-400 bg-amber-50 dark:border-amber-600/70 dark:bg-amber-950/50'
              }`}
            >
              <div
                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                  isBill ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                }`}
              >
                {isBill ? <Wallet className="h-5 w-5" /> : <BellRing className="h-5 w-5 animate-bounce" />}
              </div>
              <p className="min-w-0 flex-1 text-sm font-bold text-slate-800 dark:text-slate-100">
                {req.type === 'bill_cash' && t('waiter.requests.bill_cash', { table: req.tableNumber })}
                {req.type === 'bill_card' && t('waiter.requests.bill_card', { table: req.tableNumber })}
                {req.type !== 'bill_cash' && req.type !== 'bill_card' && t('waiter.requests.call', { table: req.tableNumber })}
              </p>
              <button
                type="button"
                onClick={() => dismiss(req.id)}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/40 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-300"
                aria-label={t('waiter.requests.dismiss')}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}