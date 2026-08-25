// Kassa API — Backend/src/routes/payment.routes.js va order receipt bilan mos.
import api from '../../services/axios'

export const getReceipt = (orderId) => api.get(`/orders/${orderId}/receipt`)

/**
 * payload: { order: ObjectId, method: 'naqd'|'karta'|'click'|'payme', amount? }
 * `amount` berilmasa backend qolgan balansning hammasini yopadi.
 */
export const createPayment = (payload) => api.post('/payments', payload)

export const getPayments = (params) => api.get('/payments', { params })
