// Buyurtma holatini kuzatish sahifasi (mehmon, QR-menyu):
//   - Buyurtma raqami va taomlar ro'yxati
//   - Holat stepper: "qabul qilindi" → "tayyorlanmoqda" → "tayyor" (jonli)
//   - Socket orqali jonli yangilanish, xatolikda polling zaxira (15 soniyada)
//   - "Ofitsiantni chaqirish" va "Hisob so'rash" (naqd/karta) tugmalari
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import {
  FiBell,
  FiCheckCircle,
  FiCreditCard,
  FiRefreshCw,
  FiShoppingBag,
  FiXCircle,
} from 'react-icons/fi'
import { ReceiptText, Wallet } from 'lucide-react'

import { callWaiterForTable, formatSum, getPublicOrderById } from '../api'
import { socket } from '../../../services/socket'
import { GuestHeader } from './SnackHeader'
import { ORDER_STATUS } from '../../../constants/roles'

// Mehmon ko'radigan holat zanjiri: qabul qilindi → tayyorlanmoqda → tayyor → berildi.
const GUEST_STEPS = [ORDER_STATUS.NEW, ORDER_STATUS.IN_KITCHEN, ORDER_STATUS.READY, ORDER_STATUS.SERVED]

function unwrapOrder(res) {
  const data = res?.data ?? res
  return data?.order ?? data
}

function orderStatusOf(order) {
  return order?.status ?? order?.orderStatus
}

