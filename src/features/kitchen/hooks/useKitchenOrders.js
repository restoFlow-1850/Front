// Oshxona buyurtmalari — boshlang'ich yuklash + Socket.io real-time yangilanish.
// Backend hali ulanmagan bo'lsa, demo ma'lumotlarga tushadi (UI sinovi uchun).
// Mas'ul: Ziyodulla.
import { useCallback, useEffect, useRef, useState } from 'react'
import { socket, connectSocket, disconnectSocket } from '../../../services/socket'
import { fetchKitchenOrders, updateOrderStatus } from '../api'
import { MOCK_ORDERS } from '../mockData'
import { ORDER_STATUS } from '../../../constants/roles'

const BOARD_STATUSES = [ORDER_STATUS.NEW, ORDER_STATUS.IN_KITCHEN, ORDER_STATUS.READY]

export function useKitchenOrders() {
  const [orders, setOrders] = useState([])
  const [connection, setConnection] = useState('connecting') // connecting | live | offline | demo
  const isDemo = useRef(false)

  const upsertOrder = useCallback((incoming) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === incoming.id)
      if (!exists) return [incoming, ...prev]
      return prev.map((o) => (o.id === incoming.id ? { ...o, ...incoming } : o))
    })
  }, [])

  // Boshlang'ich yuklash
  useEffect(() => {
    let cancelled = false

    fetchKitchenOrders()
      .then((data) => {
        if (cancelled) return
        setOrders(data.filter((o) => BOARD_STATUSES.includes(o.status)))
      })
      .catch(() => {
        if (cancelled) return
        // Backend mavjud emas — demo ma'lumotlar bilan ishlaymiz.
        isDemo.current = true
        setOrders(MOCK_ORDERS)
        setConnection('demo')
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Socket.io real-time ulanish (faqat backend mavjud bo'lganda)
  useEffect(() => {
    if (isDemo.current) return undefined

    const token = window.localStorage.getItem('accessToken')
    connectSocket(token)

    const handleConnect = () => setConnection('live')
    const handleDisconnect = () => setConnection('offline')
    const handleNewOrder = (order) => upsertOrder(order)
    const handleStatusChanged = (order) => upsertOrder(order)

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleDisconnect)
    socket.on('order:new', handleNewOrder)
    socket.on('order:statusChanged', handleStatusChanged)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleDisconnect)
      socket.off('order:new', handleNewOrder)
      socket.off('order:statusChanged', handleStatusChanged)
      disconnectSocket()
    }
  }, [upsertOrder])

  const setStatus = useCallback(
    async (orderId, status) => {
      // Optimistik yangilanish — UI darhol javob beradi.
      setOrders((prev) =>
        status === ORDER_STATUS.SERVED
          ? prev.filter((o) => o.id !== orderId)
          : prev.map((o) => (o.id === orderId ? { ...o, status } : o)),
      )

      if (isDemo.current) return

      try {
        socket.emit('order:updateStatus', { orderId, status })
        await updateOrderStatus(orderId, status)
      } catch {
        // TODO (Ziyodulla/backend): xatolik bo'lsa eski holatga qaytarish + toast
      }
    },
    [],
  )

  const columns = {
    pending: orders.filter((o) => o.status === ORDER_STATUS.NEW),
    preparing: orders.filter((o) => o.status === ORDER_STATUS.IN_KITCHEN),
    ready: orders.filter((o) => o.status === ORDER_STATUS.READY),
  }

  return { columns, connection, setStatus }
}
