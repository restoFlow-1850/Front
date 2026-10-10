// Stol bilan bog'liq bloklangan holatlar uchun yagona ekran:
//   - not_found — QR kodi noto'g'ri yoki stol topilmadi
//   - busy      — stol hozir band / tozalanmoqda / bron qilingan
//   - closed    — restoran hozir yopiq
// Har bir holat uchun to'g'ri xabar ko'rsatiladi; band holatida ofitsiant
// chaqirish va menyuni ko'rishni davom ettirish imkoniyati qoladi.
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { FiAlertTriangle, FiBell, FiClock, FiMapPin, FiRefreshCw, FiTable } from 'react-icons/fi'

import { callWaiterForTable } from '../api'

export default function GuestBlockedView({ reason = 'not_found', tableNumber, tableId, error, onRetry, onContinue }) {
  const { t } = useTranslation()
  const [calling, setCalling] = useState(false)

  const config = {
    not_found: {
      icon: <FiMapPin className="h-7 w-7 text-red-400" />,
      title: t('guestOrder.tableNotFound'),
      desc: t('guestOrder.tableNotFoundDesc'),
      badge: t('guestOrder.sorry'),
      retry: true,
    },
    busy: {
      icon: <FiTable className="h-7 w-7 text-amber-400" />,
      title: t('guestOrder.tableBusy'),
      desc: t('guestOrder.tableBusyDesc', { table: tableNumber ?? '?' }),
      badge: t('guestOrder.tableBusyBadge'),
      waiter: true,
      continue: true,
    },
    closed: {
      icon: <FiClock className="h-7 w-7 text-sky-400" />,
      title: t('guestOrder.restaurantClosed'),
      desc: t('guestOrder.restaurantClosedDesc'),
      badge: t('guestOrder.restaurantClosedBadge'),
      retry: true,
    },
  }

  const c = config[reason] || config.not_found
  const shownError = error && reason === 'not_found' ? error : null

  const handleCallWaiter = async () => {
    if (!tableId) return
    setCalling(true)
    try {
      await callWaiterForTable(tableId, 'call')
      toast.success(t('guestOrder.waiterCalled'))
    } catch {
      toast.error(t('guestOrder.waiterCallFailed'))
    } finally {
      setCalling(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-xl">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
        {c.icon}
      </div>

      {c.badge && (
        <div className="mt-4 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-400">
            <FiAlertTriangle className="h-3.5 w-3.5" />
            {c.badge}
          </span>
        </div>
      )}

      <h2 className="mt-3 text-xl font-bold text-white">{c.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-400">{c.desc}</p>

      {shownError && <p className="mt-3 text-xs break-words text-slate-500">{shownError}</p>}

      <div className="mt-7 flex flex-col gap-2.5">
        {c.waiter && (
          <button
            type="button"
            onClick={handleCallWaiter}
            disabled={calling || !tableId}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiBell className="h-4 w-4" />
            {calling ? `${t('guestOrder.sending')}...` : t('guestOrder.callWaiter')}
          </button>
        )}

        {c.continue && onContinue && (
          <button
            type="button"
            onClick={onContinue}
            className="w-full rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            {t('guestOrder.viewMenuAnyway')}
          </button>
        )}

        {c.retry && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t('guestOrder.retry')}
          </button>
        )}
      </div>
    </div>
  )
}