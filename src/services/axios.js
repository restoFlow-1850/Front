// Axios instance — barcha API so'rovlari shu orqali yuboriladi.
// Mas'ul: Fayoz (auth interceptor). Foydalanadi: hamma feature.
import axios from 'axios'
import { toast } from 'react-toastify'
import { disconnectSocket } from './socket.js'
import { isSubscriptionExpired, emitSubscriptionExpired, SUBSCRIPTION_EXPIRED_TOAST_ID } from '../lib/subscription'
import { subscriptionExpiredMessage } from '../lib/messages'
import { API_URL } from '../shared/config.js'
import {
  clearSession,
  consumeLegacyRefreshToken,
  extractToken,
  isValidToken,
  peekLegacyRefreshToken,
  readToken,
  storeAccessToken,
} from '../features/auth/session.js'

const baseURL = API_URL

// withCredentials — httpOnly refresh cookie (#18) /auth/refresh va /auth/logout'ga borishi uchun.
// Backend CORS'da credentials: true va aniq origin ro'yxati bor.
const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

// So'rovga faqat yaroqli token qo'shish. Buzilgan/soxta token yuborish
// har bir panelda 401 qaytaradi — shuning uchun bu yerda qat'iy tekshiramiz.
api.interceptors.request.use((config) => {
  const token = readToken('accessToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
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

      const method = String(originalRequest?.method ?? 'get').toLowerCase()
      if (method === 'get') {
        toast.error(subscriptionExpiredMessage(), { toastId: SUBSCRIPTION_EXPIRED_TOAST_ID })
      }
    }

    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
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
      // Token faqat refresh MUVAFFAQIYATLI bo'lgandan keyin o'chiriladi — aks holda
      // tarmoq xatosida foydalanuvchi butunlay sessiyasiz qolardi.
      const legacy = peekLegacyRefreshToken()
      const res = await axios.post(
        `${baseURL}/auth/refresh`,
        legacy ? { refreshToken: legacy } : {},
        { withCredentials: true },
      )
      // Backend standart {success, data} formatida o'raydi — xavfsiz ochamiz (Zulfqor).
      const data = res.data?.data ?? res.data
      const nextToken = extractToken(data) ?? extractToken(res.data)

      // Noto'g'ri formatdagi javob localStorage'ga "undefined" yozib qo'ymasligi
      // shart — keyingi barcha so'rovlar yana 401 qaytarardi.
      if (!isValidToken(nextToken)) {
        throw new Error('Refresh javobida yaroqli access token yo‘q')
      }

      storeAccessToken(nextToken)
      consumeLegacyRefreshToken()

      processQueue(null, nextToken)
      originalRequest.headers.Authorization = `Bearer ${nextToken}`
      return api(originalRequest)
    } catch (refreshError) {
      processQueue(refreshError, null)

      // Tarmoq uzilishi yoki server xatosida sessiyani o'chirmaymiz — bu
      // foydalanuvchini keraksiz ravishda login'ga uloqtirardi. Faqat haqiqiy
      // autentifikatsiya rad etilganda (401/403) chiqish qilamiz.
      const status = refreshError?.response?.status
      const isTransportFailure = !status || status >= 500
      if (isTransportFailure) {
        return Promise.reject(refreshError)
      }

      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)

export default api
