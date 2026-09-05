// Real-time bildirishnomalar — AppLayout orqali ilova bo'ylab bir marta ulanadi.
import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { socket } from '../../services/socket'
import { getTables } from './api'
import { addNotification } from './notificationsSlice'
import { toast } from '../../components/ui'
import { ROLES, ORDER_STATUS } from '../../constants/roles'

const READY_EVENT_NAMES = ['order:status_updated', 'order:status_changed']
const SEEN_IDS_MAX = 200

function getId(value) {
    if (!value) return null
    if (typeof value === 'object') return value._id ?? value.id ?? null
    return value
}

function resolveTableWaiterId(table) {
    if (!table) return null
    return getId(table.waiter ?? table.assignedWaiter ?? table.waiterId ?? table.assignedWaiterId)
}

function extractOrder(payload) {
    if (!payload) return null
    return payload.order ?? payload.data?.order ?? payload
}

function getTableFromOrder(order, payload) {
    return order?.table ?? payload?.table ?? payload?.tableId ?? null
}

function getTableNumber(table, tableInfo) {
    if (tableInfo?.number != null) return tableInfo.number
    if (typeof table === 'object') return table.number ?? table.name ?? table._id ?? '?'
    return table ?? '?'
}

function getOrderItems(order) {
    const items = Array.isArray(order?.items) ? order.items : []
    return items
        .map((item) => {
            const name = item?.name ?? item?.product?.name ?? item?.product ?? 'Taom'
            const quantity = item?.quantity ?? 1
            return `${name} ×${quantity}`
        })
        .filter(Boolean)
}

function resolveOrderWaiterId(order, payload) {
    return getId(
        order?.waiter ??
        order?.assignedWaiter ??
        order?.waiterId ??
        order?.assignedWaiterId ??
        payload?.waiter ??
        payload?.assignedWaiter ??
        payload?.waiterId ??
        payload?.assignedWaiterId,
    )
}

export default function useNotificationsSocket() {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth.user)
    const tablesRef = useRef(new Map())
    const seenReadyIdsRef = useRef(new Set())

    useEffect(() => {
        // This feature is strictly for Waiters. Non-waiter accounts do not even
        // subscribe to the waiter notification events.
        if (user?.role !== ROLES.WAITER) return undefined

        let cancelled = false

        const loadTables = async () => {
            try {
                const res = await getTables()
                const payload = res.data?.data ?? res.data
                const tables = payload?.tables ?? payload ?? []
                if (cancelled || !Array.isArray(tables)) return

                const byId = new Map()
                tables.forEach((table) => {
                    if (table?._id || table?.id) {
                        byId.set(table._id ?? table.id, {
                            number: table.number,
                            waiterId: resolveTableWaiterId(table),
                        })
                    }
                })
                tablesRef.current = byId
            } catch {
                // The socket payload may already contain table information, so
                // notifications can still be displayed if the table request fails.
            }
        }

        loadTables()

        const currentUserId = getId(user)

        const isForCurrentWaiter = (order, payload, tableInfo) => {
            const targetWaiterId =
                resolveOrderWaiterId(order, payload) ?? tableInfo?.waiterId ?? null

            // If backend identifies the assigned waiter, enforce the assignment.
            // If it does not, the role gate above still guarantees that only
            // Waiter accounts receive this feature.
            return !targetWaiterId || !currentUserId || targetWaiterId === currentUserId
        }

        const handleWaiterCalled = (payload) => {
            const rawTable = payload?.table ?? payload?.tableId ?? payload
            const tableId = getId(rawTable)
            const tableInfo = tableId ? tablesRef.current.get(tableId) : null
            const targetWaiterId = getId(
                payload?.waiter ?? payload?.assignedWaiter ?? payload?.waiterId ?? payload?.assignedWaiterId,
            ) ?? tableInfo?.waiterId ?? null

            if (targetWaiterId && currentUserId && targetWaiterId !== currentUserId) return

            const tableNumber = getTableNumber(rawTable, tableInfo)
            const message = `Stol ${tableNumber}: ofitsiant chaqirilmoqda!`
            const notification = {
                id: `waiter-call-${tableId ?? tableNumber}-${Date.now()}`,
                type: 'table:waiter_called',
                tableId,
                tableNumber,
                message,
                read: false,
                createdAt: new Date().toISOString(),
            }

            dispatch(addNotification(notification))
            toast.success(message)
        }

        const handleOrderReady = (payload) => {
            const order = extractOrder(payload)
            const status = order?.status ?? payload?.status
            if (status !== ORDER_STATUS.READY) return

            const orderId = getId(order)
            if (orderId && seenReadyIdsRef.current.has(orderId)) return
            if (orderId) {
                seenReadyIdsRef.current.add(orderId)
                if (seenReadyIdsRef.current.size > SEEN_IDS_MAX) {
                    const oldest = seenReadyIdsRef.current.values().next().value
                    seenReadyIdsRef.current.delete(oldest)
                }
            }

            const rawTable = getTableFromOrder(order, payload)
            const tableId = getId(rawTable)
            const tableInfo = tableId ? tablesRef.current.get(tableId) : null
            const tableNumber = getTableNumber(rawTable, tableInfo)

            if (!isForCurrentWaiter(order, payload, tableInfo)) return

            const items = getOrderItems(order)
            const orderNumber = order?.number ?? order?.orderNumber ?? orderId ?? '?'
            const itemsText = items.length ? items.join(', ') : 'Buyurtma tayyor'
            const message = `Stol ${tableNumber}: #${orderNumber} — ${itemsText}`

            const notification = {
                id: `order-ready-${orderId ?? tableId ?? Date.now()}`,
                type: 'order:ready',
                orderId,
                orderNumber,
                tableId,
                tableNumber,
                items,
                message,
                read: false,
                createdAt: new Date().toISOString(),
            }

            dispatch(addNotification(notification))
            toast.success(message)
        }

        // Existing backend contract: order status changes to the Uzbek READY value.
        READY_EVENT_NAMES.forEach((eventName) => socket.on(eventName, handleOrderReady))
        socket.on('table:status_updated', loadTables)
        socket.on('table:waiter_called', handleWaiterCalled)

        return () => {
            cancelled = true
            READY_EVENT_NAMES.forEach((eventName) => socket.off(eventName, handleOrderReady))
            socket.off('table:status_updated', loadTables)
            socket.off('table:waiter_called', handleWaiterCalled)
        }
    }, [dispatch, user])
}

export { getOrderItems, resolveOrderWaiterId }
