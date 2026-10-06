// Axios instance — barcha API so'rovlari shu orqali yuboriladi.
// Mas'ul: Fayoz (auth interceptor). Foydalanadi: hamma feature.
import axios from 'axios'
import { disconnectSocket } from './socket.js'
import { isSubscriptionExpired, emitSubscriptionExpired } from '../lib/subscription'
import { API_URL } from '../shared/config.js'
import { clearSession, takeLegacyRefreshToken } from '../features/auth/session.js'

const baseURL = API_URL

// withCredentials — httpOnly refresh cookie (#18) /auth/refresh va /auth/logout'ga borishi uchun.
// Backend CORS'da credentials: true va aniq origin ro'yxati bor.
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

const isValidToken = (token) => token && token !== 'undefined' && token !== 'null'

// So'rovga token qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (isValidToken(token)) config.headers.Authorization = `Bearer ${token}`
  return config
})

// 401 bo'lganda refresh token orqali yangilash, so'ngra so'rovni qayta yuborish.
// Bir vaqtda bir nechta so'rov 401 qaytarsa, faqat bitta refresh so'rovi yuboriladi
// — qolganlari navbatga (pendingQueue) qo'yiladi va refresh tugagach davom etadi (Behruz).
let isRefreshing = false
let pendingQueue = []

const processQueue = (error, accessToken = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(accessToken)
  })
  pendingQueue = []
}

const AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/send-otp',
  '/auth/verify-otp',
]

const redirectToLogin = () => {
  clearSession()
  disconnectSocket()
  window.location.href = '/login'
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => originalRequest?.url?.includes(url))

    // Obuna tugagan (402) — AppLayout'dagi "Obuna tugagan" banneriga e'lon qilinadi.
    // Rad etishni bu yerda ham qayta ishlaymiz: 401 mantig'i boshqa joyda.
    if (isSubscriptionExpired(error)) {
      emitSubscriptionExpired(error.response?.data ?? {})
    }

    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue = [...pendingQueue, { resolve, reject }]
      }).then((accessToken) => {
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      // Refresh token httpOnly cookie'da — brauzer o'zi yuboradi. Eski versiyadan
      // localStorage'da qolgan token bo'lsa, bir marta body'da yuborib, cookie'ga ko'chiramiz.
      const legacy = takeLegacyRefreshToken()
      const res = await axios.post(
        `${baseURL}/auth/refresh`,
        legacy ? { refreshToken: legacy } : {},
        { withCredentials: true },
      )
      // Backend standart {success, data} formatida o'raydi — xavfsiz ochamiz (Zulfqor).
      const data = res.data?.data ?? res.data
      localStorage.setItem('accessToken', data.accessToken)

      processQueue(null, data.accessToken)
      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
