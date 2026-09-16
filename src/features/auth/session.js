// Sessiya (token + user) localStorage bilan ishlash — yagona joyda.
// Ilgari bu mantiq axios.js, ProtectedRoute.jsx, AppLayout.jsx va LoginForm.jsx
// ichida takrorlanardi va har biri "buzilgan token" holatini boshqacha tekshirardi.

const ACCESS = 'accessToken'
const REFRESH = 'refreshToken'
const USER = 'user'

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

export function saveSession({ user, accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH, refreshToken)
  if (user) localStorage.setItem(USER, JSON.stringify(user))
}

export function clearSession() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(REFRESH)
  localStorage.removeItem(USER)
}