export default function GuestOrderStatus({ order, tableId, tableNumber, restaurant, onNewOrder }) {
  const { t } = useTranslation()
  const [current, setCurrent] = useState(() => orderStatusOf(order))
  const [orderId] = useState(() => order?.orderId ?? order?._id ?? order?.id)
  const [orderItemList, setOrderItemList] = useState(() => order?.items ?? [])
  const [totalAmount, setTotalAmount] = useState(() => order?.totalAmount ?? 0)
  const [orderNumber, setOrderNumber] = useState(
    () => order?.orderNumber ?? order?.number,
  )
  const [phase, setPhase] = useState('live') // live | closed | cancelled
  const [calling, setCalling] = useState(null) // 'call' | 'bill_cash' | 'bill_card'
  const [socketNote, setSocketNote] = useState(false)
  const pollRef = useRef(null)

  // Statusni bitta joydan yangilovchi funksiya — socket va polling ikkalasi ishlatadi.
  const applyOrder = useCallback((fresh) => {
    const status = orderStatusOf(fresh)
    if (status) setCurrent(status)
    if (fresh?.items) setOrderItemList(fresh.items)
    if (fresh?.totalAmount != null) setTotalAmount(fresh.totalAmount)
    if (fresh?.orderNumber || fresh?.number) setOrderNumber(fresh.orderNumber ?? fresh.number)
  }, [])

  const refreshViaPoll = useCallback(async () => {
    if (!orderId) return
    try {
      const res = await getPublicOrderById(orderId)
      const fresh = unwrapOrder(res)
      if (fresh && typeof fresh === 'object') applyOrder(fresh)
    } catch {
      // Server javob bermasa polling davom etaveradi
    }
  }, [orderId, applyOrder])

  // Socket: mehmon ulanishi muvaffaqiyatli bo'lsa jonli status oladi.
  // Aks holda polling (15s) ishlaydi — sotishda hech qanday bo'shliq bo'lmaydi.
  useEffect(() => {
    const handleStatusChanged = (payload) => {
      if (!payload) return
      const changedId = payload.orderId ?? payload.order?._id ?? payload._id ?? payload?.orderId
      if (changedId && changedId !== orderId) return
      const status = payload.status ?? payload?.order?.status
      if (status) setCurrent(status)
      setSocketNote(true) // jonli socket hodisasi keldi — "Jonli kuzatuv" belgisi
      refreshViaPoll()
    }
    const handleCancelled = (payload) => {
      const changedId = payload?.orderId ?? payload?.order?._id ?? payload?._id
      if (changedId && changedId !== orderId) return
      setCurrent(ORDER_STATUS.CANCELLED)
      setSocketNote(true)
    }
    const handleReady = () => refreshViaPoll()

    if (socket && !socket.connected) {
      try {
        socket.connect()
      } catch {
        // Ulanish ixtiyoriy — polling zaxira bor
      }
    }
    socket.on('order:status_changed', handleStatusChanged)
    socket.on('order:statusChanged', handleStatusChanged) // backend alias
    socket.on('order:cancelled', handleCancelled)
    socket.on('order:ready', handleReady)

    pollRef.current = setInterval(refreshViaPoll, 15_000)

    return () => {
      socket.off('order:status_changed', handleStatusChanged)
      socket.off('order:statusChanged', handleStatusChanged)
      socket.off('order:cancelled', handleCancelled)
      socket.off('order:ready', handleReady)
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [orderId, refreshViaPoll])

  // "Qabul qilindi" → "Tayyorlanmoqda" → "Tayyor" → "Berildi"
  const stepIndex = GUEST_STEPS.indexOf(current) // -1: yopilgan/bekor yoki noma'lum
  useEffect(() => {
    if (current === ORDER_STATUS.CLOSED) {
      setPhase('closed')
    } else if (current === ORDER_STATUS.CANCELLED) {
      setPhase('cancelled')
    } else {
      setPhase('live')
    }
  }, [current])

  const handleCallWaiter = async (type) => {
    if (!tableId || calling) return
    setCalling(type)
    try {
      await callWaiterForTable(tableId, type)
      toast.success(
        type === 'call' ? t('guestOrder.waiterCalled') : t('guestOrder.billRequested'),
      )
    } catch {
      toast.error(
        type === 'call' ? t('guestOrder.waiterCallFailed') : t('guestOrder.billRequestFailed'),
      )
    } finally {
      setCalling(null)
    }
  }

  return (
    <GuestHeader restaurant={restaurant} tableNumber={tableNumber}>
      <div className="flex flex-col gap-4">
        {/* Sarlavha va buyurtma raqami */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center">
          <p className="text-4xl">🛎️</p>
          <h1 className="mt-2 text-xl font-bold text-white">{t('guestOrder.statusTitle')}</h1>
          {orderNumber && (
            <p className="mt-1 text-sm font-semibold text-slate-400">
              {t('guestOrder.orderNumber')}:{' '}
              <span className="font-black text-[#F97316]">№{orderNumber}</span>
            </p>
          )}
          {socketNote ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
              <FiCheckCircle className="h-3.5 w-3.5" /> {t('guestOrder.live')}
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-slate-500">{t('guestOrder.updating')}</p>
          )}
        </div>

        {phase === 'live' ? (
          <>
            {/* Holat stepper */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex flex-col gap-4">
                {GUEST_STEPS.map((stepStatus, idx) => {
                  const done = stepIndex >= idx
                  const isCurrent = stepStatus === current
                  return (
                    <div key={stepStatus} className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          done
                            ? 'border-[#F97316] bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-500'
                        }`}
                      >
                        {done ? (
                          <FiCheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs font-black">{idx + 1}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-[#F97316]' : done ? 'text-slate-100' : 'text-slate-500'
                          }`}
                        >
                          {t(`guestOrder.steps.${stepStatus}`)}
                        </p>
                        {isCurrent && (
                          <p className="text-[11px] font-semibold text-slate-400">
                            {t('guestOrder.currentStep')}
                          </p>
                        )}
                      </div>
                      {idx < GUEST_STEPS.length - 1 && (
                        <div className={`ml-1 h-8 w-0.5 rounded ${done ? 'bg-[#F97316]' : 'bg-slate-800'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Taomlar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
                <FiShoppingBag className="text-[#F97316]" /> {t('guestOrder.itemsTitle')}
              </h2>
              {orderItemList.length === 0 ? (
                <p className="py-4 text-center text-sm text-slate-500">{t('guestOrder.noItems')}</p>
              ) : (
                <div className="space-y-2.5">
                  {orderItemList.map((item, idx) => {
                    const name = item?.name ?? item?.product?.name ?? `#${idx + 1}`
                    const price = Number(item?.price ?? item?.product?.price ?? 0)
                    const quantity = Number(item?.quantity ?? 1)
                    return (
                      <div
                        key={item?._id ?? idx}
                        className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-950/40 px-3.5 py-2.5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-100">{name}</p>
                          {item?.note && (
                            <p className="truncate text-[11px] font-medium text-amber-300/90">
                              ✍️ {item.note}
                            </p>
                          )}
                        </div>
                        <p className="shrink-0 text-sm font-bold text-slate-200">
                          {quantity} × {formatSum(price)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3 text-sm">
                <span className="font-semibold text-slate-400">{t('guestOrder.totalAmount')}</span>
                <span className="text-lg font-black text-slate-100">{formatSum(totalAmount)}</span>
              </div>
            </div>

            {/* Ofitsiant chaqiruvi / hisob so'rash */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="mb-3 text-sm font-bold text-slate-200">{t('guestOrder.needHelp')}</h2>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => handleCallWaiter('call')}
                  disabled={calling !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiBell className="h-4 w-4" />
                  {calling === 'call' ? `${t('guestOrder.sending')}...` : t('guestOrder.callWaiter')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCallWaiter('bill_cash')}
                  disabled={calling !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4 text-amber-400" />
                  {calling === 'bill_cash' ? `${t('guestOrder.sending')}...` : t('guestOrder.billCash')}
                </button>
                <button
                  type="button"
                  onClick={() => handleCallWaiter('bill_card')}
                  disabled={calling !== null}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FiCreditCard className="h-4 w-4 text-emerald-400" />
                  {calling === 'bill_card' ? `${t('guestOrder.sending')}...` : t('guestOrder.billCard')}
                </button>
              </div>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                {t('guestOrder.helpHint')}
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            {phase === 'closed' ? (
              <>
                <ReceiptText className="h-10 w-10 text-emerald-400" />
                <h2 className="text-xl font-bold text-white">{t('guestOrder.orderClosed')}</h2>
                <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                  {t('guestOrder.orderClosedDesc')}
                </p>
              </>
            ) : (
              <>
                <FiXCircle className="h-10 w-10 text-red-400" />
                <h2 className="text-xl font-bold text-white">{t('guestOrder.orderCancelled')}</h2>
                <p className="max-w-sm text-sm leading-relaxed text-slate-400">
                  {t('guestOrder.orderCancelledDesc')}
                </p>
              </>
            )}
          </div>
        )}

        {/* Yangi buyurtma */}
        {onNewOrder && phase !== 'cancelled' && (
          <button
            type="button"
            onClick={onNewOrder}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-700"
          >
            <FiRefreshCw className="h-4 w-4" />
            {t('guestOrder.newOrder')}
          </button>
        )}
      </div>
    </GuestHeader>
  )
}