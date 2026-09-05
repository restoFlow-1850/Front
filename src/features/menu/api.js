// Menyu (kategoriya + mahsulot) backend so'rovlari — services/axios orqali.
// Manba: https://backend-production-109c0.up.railway.app/api-docs (Categories, Products)
import api from '../../services/axios'

export const getCategories = () => api.get('/categories')
export const getCategoryById = (id) => api.get(`/categories/${id}`)
export const createCategory = (data) => api.post('/categories', data)
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data)
export const deleteCategory = (id) => api.delete(`/categories/${id}`)

export const getProducts = (params) => api.get('/products', { params })
export const getProductById = (id) => api.get(`/products/${id}`)
export const createProduct = (formData) =>
  api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
export const deleteProduct = (id) => api.delete(`/products/${id}`)

const API_ORIGIN = (import.meta.env.VITE_API_URL || 'https://backend-production-109c0.up.railway.app/api').replace(
  /\/api\/?$/,
  '',
)

// Backend rasm uchun nisbiy yo'l qaytaradi (masalan "/uploads/xyz.jpg") — to'liq URL'ga aylantiramiz.
export function resolveImageUrl(image) {
  if (!image) return null
  if (/^https?:\/\//.test(image)) return image
  return `${API_ORIGIN}${image.startsWith('/') ? '' : '/'}${image}`
}
