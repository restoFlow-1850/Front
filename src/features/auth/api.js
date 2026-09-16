// Auth API — Backend/src/routes/auth.routes.js bilan mos.
import axios from '../../services/axios'

export const authApi = {
  login: (credentials) => axios.post('/auth/login', credentials),
  register: (payload) => axios.post('/auth/register', payload),
  forgotPassword: (payload) => axios.post('/auth/forgot-password', payload),
  // DIQQAT: backend `password` nomini kutadi (`newPassword` emas) —
  // Backend/src/validations/auth.validation.js -> resetPassword.
  resetPassword: (payload) => axios.post('/auth/reset-password', payload),
  /** payload: { oldPassword, newPassword } */
  changePassword: (payload) => axios.post('/auth/change-password', payload),
  getMe: () => axios.get('/auth/me'),
  sendOtp: (payload) => axios.post('/auth/send-otp', payload),
  verifyOtp: (payload) => axios.post('/auth/verify-otp', payload),
}

// Authentication failures are expected user-input outcomes, so present an
// actionable message instead of exposing an opaque HTTP status.
export function getAuthErrorMessage(error, fallback) {
  const status = error.response?.status

  if (status === 401) return "Email yoki parol noto'g'ri. Qaytadan urinib ko'ring."
  if (status === 409) return "Bu email allaqachon ro'yxatdan o'tgan. Tizimga kiring yoki boshqa email ishlating."

  return error.response?.data?.message || error.response?.data?.error?.message || fallback
}
