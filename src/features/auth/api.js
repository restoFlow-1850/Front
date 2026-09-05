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
}