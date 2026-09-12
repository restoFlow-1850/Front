// Ochiq marshrut (login, register, parol tiklash) — allaqachon kirgan
// foydalanuvchini o'z paneliga qaytaradi.
import { useSelector } from 'react-redux'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { readToken, readUser } from '../features/auth/session'
import { resolveRedirect } from '../constants/navigation'

export default function PublicRoute() {
  const location = useLocation()
  const { accessToken, user } = useSelector((state) => state.auth)
  const token = accessToken || readToken('accessToken')
  const currentUser = user || readUser()

  if (token) {
    const target = resolveRedirect(location.state?.from, currentUser?.role)
    return <Navigate to={target} replace />
  }

  return <Outlet />
}
