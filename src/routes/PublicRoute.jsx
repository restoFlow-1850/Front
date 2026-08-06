// Ochiq marshrut (login, register, parol tiklash) — allaqachon kirgan
// foydalanuvchini o'z paneliga qaytaradi.
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { readToken } from '../features/auth/session'
import { ROLE_HOME } from '../constants/roles'

export default function PublicRoute() {
  const location = useLocation()
  const { accessToken, user } = useSelector((state) => state.auth)
  const token = accessToken || readToken('accessToken')

  if (token) {
    const from = location.state?.from?.pathname
    return <Navigate to={from || ROLE_HOME[user?.role] || '/'} replace />
  }

  return <Outlet />
}
