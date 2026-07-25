// Himoyalangan marshrut — token va rolga qarab kirishni cheklaydi.
// Mas'ul: Ziyoddila (Fayoz bilan auth holati bo'yicha).
import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute({ roles: _roles }) {
  const token = localStorage.getItem('accessToken')
  // const { user } = useAuth() // Fayoz: auth slice'dan

  if (!token) return <Navigate to="/login" replace />

  // Rol tekshiruvi (kerak bo'lsa):
  // if (roles && !roles.includes(user?.role)) return <Navigate to="/" replace />

  return <Outlet />
}
