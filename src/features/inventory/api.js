// Ombor (xomashyo) backend so'rovlari — services/axios orqali.
// Manba: /api-docs (Inventory — Ingredients + StockMovements)
import api from '../../services/axios'

export const getIngredients = (params) => api.get('/ingredients', { params })
export const getIngredientById = (id) => api.get(`/ingredients/${id}`)
export const createIngredient = (data) => api.post('/ingredients', data)
export const updateIngredient = (id, data) => api.patch(`/ingredients/${id}`, data)
export const deleteIngredient = (id) => api.delete(`/ingredients/${id}`)

export const addMovement = (id, data) => api.post(`/ingredients/${id}/movements`, data)
export const getMovements = (id, params) => api.get(`/ingredients/${id}/movements`, { params })

// Ombor harakati hisoboti — Excel (xlsx) ko'chirib olish. Blob qaytaradi.
export const exportMovements = async (params) =>
  api.get('/ingredients/export', { params, responseType: 'blob' }).then((r) => r.data)