// Sessiya (token + user) localStorage bilan ishlash — yagona joyda.
// Ilgari bu mantiq axios.js, ProtectedRoute.jsx, AppLayout.jsx va LoginForm.jsx
// ichida takrorlanardi va har biri "buzilgan token" holatini boshqacha tekshirardi.

//
// #18: refresh token endi localStorage'da SAQLANMAYDI — backend uni httpOnly
// cookie'da beradi (JavaScript o'qiy olmaydi → XSS'da o'g'irlanmaydi).
// Bu yerda faqat access token (qisqa muddatli) va user qoladi.

const ACCESS = 'accessToken'
const LEGACY_REFRESH = 'refreshToken' // eski versiyalardan qolgan kalit — o'chiriladi
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

// refreshToken body'da kelsa ham (backend o'tish davri) — ataylab e'tiborsiz qoldiriladi
export function saveSession({ user, accessToken }) {
  if (accessToken) localStorage.setItem(ACCESS, accessToken)
  if (user) localStorage.setItem(USER, JSON.stringify(user))
  localStorage.removeItem(LEGACY_REFRESH)
}

export function clearSession() {
  localStorage.removeItem(ACCESS)
  localStorage.removeItem(LEGACY_REFRESH)
  localStorage.removeItem(USER)
}

// Eski versiyadan qolgan refresh token: refresh paytida bir marta body'da
// yuboriladi (backend cookie o'rnatadi), keyin o'chiriladi. Yangi login'larda bo'lmaydi.
export function takeLegacyRefreshToken() {
  const token = readToken(LEGACY_REFRESH)
  localStorage.removeItem(LEGACY_REFRESH)
  return token
}
