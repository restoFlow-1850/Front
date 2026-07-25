// Himoyalangan marshrut — token va (agar berilgan bo'lsa) rolga qarab kirishni cheklaydi.
// Mas'ul: Ziyodulla (Fayoz bilan auth holati bo'yicha).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/403" replace />
  }

  return <Outlet />
}
