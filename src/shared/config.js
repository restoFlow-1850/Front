// Ilova konfiguratsiyasi — backend manzili va build versiyasi uchun YAGONA manba.
// Backend URL'ini boshqa joyda hardcode qilmang: shu yerdan import qiling.
//
//   VITE_API_URL     — backend API (masalan https://api.restoflow.uz/api)
//   VITE_SOCKET_URL  — Socket.io manzili (berilmasa API_URL'dan /api olib tashlanadi)
//   VITE_COMMIT      — build qilingan git commit (vite.config.js avtomatik to'ldiradi)

export const DEFAULT_API_URL = 'https://api.restoflow.uz/api'

const env = import.meta.env ?? {}
const isDev = Boolean(env.DEV)
const rawApiUrl = env.VITE_API_URL

// Dev'da Vite proxy ishlatiladi (vite.config.js → /api), shuning uchun faqat nisbiy yo'l qabul qilinadi
export const API_URL = isDev
  ? (rawApiUrl && !rawApiUrl.startsWith('http') ? rawApiUrl : '/api')
  : (rawApiUrl || DEFAULT_API_URL)

// Rasm va fayllar uchun: "/uploads/x.jpg" → `${API_ORIGIN}/uploads/x.jpg` (dev'da '' — proxy orqali)
export const API_ORIGIN = API_URL.replace(/\/api\/?$/, '')

export const SOCKET_URL =
  env.VITE_SOCKET_URL ||
  (isDev && typeof window !== 'undefined' ? window.location.origin : API_ORIGIN || DEFAULT_API_URL.replace(/\/api$/, ''))

export const APP_COMMIT = env.VITE_COMMIT || ''
export const APP_COMMIT_SHORT = APP_COMMIT ? APP_COMMIT.slice(0, 7) : 'dev'
