// Axios instance — barcha API so'rovlari shu orqali yuboriladi.
// Mas'ul: Fayoz (auth interceptor). Foydalanadi: hamma feature.
import axios from 'axios'

const DEMO_TOKEN = 'demo-token'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://backend-production-11b7.up.railway.app/api',
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
    if (error.response?.status === 401) {
      const token = localStorage.getItem('accessToken')
      if (token && token !== DEMO_TOKEN) {
        console.warn('401 Unauthorized: token yaroqsiz, qayta login talab qilinadi.')
      }
    }
    // TODO: refresh token oqimi
    return Promise.reject(error)
  },
)

export default api
