// Buyurtmalar API — Backend/src/routes/order.routes.js bilan mos.
import api from '../../services/axios'

export const getOrders = (params) => api.get('/orders', { params })
export const getOrderById = (id) => api.get(`/orders/${id}`)
export const getOrderReceipt = (id) => api.get(`/orders/${id}/receipt`)

/** payload: { table: ObjectId, items: [{ product, quantity }], notes? } */
export const createOrder = (payload) => api.post('/orders', payload)

/** status: constants/roles.js -> ORDER_STATUS qiymatlaridan biri. */
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status })

/** Buyurtmani boshqa stolga ko'chirish. table: yangi stolning ObjectId qiymati. */
export const transferOrderTable = (id, table) =>
  api.patch(`/orders/${id}/transfer-table`, { table })

export const cancelOrder = (id, reason) =>
  api.patch(`/orders/${id}/cancel`, { reason })

export const deleteOrder = (id) => api.delete(`/orders/${id}`)
export const clearAllOrders = () => api.delete('/orders/clear-all')
