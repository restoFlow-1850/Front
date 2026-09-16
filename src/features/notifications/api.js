// Bildirishnomalar API — backendda saqlash, o'qilgan holatini boshqarish.
import api from '../../services/axios'

// Stollar ro'yxati — order:ready socket eventida table ObjectId keladi
// ("Stol 5" emas), uni raqamga aylantirish uchun stollar kerak.
// features/tables/api.js'dan to'g'ridan-to'g'ri import qilinmaydi
// (arxitektura qoidasi: feature'lar bir-biridan import qilmaydi).
export const getTables = () => api.get('/tables')

// ─── Bildirishnomalar CRUD ───────────────────────────────────────────────────

/** Bildirishnomalar ro'yxatini olish. */
export const getNotifications = (params) =>
  api.get('/notifications', { params })

/** Bitta bildirishnomani o'qilgan qilish. */
export const markNotificationRead = (id) =>
  api.patch(`/notifications/${id}/read`)

/** Barcha bildirishnomalarni o'qilgan qilish. */
export const markAllNotificationsRead = () =>
  api.post('/notifications/read-all')

/** Bildirishnomalarni tozalash (ixtiyoriy — backend qo'llab-quvvatlasa). */
export const clearNotifications = () =>
  api.delete('/notifications')
