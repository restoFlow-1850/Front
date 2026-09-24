// Axios instance — barcha API so'rovlari shu orqali yuboriladi.
// Mas'ul: Fayoz (auth interceptor). Foydalanadi: hamma feature.
import axios from 'axios'
import { disconnectSocket } from './socket.js'

const rawApiUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : undefined
const isDev = typeof import.meta !== 'undefined' && Boolean(import.meta.env?.DEV)
const baseURL = isDev
  ? (rawApiUrl && !rawApiUrl.startsWith('http') ? rawApiUrl : '/api')
  : (rawApiUrl || 'https://backend-production-109c0.up.railway.app/api')

const api = axios.create({
  baseURL,
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
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/send-otp',
  '/auth/verify-otp',
]

const redirectToLogin = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')
  disconnectSocket()
  window.location.href = '/login'
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    const isAuthEndpoint = AUTH_ENDPOINTS.some((url) => originalRequest?.url?.includes(url))

    if (error.response?.status !== 401 || isAuthEndpoint || originalRequest._retry) {
      return Promise.reject(error)
    }

    // Refresh token har safar localStorage'dan o'qiladi — modul yuklanganda bir marta
    // o'qilsa, login'dan keyin kelgan yangi token ko'rinmay qoladi.
    const refreshToken = localStorage.getItem('refreshToken')

    if (!isValidToken(refreshToken)) {
      redirectToLogin()
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
      const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken })
      // Backend standart {success, data} formatida o'raydi — xavfsiz ochamiz (Zulfqor).
      const data = res.data?.data ?? res.data
      localStorage.setItem('accessToken', data.accessToken)
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)

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
