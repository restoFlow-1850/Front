// Oshxona API so'rovlari va ma'lumotlarni normallashtirish.
import api from '../../services/axios.js'
import { ORDER_STATUS } from '../../constants/roles.js'

export function normalizeKitchenOrder(o) {
  if (!o) return null
  const id = o._id || o.id || o.orderId
  return {
    id,
    number: o.number ?? (id ? `ORD-${String(id).slice(-4).toUpperCase()}` : 'ORD-????'),
    table: typeof o.table === 'object' ? (o.table?.number ?? '—') : (o.table ?? '—'),
    waiter: typeof o.waiter === 'object' ? (o.waiter?.name ?? '—') : (o.waiter ?? '—'),
    status: o.status,
    createdAt: o.createdAt || new Date().toISOString(),
    notes: o.notes || o.note || '',
    items: (o.items ?? []).map((i, index) => ({
      id: i._id || i.id || String(index),
      product: i.name ?? i.product?.name ?? i.product ?? 'Taom',
      name: i.name ?? i.product?.name ?? i.product ?? 'Taom',
      quantity: i.quantity ?? 1,
      note: i.note || i.comment || i.notes || i.instruction || '',
      isReady: Boolean(
        i.isReady ||
          i.isDone ||
          i.ready ||
          i.status === 'ready' ||
          i.status === 'tayyor' ||
          i.status === ORDER_STATUS.READY,
      ),
    })),
  }
}

export async function fetchKitchenOrders() {
  const res = await api.get('/orders', { params: { limit: 100 } })
  const orders = res.data?.data?.orders ?? res.data?.orders ?? res.data?.data ?? []
  const kitchenStatuses = [ORDER_STATUS.NEW, ORDER_STATUS.IN_KITCHEN, ORDER_STATUS.READY]
  return orders.map(normalizeKitchenOrder).filter((o) => o && kitchenStatuses.includes(o.status))
}

// Backend kontrakti: PATCH /orders/{id}/status  body: { "status": "yangi" }
export async function updateOrderStatus(orderId, status) {
  const res = await api.patch(`/orders/${orderId}/status`, { status })
  return res.data?.data
}

// Taom check-off uchun Zulfiqor backend kontrakti: PATCH /orders/:id/items/:itemId  body: { isReady: boolean }
export async function updateOrderItemStatus(orderId, itemId, isReady) {
  const res = await api.patch(`/orders/${orderId}/items/${itemId}`, { isReady })
  return res.data?.data
}

