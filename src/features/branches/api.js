// Filiallar (restoranlar) API so'rovlari — services/axios orqali.
import api from '../../services/axios'

/** Barcha filiallarni olish (GET /restaurants) */
export const getRestaurants = (params) => api.get('/restaurants', { params })

/**
 * Filialni yangilash.
 * Backendda restoranlar "Client" moduli ostida saqlanadi — joylashuv
 * (coordinates) shu PUT orqali yangilanadi.
 */
export const updateRestaurant = (id, data) => api.put(`/clients/${id}`, data)
