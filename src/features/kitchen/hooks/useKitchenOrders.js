import { useCallback, useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from '../../../components/ui'

import { fetchKitchenOrders, updateOrderStatus, updateOrderItemStatus } from '../api'
import { apiErrorMessage } from '../../../lib/api'
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
    queryFn: async () => fetchKitchenOrders(),
    // Real-time yangilanish Socket orqali keladi, polling faqat favqulodda zaxira (2 daqiqa).
    refetchInterval: 120_000,
  })

  const invalidateOrders = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    [queryClient],
  )

  const announceNewOrder = useCallback(
    (order) => {
      const id = order?._id ?? order?.id ?? order?.orderId
      if (id) {
        if (announcedIdsRef.current.has(id)) return
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
    const handleItemUpdate = (payload) => {
      const { orderId, itemId, item, items, isReady } = payload || {}
      if (orderId) {
        queryClient.setQueryData(['orders', 'kitchen'], (oldOrders) => {
          if (!Array.isArray(oldOrders)) return oldOrders
          return oldOrders.map((ord) => {
            const ordId = ord._id ?? ord.id
            if (ordId !== orderId) return ord
            const updatedItems = (ord.items || []).map((it, idx) => {
              const itId = it._id ?? it.id ?? String(idx)
              const matches = itId === itemId || idx === itemId || idx === Number(itemId)
              if (matches) {
                return { ...it, isReady: item?.isReady ?? isReady ?? true }
              }
              return it
            })
            return { ...ord, items: items || updatedItems }
          })
        })
      }
      invalidateOrders()
    }

    socket.on('order:new', handleNewOrder)
    socket.on('order:created', handleNewOrder)
    socket.on('kitchen:new_order', handleNewOrder)
    socket.on('order:status_updated', handleStatusUpdate)
    socket.on('order:status_changed', handleStatusUpdate)
    socket.on('order:statusChanged', handleStatusUpdate)
    socket.on('table:status_updated', handleTableUpdate)
    socket.on('order:item_updated', handleItemUpdate)
    socket.on('order:itemUpdated', handleItemUpdate)
    socket.on('order:itemStatusChanged', handleItemUpdate)

    return () => {
      socket.off('order:new', handleNewOrder)
      socket.off('order:created', handleNewOrder)
      socket.off('kitchen:new_order', handleNewOrder)
      socket.off('order:status_updated', handleStatusUpdate)
      socket.off('order:status_changed', handleStatusUpdate)
      socket.off('order:statusChanged', handleStatusUpdate)
      socket.off('table:status_updated', handleTableUpdate)
      socket.off('order:item_updated', handleItemUpdate)
      socket.off('order:itemUpdated', handleItemUpdate)
      socket.off('order:itemStatusChanged', handleItemUpdate)
    }
  }, [invalidateOrders, announceNewOrder, queryClient])

  // Buyurtma statusini yangilash (Optimistik + Rollback)
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => updateOrderStatus(id, nextStatus),
    onMutate: async ({ id, nextStatus, columnKey }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', 'kitchen'] })
      const previousOrders = queryClient.getQueryData(['orders', 'kitchen'])

      queryClient.setQueryData(['orders', 'kitchen'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((ord) => {
          const ordId = ord._id ?? ord.id
          return ordId === id ? { ...ord, status: nextStatus } : ord
        })
      })

      return { previousOrders, columnKey }
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders', 'kitchen'], context.previousOrders)
      }
      toast.error(apiErrorMessage(error, t('kitchen.statusChangeFailed')))
    },
    onSuccess: (_data, { columnKey }) => {
      toast.success(t('kitchen.statusChanged', { status: t(`kitchen.columns.${columnKey}`) }))
    },
    onSettled: () => {
      invalidateOrders()
    },
  })

  // Taomni alohida belgilash / check-off (Optimistik + Rollback + Socket sync)
  const itemReadyMutation = useMutation({
    mutationFn: ({ orderId, itemIndexOrId, targetIsReady }) =>
      updateOrderItemStatus(orderId, itemIndexOrId, targetIsReady),
    onMutate: async ({ orderId, itemIndexOrId, targetIsReady }) => {
      await queryClient.cancelQueries({ queryKey: ['orders', 'kitchen'] })
      const previousOrders = queryClient.getQueryData(['orders', 'kitchen'])

      queryClient.setQueryData(['orders', 'kitchen'], (old) => {
        if (!Array.isArray(old)) return old
        return old.map((ord) => {
          const ordId = ord._id ?? ord.id
          if (ordId !== orderId) return ord
          const updatedItems = (ord.items || []).map((it, idx) => {
            const itId = it._id ?? it.id ?? String(idx)
            const matches = itId === itemIndexOrId || idx === itemIndexOrId || idx === Number(itemIndexOrId)
            return matches ? { ...it, isReady: targetIsReady } : it
          })
          return { ...ord, items: updatedItems }
        })
      })

      try {
        socket.emit('order:updateItemStatus', {
          orderId,
          itemId: itemIndexOrId,
          isReady: targetIsReady,
        })
        socket.emit('order:item_updated', {
          orderId,
          itemId: itemIndexOrId,
          isReady: targetIsReady,
        })
      } catch {}

      return { previousOrders }
    },
    onError: (error, _variables, context) => {
      if (context?.previousOrders) {
        queryClient.setQueryData(['orders', 'kitchen'], context.previousOrders)
      }
      toast.error(apiErrorMessage(error, "Taom holatini saqlashda xatolik yuz berdi"))
    },
    onSettled: () => {
      invalidateOrders()
    },
  })

  const setStatus = useCallback(
    (id, nextStatus, columnKey) => statusMutation.mutate({ id, nextStatus, columnKey }),
    [statusMutation],
  )

  const toggleItemReady = useCallback(
    (orderId, itemIndexOrId, targetIsReady) =>
      itemReadyMutation.mutate({ orderId, itemIndexOrId, targetIsReady }),
    [itemReadyMutation],
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
    toggleItemReady,
    isMutating: statusMutation.isPending || itemReadyMutation.isPending,
    soundEnabled,
    toggleSound,
    testSound,
  }
}
