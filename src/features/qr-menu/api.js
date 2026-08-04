// Mehmon (login qilmagan) uchun ochiq so'rovlar — services/axios orqali.
// Stollar, band holati, menyu va bron yaratish shu yerdan ishlaydi.
import api from '../../services/axios'

export const getTableAvailability = (isoDateTime) =>
  api.get('/tables/availability', { params: { date: isoDateTime } })

export const getPublicCategories = () => api.get('/categories')

export const getPublicProducts = (params) =>
  api.get('/products', { params: { limit: 100, isAvailable: true, ...params } })

export const createGuestReservation = (payload) => api.post('/reservations', payload)

const API_ORIGIN = (
  import.meta.env.VITE_API_URL || 'https://backend-production-11b7.up.railway.app/api'
).replace(/\/api\/?$/, '')

export function resolveImageUrl(image) {
  if (!image) return null
  if (/^https?:\/\//.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}

export function formatSum(amount) {
  return `${Number(amount || 0).toLocaleString('ru-RU')} so'm`
}
