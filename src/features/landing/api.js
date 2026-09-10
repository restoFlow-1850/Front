// Public API — restoranlar ro'yxati va umumiy ma'lumotlar.
// Token talab qilinmaydi — mehmonlar uchun ochiq.
import api from '../../services/axios'

/** Barcha faol restoranlarni olish (public) */
export const getPublicRestaurants = (params) =>
  api.get('/public/restaurants', { params })

/** Bitta restoran haqida ma'lumot */
export const getPublicRestaurant = (slug) =>
  api.get(`/public/restaurants/${slug}`)
