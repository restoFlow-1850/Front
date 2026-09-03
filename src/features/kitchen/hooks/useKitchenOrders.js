import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { socket, connectSocket } from '../../../services/socket'
import {
  fetchKitchenOrders,
  updateOrderStatus,
  updateOrderItemStatus,
  normalizeKitchenOrder,
} from '../api'
import { ORDER_STATUS } from '../../../constants/roles'
import { playNotificationSound } from '../../../utils/sound'

const BOARD_STATUSES = [ORDER_STATUS.NEW, ORDER_STATUS.IN_KITCHEN, ORDER_STATUS.READY]

export function useKitchenOrders() {
  const [orders, setOrders] = useState([])
  const [connection, setConnection] = useState('connecting') // connecting | live | offline

  const reloadOrders = useCallback(async () => {
    try {
      const data = await fetchKitchenOrders()
      setOrders(data.filter((o) => BOARD_STATUSES.includes(o.status)))
    } catch (err) {
      console.warn('Failed to fetch kitchen orders:', err)
    }
  }, [])

  const upsertOrder = useCallback((incoming) => {
    const normalized = normalizeKitchenOrder(incoming)
    if (!normalized) return
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === normalized.id)
      if (!BOARD_STATUSES.includes(normalized.status)) {
        return prev.filter((o) => o.id !== normalized.id)
      }
      if (!exists) return [normalized, ...prev]
      return prev.map((o) => (o.id === normalized.id ? { ...o, ...normalized } : o))
    })
  }, [])

  // Socket: Har bir taom holati o'zgarganda Real-time yangilash (Multi-cook sync)
  const handleItemUpdated = useCallback(
    (data) => {
      if (!data) return
      // To'liq order ob'ekti kelgan bo'lsa
      if (data.order && data.order.id) {
        upsertOrder(data.order)
        return
      }
      const targetOrderId = data.orderId || data.id
      const targetItemKey = data.itemId ?? data.itemIndex ?? data.itemIndexOrId

      if (targetOrderId && targetItemKey !== undefined) {
        setOrders((prev) =>
          prev.map((o) => {
            if (o.id !== targetOrderId) return o
            const updatedItems = o.items.map((item, idx) => {
              const matches =
                item.id === targetItemKey ||
                idx === targetItemKey ||
                idx === Number(targetItemKey)
              return matches
                ? { ...item, isReady: data.isReady !== undefined ? Boolean(data.isReady) : !item.isReady }
                : item
            })
            return { ...o, items: updatedItems }
          }),
        )
      } else if (targetOrderId) {
        reloadOrders()
      }
    },
    [upsertOrder, reloadOrders],
  )

  // Boshlang'ich yuklash (Status filtri bilan)
  useEffect(() => {
    let cancelled = false

    fetchKitchenOrders()
      .then((data) => {
        if (cancelled) return
        setOrders(data.filter((o) => BOARD_STATUSES.includes(o.status)))
        setConnection('live')
      })
      .catch(() => {
        if (cancelled) return
        setConnection('offline')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Zaxira polling kanali: 2 daqiqada (120,000 ms) bir marta ma'lumotlarni fonga chaqiradi
  useEffect(() => {
    const intervalId = setInterval(() => {
      reloadOrders()
    }, 120000)
    return () => clearInterval(intervalId)
  }, [reloadOrders])

  // Socket.io real-time ulanish
  useEffect(() => {
    const token = window.localStorage.getItem('accessToken')
    connectSocket(token)

    const handleConnect = () => setConnection('live')
    const handleDisconnect = () => setConnection('offline')
    const handleNewOrder = (order) => {
      playNotificationSound()
      toast.info('🔔 Oshxonaga yangi buyurtma keldi!', { autoClose: 4000 })
      if (order && order.orderId) reloadOrders()
      else upsertOrder(order)
    }
    const handleStatusChanged = (order) => {
      if (order && order.orderId) reloadOrders()
      else upsertOrder(order)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleDisconnect)
    socket.on('order:new', handleNewOrder)
    socket.on('kitchen:new_order', handleNewOrder)
    socket.on('order:statusChanged', handleStatusChanged)
    socket.on('order:status_changed', handleStatusChanged)

    // Taom check-off socket eventlari
    socket.on('order:item_updated', handleItemUpdated)
    socket.on('order:itemUpdated', handleItemUpdated)
    socket.on('order:itemStatusChanged', handleItemUpdated)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleDisconnect)
      socket.off('order:new', handleNewOrder)
      socket.off('kitchen:new_order', handleNewOrder)
      socket.off('order:statusChanged', handleStatusChanged)
      socket.off('order:status_changed', handleStatusChanged)

      socket.off('order:item_updated', handleItemUpdated)
      socket.off('order:itemUpdated', handleItemUpdated)
      socket.off('order:itemStatusChanged', handleItemUpdated)
    }
  }, [upsertOrder, reloadOrders, handleItemUpdated])

  // Buyurtma statusini yangilash (Optimistik + Rollback)
  const setStatus = useCallback(
    async (orderId, status) => {
      let snapshotState
      // 1. Optimistik yangilanish (onMutate)
      setOrders((prev) => {
        snapshotState = prev
        return status === ORDER_STATUS.SERVED
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      })

      try {
        socket.emit('order:updateStatus', { orderId, status })
        await updateOrderStatus(orderId, status)
      } catch (err) {
        console.error(err)
        // 2. Xatolik bo'lsa eski holatga qaytarish (onError / Rollback)
        if (snapshotState) {
          setOrders(snapshotState)
        }
        toast.error("Statusni yangilab bo'lmadi")
      }
    },
    [],
  )

  // Taomni alohida belgilash / check-off (Optimistik + Rollback + Socket sync)
  const toggleItemReady = useCallback(
    async (orderId, itemIndexOrId, targetIsReady) => {
      let snapshotState
      // 1. Optimistik yangilanish (onMutate)
      setOrders((prev) => {
        snapshotState = prev
        return prev.map((order) => {
          if (order.id !== orderId) return order
          const updatedItems = order.items.map((item, idx) => {
            const matches =
              item.id === itemIndexOrId ||
              idx === itemIndexOrId ||
              idx === Number(itemIndexOrId)
            return matches ? { ...item, isReady: targetIsReady } : item
          })
          return { ...order, items: updatedItems }
        })
      })

      try {
        // Socket event orqali boshqa oshpazlar ekranini real-time yangilash
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

        await updateOrderItemStatus(orderId, itemIndexOrId, targetIsReady)
      } catch (err) {
        console.error(err)
        // 2. Xatolik bo'lsa eski holatga qaytarish (onError / Rollback)
        if (snapshotState) {
          setOrders(snapshotState)
        }
        toast.error("Taom holatini saqlashda xatolik yuz berdi")
      }
    },
    [],
  )

  const columns = {
    pending: orders.filter((o) => o.status === ORDER_STATUS.NEW),
    preparing: orders.filter((o) => o.status === ORDER_STATUS.IN_KITCHEN),
    ready: orders.filter((o) => o.status === ORDER_STATUS.READY),
  }

  return { columns, connection, setStatus, toggleItemReady }
}
