// Real-time bildirishnomalar — bitta joyda ulanadi (AppLayout, ilova bo'ylab bir marta).
// Bu muhim: har bir komponent o'zi socket.on() qo'yib ketsa, remount bo'lganda listener
// ko'payadi va bitta xabar bir necha marta chiqadi. useEffect cleanup'da socket.off()
// har doim mos ravishda chaqiriladi.
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { socket } from '../../services/socket'
import { getTables } from './api'
import { addNotification, fetchNotifications } from './notificationsSlice'
import { toast } from '../../components/ui'
import { ROLES, ORDER_STATUS } from '../../constants/roles'
import { playNotificationSound } from '../../utils/sound'

function resolveTableWaiterId(table) {
  const raw = table.waiter ?? table.assignedWaiter
  if (!raw) return null
  return typeof raw === 'object' ? raw._id : raw
}

export default function useNotificationsSocket() {
  const dispatch = useDispatch()
  const user = useSelector((state) => state.auth.user)
  const queryClient = useQueryClient()
  const tablesRef = useRef({ byId: new Map(), waiterFieldSeen: false })
  const seenEventsRef = useRef(new Map())

  // Backend'dan bildirishnomalarni yuklash (birinchi kirishda)
  useEffect(() => {
    dispatch(fetchNotifications())
  }, [dispatch])

  useEffect(() => {
    let cancelled = false

    const isDuplicate = (key) => {
      const now = Date.now()
      const last = seenEventsRef.current.get(key)
      if (last && now - last < 2000) {
        return true
      }
      seenEventsRef.current.set(key, now)
      if (seenEventsRef.current.size > 100) {
        for (const [k, ts] of seenEventsRef.current.entries()) {
          if (now - ts > 5000) seenEventsRef.current.delete(k)
        }
      }
      return false
    }

    const loadTables = async () => {
      try {
        const res = await getTables()
        const payload = res.data.data ?? res.data
        const tables = payload.tables ?? payload ?? []
        if (cancelled) return

        const byId = new Map()
        let waiterFieldSeen = false
        tables.forEach((table) => {
          const waiterId = resolveTableWaiterId(table)
          if (waiterId) waiterFieldSeen = true
          byId.set(table._id, { number: table.number, waiterId })
        })
        tablesRef.current = { byId, waiterFieldSeen }
      } catch {
        // Stollar ro'yxati kelmasa ham bildirishnoma ko'rsatishda davom etamiz
      }
    }

    const invalidateTablesAndOrders = () => {
      queryClient.invalidateQueries({ queryKey: ['tables'], exact: false })
      queryClient.invalidateQueries({ queryKey: ['orders'], exact: false })
    }

    const handleTableUpdated = async () => {
      invalidateTablesAndOrders()
      await loadTables()
    }

    const handleOrderEvent = () => {
      invalidateTablesAndOrders()
    }

    loadTables()

    const handleOrderReady = (payload) => {
      const orderId = payload.orderId ?? payload.order?._id ?? payload._id
      const dedupKey = `ready:${orderId}`
      if (isDuplicate(dedupKey)) return

      const { byId, waiterFieldSeen } = tablesRef.current
      const tableInfo = byId.get(payload.table)
      const tableNumber = tableInfo?.number ?? payload.table

      const isWaiter = user?.role === ROLES.WAITER
      const currentUserId = user?._id ?? user?.id
      if (isWaiter && waiterFieldSeen && tableInfo?.waiterId && tableInfo.waiterId !== currentUserId) {
        return
      }

      const notification = {
        id: `${orderId}-${Date.now()}`,
        type: 'order:ready',
        orderId,
        tableNumber,
        message: `Stol ${tableNumber}: buyurtma tayyor!`,
        read: false,
        createdAt: new Date().toISOString(),
      }

      playNotificationSound()
      dispatch(addNotification(notification))
      toast.success(notification.message)
    }

    const handleNotificationNew = (payload) => {
      const notifId = payload._id ?? payload.id ?? `${payload.title}-${payload.message}`
      const dedupKey = `notif:${notifId}`
      if (isDuplicate(dedupKey)) return

      const notification = {
        _id: notifId,
        type: payload.type ?? 'info',
        title: payload.title ?? payload.message ?? 'Bildirishnoma',
        message: payload.message ?? payload.body ?? '',
        orderId: payload.orderId,
        tableNumber: payload.tableNumber,
        read: false,
        createdAt: payload.createdAt ?? new Date().toISOString(),
      }
      playNotificationSound()
      dispatch(addNotification(notification))
      if (notification.message) {
        toast.success(notification.message)
      }
    }

    const handleStatusEvent = (payload) => {
      invalidateTablesAndOrders()
      const status = payload?.status ?? payload?.order?.status
      if (status === ORDER_STATUS.READY) {
        handleOrderReady({
          orderId: payload?.orderId ?? payload?._id ?? payload?.order?._id,
          table: payload?.table ?? payload?.order?.table,
        })
      }
    }

    socket.on('order:ready', handleOrderReady)
    socket.on('order:new', handleOrderEvent)
    socket.on('order:created', handleOrderEvent)
    socket.on('order:status_changed', handleStatusEvent)
    socket.on('order:cancelled', handleOrderEvent)
    socket.on('table:updated', handleTableUpdated)
    socket.on('table:status_updated', handleTableUpdated)
    socket.on('notification:new', handleNotificationNew)

    return () => {
      cancelled = true
      socket.off('order:ready', handleOrderReady)
      socket.off('order:new', handleOrderEvent)
      socket.off('order:created', handleOrderEvent)
      socket.off('order:status_changed', handleStatusEvent)
      socket.off('order:cancelled', handleOrderEvent)
      socket.off('table:status_updated', handleTableUpdated)
      socket.off('table:updated', handleTableUpdated)
      socket.off('notification:new', handleNotificationNew)
    }
  }, [dispatch, queryClient, user])
}
