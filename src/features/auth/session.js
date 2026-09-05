// Sessiya (token + user) localStorage bilan ishlash — yagona joyda.
// Ilgari bu mantiq axios.js, ProtectedRoute.jsx, AppLayout.jsx va LoginForm.jsx
// ichida takrorlanardi va har biri "buzilgan token" holatini boshqacha tekshirardi.

const ACCESS = 'accessToken'
const REFRESH = 'refreshToken'
const USER = 'user'
const BACKEND_ORIGIN = 'authBackendOrigin'

// localStorage'ga "undefined"/"null" satri yozilib qolishi mumkin (JSON.stringify
// natijasi). Ular token sifatida yaroqsiz.
export function isValidToken(token) {
  return Boolean(token) && token !== 'undefined' && token !== 'null'
}

export function readToken(key) {
  const value = localStorage.getItem(key)
  return isValidToken(value) ? value : null
}

export function readUser() {
  try {
    const raw = localStorage.getItem(USER)
    return raw && raw !== 'undefined' ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Har bir joyda VITE_API_URL fallback'ini qayta yozmaslik uchun — bu qiymat
// services/axios.js dagi bilan BIR XIL bo'lishi SHART.
const API_URL_FALLBACK = 'https://backend-production-109c0.up.railway.app/api'

export function saveSession({ user, accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
  if (user) localStorage.setItem(USER, JSON.stringify(user))
  if (accessToken || refreshToken) {
    stampBackendOrigin(import.meta.env.VITE_API_URL || API_URL_FALLBACK)
  }
}

export function clearSession() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(USER)
  localStorage.removeItem(BACKEND_ORIGIN)
}

// Backend Railway'da qayta deploy qilinganda yoki URL o'zgarganda, brauzerda
// eski backend bergan token qolib ketishi mumkin — yangi backend uni tanimaydi
// va 401/403 xatolar "sababsiz" ko'rinadi. Shuning uchun har bir token qaysi
// backend manzili uchun berilganini belgilab qo'yamiz.
export function stampBackendOrigin(origin) {
  if (origin) localStorage.setItem(BACKEND_ORIGIN, origin)
}

// true qaytarsa: hozirgi token boshqa (eski) backend manzili uchun berilgan —
// so'rov yuborishdan oldin sessiyani tozalash kerak.
export function isStaleBackendSession(currentOrigin) {
  const storedOrigin = localStorage.getItem(BACKEND_ORIGIN)
  const hasToken = isValidToken(localStorage.getItem(ACCESS)) || isValidToken(localStorage.getItem(REFRESH))
  if (!hasToken) return false
  // Eski build'larda BACKEND_ORIGIN umuman yozilmagan bo'lishi mumkin — bu holatda
  // "stale" deb hisoblamaymiz (aks holda hamma eski sessiya sababsiz chiqarib
  // yuboriladi). Faqat ANIQ boshqa manzil yozilgan bo'lsa tozalaymiz.
  if (!storedOrigin) return false
  return storedOrigin !== currentOrigin
}
