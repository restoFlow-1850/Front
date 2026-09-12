// Kassa API — Backend/src/routes/payment.routes.js va order receipt bilan mos.
import api from '../../services/axios'

// ─── Smena (Shift) API ──────────────────────────────────────────────────────
/** Joriy ochiq smenani olish — GET /api/shifts/current */
export const getCurrentShift = () => api.get('/shifts/current')

/**
 * Yangi smena ochish — POST /api/shifts/open
 * payload: { openingBalance?: number }
 */
export const openShift = (payload) => api.post('/shifts/open', payload)

/**
 * Smena yopish — POST /api/shifts/close
 * payload: { closingBalance: number }
 */
export const closeShift = (payload) => api.post('/shifts/close', payload)

/**
 * Z-Report — GET /api/shifts/:id/report
 * Smena bo'yicha to'liq hisobot
 */
export const getShiftReport = (shiftId) => api.get(`/shifts/${shiftId}/report`)

// ─── Buyurtmalar / To'lovlar API ────────────────────────────────────────────
export const getReceipt = (orderId) => api.get(`/orders/${orderId}/receipt`)

/**
 * payload: { order: ObjectId, method: 'naqd'|'karta'|'click'|'payme', amount? }
 * `amount` berilmasa backend qolgan balansning hammasini yopadi.
 */
export const createPayment = (payload) => api.post('/payments', payload)

export const getPayments = (params) => api.get('/payments', { params })

export const clearAllPayments = () => api.delete('/payments/clear-all')

/** To'lanmagan buyurtmalar API */
export const getUnpaidOrders = async (params) => {
  try {
    return await api.get('/payments/unpaid-orders', { params })
  } catch {
    return await api.get('/orders', { params: { paid: 'false', limit: 50, ...params } })
  }
}
