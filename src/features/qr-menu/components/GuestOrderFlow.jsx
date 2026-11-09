// Mehmon buyurtma oqimi (QR-menyu): stolni tekshirish → menyu → savat →
// buyurtma berish → holat kuzatish.
//
// Bu fayl mehmonning to'liq yo'lini boshqaradi:
//   - Stolni o'qiydi va statusini tekshiradi (band / topilmadi / restoran yopiq)
//   - Sessiyadagi oldingi buyurtma bo'lsa — darhol status sahifasiga qaytadi
//   - Aks holda menyu → savat → buyurtma berish oqimini ochadi
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getTableById, getPublicOrderById } from '../api'
import GuestOrderMenu from './GuestOrderMenu'
import GuestOrderStatus from './GuestOrderStatus'
import GuestBlockedView from './GuestBlockedView'
import { GuestHeader } from './SnackHeader'

const STORAGE_PREFIX = 'restoflow.guestOrder.'

function readStoredOrder(tableId) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + tableId)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredOrder(tableId, order) {
  try {
    if (order?.orderId) sessionStorage.setItem(STORAGE_PREFIX + tableId, JSON.stringify(order))
  } catch {
    // Saqlash imkonsiz bo'lsa ham oqim davom etaveradi
  }
}

export default function GuestOrderFlow({ tableId }) {
  const { t } = useTranslation()
  const [attempt, setAttempt] = useState(0)
  const [phase, setPhase] = useState('loading') // loading | blocked | menu | status
  const [table, setTable] = useState(null)
  const [restaurant, setRestaurant] = useState(null)
  const [blockReason, setBlockReason] = useState('not_found') // not_found | busy | closed
  const [loadError, setLoadError] = useState(null)
  const [order, setOrder] = useState(() => tableId && readStoredOrder(tableId))
  const seqRef = useRef(0)

  const resolveRestaurantId = (tableValue) => {
    const rest = tableValue?.restaurant
    if (!rest) return null
    return typeof rest === 'object' ? rest._id ?? rest.id : rest
  }

  const verifyStoredOrder = useCallback(async (stored) => {
    if (!stored?.orderId) return false
    try {
      const res = await getPublicOrderById(stored.orderId)
      const fresh = res.data?.data?.order ?? res.data?.order ?? res.data?.data ?? res.data
      if (fresh && typeof fresh === 'object') {
        setOrder((prev) => ({ ...(prev || {}), ...fresh }))
        return true
      }
    } catch {
      // Serverda public order o'qilmayapti — sessiyadagi qiymat bilan davom
    }
    return !!stored.orderId
  }, [])

  useEffect(() => {
    if (!tableId) {
      setBlockReason('not_found')
      setPhase('blocked')
      return
    }

    const seq = ++seqRef.current
    let cancelled = false

    async function bootstrap() {
      setPhase('loading')
      setLoadError(null)
      try {
        const res = await getTableById(tableId)
        if (cancelled || seq !== seqRef.current) return
        const tableValue = res.data?.data?.table ?? res.data?.data ?? res.data
        if (!tableValue?._id) throw new Error('table_not_found')

        setTable(tableValue)
        const restId = resolveRestaurantId(tableValue)
        let restaurantValue = null
        if (restId) {
          try {
            const restRes = await (await import('../api')).getRestaurantById(restId)
            restaurantValue = restRes.data?.data?.restaurant ?? restRes.data?.data ?? restRes.data
          } catch {
            // Restoran ma'lumoti yo'q — menyu public ochiladi
          }
        }
        if (cancelled || seq !== seqRef.current) return
        setRestaurant(restaurantValue)

        // Yopiq restoran — stol statusidan qat'i nazar to'g'ri xabar.
        const closed =
          restaurantValue &&
          (restaurantValue.isActive === false || restaurantValue.isOpen === false)
        if (closed) {
          setBlockReason('closed')
          setPhase('blocked')
          return
        }

        // Sessiyadagi oldingi buyurtma — avval istalgan holatda unga qaytamiz.
        const stored = order || readStoredOrder(tableId)
        if (stored?.orderId) {
          const ok = await verifyStoredOrder(stored)
          if (cancelled || seq !== seqRef.current) return
          if (ok) {
            setPhase('status')
            return
          }
        }

        // Stol band bo'lsa — to'g'ri xabar, lekin menyuni ko'rish mumkinligicha qoladi.
        const freeStatuses = ['available', 'free']
        if (!freeStatuses.includes(String(tableValue.status || '').toLowerCase())) {
          setBlockReason('busy')
          setPhase('blocked')
          return
        }

        setPhase('menu')
      } catch (err) {
        if (cancelled || seq !== seqRef.current) return
        setLoadError(err?.response?.data?.message || err?.message || null)
        setBlockReason('not_found')
        setPhase('blocked')
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId, attempt])

  const handleRetry = useCallback(() => {
    setAttempt((n) => n + 1)
  }, [])

  const handleOrderPlaced = useCallback(
    (createdOrder, createdOrderId, orderNumber) => {
      const savedOrderId = createdOrderId || createdOrder?._id || createdOrder?.id
      setOrder((prev) => ({
        ...(prev || {}),
        ...(createdOrder && typeof createdOrder === 'object' ? createdOrder : {}),
        orderId: savedOrderId,
        orderNumber: orderNumber || createdOrder?.orderNumber || createdOrder?.number,
        tableId,
      }))
      writeStoredOrder(tableId, {
        orderId: savedOrderId,
        orderNumber: orderNumber || createdOrder?.orderNumber || createdOrder?.number,
        tableId,
      })
      setPhase('status')
    },
    [tableId]
  )

  const handleNewOrder = useCallback(() => {
    try {
      sessionStorage.removeItem(STORAGE_PREFIX + tableId)
    } catch {
      // bo'sh
    }
    setOrder(null)
    setPhase('menu')
  }, [tableId])

  const tableNumber = table?.number ?? table?.tableNumber

  if (phase === 'blocked') {
    return (
      <GuestHeader restaurant={restaurant} tableNumber={tableNumber}>
        <GuestBlockedView
          reason={blockReason}
          tableNumber={tableNumber}
          tableId={tableId}
          error={loadError}
          onRetry={handleRetry}
          onContinue={() => setPhase('menu')}
        />
      </GuestHeader>
    )
  }

  if (phase === 'menu') {
    return (
      <GuestOrderMenu
        tableId={tableId}
        tableNumber={tableNumber}
        restaurant={restaurant}
        onOrderPlaced={handleOrderPlaced}
      />
    )
  }

  if (phase === 'status') {
    return (
      <GuestOrderStatus
        order={order}
        tableId={tableId}
        tableNumber={tableNumber}
        restaurant={restaurant}
        onNewOrder={handleNewOrder}
      />
    )
  }

  return (
    <GuestHeader restaurant={restaurant}>
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
        <p className="text-sm font-medium text-slate-400">{t('guestOrder.loading')}</p>
      </div>
    </GuestHeader>
  )
}