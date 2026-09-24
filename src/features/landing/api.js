// Public API — restoranlar ro'yxati va umumiy ma'lumotlar.
// Token talab qilinmaydi — mehmonlar uchun ochiq.
import api from '../../services/axios'

/** Barcha faol restoranlarni olish (public) */
export const getPublicRestaurants = (params) =>
  api.get('/restaurants', { params })

/** Bitta restoran haqida ma'lumot */
export const getPublicRestaurant = (slug) =>
  api.get(`/restaurants/${slug}`)

/** Mashhur va mavjud taomlar ro'yxati (public) */
export const getPublicProducts = (params = { limit: 8, isAvailable: true }) =>
  api.get('/products', { params })
