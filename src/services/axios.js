// Axios instance — barcha API so'rovlari shu orqali yuboriladi.
// Mas'ul: Fayoz (auth interceptor). Foydalanadi: hamma feature.
import axios from 'axios'

// Backend ishga tushdi (Railway). Aniq prefiks Swagger'da tekshirilishi kerak —
// hozircha '/api' deb faraz qilingan (docs manzili: /api-docs).
// TODO: Swagger UI ulanganda shu baseURL'ni tasdiqlash/tuzatish.
const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://backend-production-11b7.up.railway.app/api',
  headers: { 'Content-Type': 'application/json' },
})

// So'rovga token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 bo'lsa refresh token orqali yangilash (TODO: Fayoz)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    // TODO: refresh token oqimi
    return Promise.reject(error)
  },
)

export default api
