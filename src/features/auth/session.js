// Sessiya (token + user) localStorage bilan ishlash — yagona joyda.
// Ilgari bu mantiq axios.js, ProtectedRoute.jsx, AppLayout.jsx va LoginForm.jsx
// ichida takrorlanardi va har biri "buzilgan token" holatini boshqacha tekshirardi.

//
// #18: refresh token endi localStorage'da SAQLANMAYDI — backend uni httpOnly
// cookie'da beradi (JavaScript o'qiy olmaydi → XSS'da o'g'irlanmaydi).
// Bu yerda faqat access token (qisqa muddatli) va user qoladi.

import { API_ORIGIN } from '../../shared/config.js'

const ACCESS = 'accessToken'
const LEGACY_REFRESH = 'refreshToken' // eski versiyalardan qolgan kalit — o'chiriladi
const USER = 'user'
const API_ORIGIN_KEY = 'restoflow_session_api_origin'

export const SESSION_CLEARED_EVENT = 'auth:session-cleared'

// "demo-access-..." kabi soxta tokenlar backend'da haqiqiy hisoblanmaydi.
// Ularni Authorization'ga qo'yish har bir API so'rovida 401 qaytaradi.
export function isValidToken(token) {
  if (typeof token !== 'string') return false
  const value = token.trim()
  if (!value || value === 'undefined' || value === 'null' || value === 'NaN') return false
  return !/^demo[-_]/.test(value)
}

export function readToken(key = ACCESS) {
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

// Backend javob shakli har xil bo'lishi mumkin: { accessToken }, { token },
// { data: { tokens: { accessToken } } } va hokazo. Barchasidan yaroqli token topamiz.
export function extractToken(payload) {
  if (!payload || typeof payload !== 'object') return null

  const candidates = [
    payload.accessToken,
    payload.token,
    payload.tokens?.accessToken,
    payload.tokens?.token,
    payload.data?.accessToken,
    payload.data?.token,
    payload.data?.tokens?.accessToken,
    payload.data?.tokens?.token,
  ]

  return candidates.find(isValidToken) ?? null
}

export function storeAccessToken(token) {
  if (!isValidToken(token)) {
    localStorage.removeItem(ACCESS)
    localStorage.removeItem(API_ORIGIN_KEY)
    return false
  }

  localStorage.setItem(ACCESS, token)
  localStorage.setItem(API_ORIGIN_KEY, API_ORIGIN)
  return true
}

// refreshToken body'da kelsa ham (backend o'tish davri) — ataylab e'tiborsiz qoldiriladi
export function saveSession(session = {}) {
  const { user } = session
  storeAccessToken(extractToken(session))

  if (user) localStorage.setItem(USER, JSON.stringify(user))
  localStorage.removeItem(LEGACY_REFRESH)
}

// Backend manzili o'zgarganda (masalan, production host almashtirilganda)
// eski token yangi serverda yaroqsiz bo'lib, barcha panellar 401 qaytaradi.
export function isSessionForCurrentApi() {
  if (!readToken(ACCESS)) return true
  return localStorage.getItem(API_ORIGIN_KEY) === API_ORIGIN
}

export function clearSession() {
  const hadSession =
    localStorage.getItem(ACCESS) !== null ||
    localStorage.getItem(USER) !== null ||
    localStorage.getItem(LEGACY_REFRESH) !== null

  localStorage.removeItem(ACCESS)
  localStorage.removeItem(LEGACY_REFRESH)
  localStorage.removeItem(USER)
  localStorage.removeItem(API_ORIGIN_KEY)

  // Bir tab'da chiqilganda qolgan tab'lardagi Redux ham tozalanishi uchun.
  // Faqat biror narsa o'chirilganda e'lon qilamiz — aks holda clearCredentials
  // → clearSession → event → clearCredentials zanjiri yuzaga keladi.
  if (hadSession && typeof window !== 'undefined') {
    window.dispatchEvent(new Event(SESSION_CLEARED_EVENT))
  }
}

// Eski versiyadan qolgan refresh token: refresh paytida bir marta body'da
// yuboriladi (backend cookie o'rnatadi), keyin o'chiriladi. Yangi login'larda bo'lmaydi.
export function peekLegacyRefreshToken() {
  return readToken(LEGACY_REFRESH)
}

export function consumeLegacyRefreshToken() {
  localStorage.removeItem(LEGACY_REFRESH)
}

export function takeLegacyRefreshToken() {
  const token = peekLegacyRefreshToken()
  consumeLegacyRefreshToken()
  return token
}
