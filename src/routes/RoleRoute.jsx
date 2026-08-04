// Rol darvozasi — marshrutni faqat ruxsat etilgan rollarga ochadi.
// PrivateRoute ichida ishlatiladi (u yerda user allaqachon tiklangan bo'ladi).
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'

export default function RoleRoute({ roles }) {
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)

  if (!roles || roles.length === 0) return <Outlet />

  if (!user?.role) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    // Ruxsat yo'q — 403 sahifasiga yuboramiz (o'z paneliga qaytish tugmasi bilan).
    // Bevosita ROLE_HOME'ga tashlab yuborish "nega ochilmadi?" degan chalkashlik
    // tug'diradi, ayniqsa havola ulashilganda.
    return <Navigate to="/403" state={{ from: location }} replace />
  }

  return <Outlet />
}
