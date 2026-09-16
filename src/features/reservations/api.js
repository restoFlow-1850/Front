// Bronlar API — Backend/src/routes/reservation.routes.js bilan mos.
import api from '../../services/axios'

export const getReservations = (params) => api.get('/reservations', { params })
export const getReservationById = (id) => api.get(`/reservations/${id}`)

/** payload: { customerName, customerPhone, table, date, guests, notes? } */
export const createReservation = (payload) => api.post('/reservations', payload)
export const updateReservation = (id, payload) => api.put(`/reservations/${id}`, payload)

/** O'chirish faqat admin/manager uchun ochiq. */
export const deleteReservation = (id) => api.delete(`/reservations/${id}`)
export const clearAllReservations = () => api.delete('/reservations/clear-all')
