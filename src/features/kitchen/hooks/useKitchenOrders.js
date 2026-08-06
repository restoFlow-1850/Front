// Oshxona buyurtmalari — boshlang'ich yuklash (REST) + real-time yangilanish (Socket.io).
//
// DIQQAT: Mock rejim yo'q — backend to'liq tayyor. Quyidagi eventlar tinglanadi:
//   order:created          — yangi buyurtma (umumiy)
//   kitchen:new_order      — yangi buyurtma, aynan oshxona uchun (ovozli signal SHU eventda)
//   order:status_updated   — status o'zgardi
//   order:status_changed   — status o'zgarishi uchun muqobil nom (ikkalasi ham tinglanadi)
//   table:status_updated   — stol holati o'zgardi (ehtiyot uchun ro'yxatni yangilaymiz)
//
// 'order:created' va 'kitchen:new_order' bitta buyurtma uchun ikkalasi ham kelishi mumkin —
// shuning uchun ovozli signal faqat bir marta chalinishi uchun buyurtma id'lari saqlanadi.
//
// Mas'ul: Ziyodulla.
import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from '../../../components/ui'

import { getOrders, updateOrderStatus } from '../../orders/api'
import { unwrapList, apiErrorMessage } from '../../../lib/api'
import { ORDER_STATUS } from '../../../constants/roles'
import { socket } from '../../../services/socket'
import { triggerNewOrderAlert } from '../../../utils/audioAlert'

const SOUND_PREF_KEY = 'kitchen:soundEnabled'
const ANNOUNCED_IDS_MAX = 200

function readSoundPref() {
  if (typeof window === 'undefined') return true
  const stored = window.localStorage.getItem(SOUND_PREF_KEY)
  return stored === null ? true : stored === 'true'
}

// TASDIQLANMAGAN TAXMIN: ba'zi eventlar to'g'ridan-to'g'ri buyurtma obyektini,
// ba'zilari { order: {...} } ko'rinishida yuborishi mumkin — ikkalasini ham qo'llab-quvvatlaymiz.
function extractOrder(payload) {
  if (!payload) return null
  return payload.order ?? payload
}

export function useKitchenOrders() {
  const { t, i18n } = useTranslation()
  const queryClient = useQueryClient()
  const [soundEnabled, setSoundEnabledState] = useState(readSoundPref)
  const soundEnabledRef = useRef(soundEnabled)
  const announcedIdsRef = useRef(new Set())

  useEffect(() => {
    soundEnabledRef.current = soundEnabled
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(SOUND_PREF_KEY, String(soundEnabled))
    }
  }, [soundEnabled])

  const toggleSound = useCallback(() => setSoundEnabledState((prev) => !prev), [])

  const ordersQuery = useQuery({
    queryKey: ['orders', 'kitchen'],
    queryFn: async () => unwrapList(await getOrders({ limit: 100 }), 'orders'),
    // Socket vaqtincha uzilib qolsa ham ekran eskirmasin.
    refetchInterval: 20_000,
  })

  const invalidateOrders = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    [queryClient],
  )

  const announceNewOrder = useCallback(
    (order) => {
      const id = order?._id ?? order?.id
      if (id) {
        if (announcedIdsRef.current.has(id)) return // order:created + kitchen:new_order duplikati
        announcedIdsRef.current.add(id)
        if (announcedIdsRef.current.size > ANNOUNCED_IDS_MAX) {
          const [oldest] = announcedIdsRef.current
          announcedIdsRef.current.delete(oldest)
        }
      }

      if (!soundEnabledRef.current) return
      const table = order?.table?.number ?? order?.table ?? '?'
      const message = t('kitchen.audio.newOrderAlert', { table })
      triggerNewOrderAlert(table, message, i18n.language)
    },
    [t, i18n.language],
  )

  useEffect(() => {
    const handleNewOrder = (payload) => {
      invalidateOrders()
      announceNewOrder(extractOrder(payload))
    }
    const handleStatusUpdate = () => invalidateOrders()
    const handleTableUpdate = () => invalidateOrders()

    socket.on('order:created', handleNewOrder)
    socket.on('kitchen:new_order', handleNewOrder)
    socket.on('order:status_updated', handleStatusUpdate)
    socket.on('order:status_changed', handleStatusUpdate)
    socket.on('table:status_updated', handleTableUpdate)

    return () => {
      socket.off('order:created', handleNewOrder)
      socket.off('kitchen:new_order', handleNewOrder)
      socket.off('order:status_updated', handleStatusUpdate)
      socket.off('order:status_changed', handleStatusUpdate)
      socket.off('table:status_updated', handleTableUpdate)
    }
  }, [invalidateOrders, announceNewOrder])

  const mutation = useMutation({
    mutationFn: ({ id, nextStatus }) => updateOrderStatus(id, nextStatus),
    onSuccess: (_data, { columnKey }) => {
      toast.success(t('kitchen.statusChanged', { status: t(`kitchen.columns.${columnKey}`) }))
      invalidateOrders()
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('kitchen.statusChangeFailed'))),
  })

  const setStatus = useCallback(
    (id, nextStatus, columnKey) => mutation.mutate({ id, nextStatus, columnKey }),
    [mutation],
  )

  const testSound = useCallback(() => {
    const message = t('kitchen.audio.testAlertMessage')
    triggerNewOrderAlert('—', message, i18n.language)
  }, [t, i18n.language])

  const orders = ordersQuery.data ?? []
  const columns = {
    waiting: orders.filter((o) => o.status === ORDER_STATUS.NEW),
    making: orders.filter((o) => o.status === ORDER_STATUS.IN_KITCHEN),
    complete: orders.filter((o) => o.status === ORDER_STATUS.READY),
  }

  return {
    columns,
    isLoading: ordersQuery.isLoading,
    isFetching: ordersQuery.isFetching,
    isError: ordersQuery.isError,
    error: ordersQuery.error,
    refetch: ordersQuery.refetch,
    setStatus,
    isMutating: mutation.isPending,
    soundEnabled,
    toggleSound,
    testSound,
  }
}
