// Ofitsiant chaqiruvlari — oshxona ekranining yuqorisida ko'rinadigan
// porloq banner. Har bir chaqiruv alohida kartochka ko'rinishida chiqadi,
// vaqt o'tishi bilan rangi intensivlashadi (pulse animatsiya).
// Faqat oshxona sahifasida ishlatiladi — boshqa sahifalarga ta'sir qilmaydi.
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bell, X, BellRing } from 'lucide-react'

function useElapsedSeconds(createdAt) {
  const [seconds, setSeconds] = useState(() =>
    Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000),
  )

  useEffect(() => {
    const id = setInterval(() => {
      setSeconds(Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [createdAt])

  return seconds
}

function WaiterCallCard({ call, onDismiss }) {
  const { t } = useTranslation()
  const seconds = useElapsedSeconds(call.createdAt)
  const isUrgent = seconds >= 30

  return (
    <div
      className={`relative flex items-center gap-5 rounded-2xl border-2 px-6 py-5 shadow-lg transition-all ${
        isUrgent
          ? 'border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-950/60'
          : 'border-amber-400 bg-amber-50 dark:border-amber-600 dark:bg-amber-950/60'
      } ${isUrgent ? 'animate-pulse' : ''}`}
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
          isUrgent
            ? 'bg-red-500 text-white'
            : 'bg-amber-500 text-white'
        }`}
      >
        {isUrgent ? (
          <BellRing className="h-7 w-7 animate-bounce" />
        ) : (
          <Bell className="h-7 w-7" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p
          className={`text-base font-bold uppercase tracking-wide ${
            isUrgent
              ? 'text-red-700 dark:text-red-300'
              : 'text-amber-700 dark:text-amber-300'
          }`}
        >
          {t('kitchen.waiterCall.title')}
        </p>

        <div className="mt-1">
          <p className="text-2xl font-extrabold leading-tight text-slate-900 dark:text-white">
            {t('kitchen.table', { num: call.tableNumber })}
          </p>
        </div>

        <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
          {seconds < 1
            ? t('kitchen.justNow')
            : t('kitchen.waiterCall.elapsed', { seconds })}
        </p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(call.id)}
        className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-200/60 hover:text-slate-600 dark:hover:bg-slate-700/60 dark:hover:text-slate-300"
        aria-label={t('kitchen.waiterCall.dismiss')}
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  )
}

export default function WaiterCallBanner({ calls = [], onDismiss, onDismissAll }) {
  const { t } = useTranslation()

  if (calls.length === 0) return null

  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-bold text-amber-700 dark:text-amber-400">
          <BellRing className="h-5 w-5 animate-pulse" />
          {t('kitchen.waiterCall.bannerTitle', { count: calls.length })}
        </h3>
        {calls.length > 1 && (
          <button
            type="button"
            onClick={onDismissAll}
            className="text-sm font-medium text-slate-500 underline decoration-dashed underline-offset-2 transition-colors hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {t('kitchen.waiterCall.dismissAll')}
          </button>
        )}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {calls.map((call) => (
          <WaiterCallCard key={call.id} call={call} onDismiss={onDismiss} />
        ))}
      </div>
    </div>
  )
}
