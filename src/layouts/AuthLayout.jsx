// Auth layout — login/register sahifalari uchun (sidebar'siz).
// Mas'ul: Ziyoddila.
import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="auth-layout">
      <Outlet />
    </div>
  )
}
