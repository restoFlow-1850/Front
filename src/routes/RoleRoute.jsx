import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { readUser } from '../features/auth/session'

export default function RoleRoute({ roles }) {
  const location = useLocation()
  const reduxUser = useSelector((state) => state.auth.user)
  const user = reduxUser || readUser()

  if (!roles || roles.length === 0) return <Outlet />

  if (!user?.role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/403" state={{ from: location }} replace />
  }

  return <Outlet />
}
