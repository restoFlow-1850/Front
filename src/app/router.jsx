// Marshrutlar daraxti.
//
// Arxitektura qoidasi: har bir himoyalangan sahifaning ROLLARI shu faylda emas,
// constants/navigation.js dagi NAV_ITEMS'da turadi. Sidebar ham o'sha ro'yxatdan
// quriladi — shuning uchun "menyuda ko'rinadi, lekin ochilmaydi" turidagi
// nomuvofiqlik printsipial ravishda yuzaga kelmaydi.
import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'

import PrivateRoute from '../routes/PrivateRoute'
import PublicRoute from '../routes/PublicRoute'
import RoleRoute from '../routes/RoleRoute'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import { NAV_ITEMS } from '../constants/navigation'
import { ROLE_HOME } from '../constants/roles'

// ─── Ochiq sahifalar ─────────────────────────────────────────────
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const RegisterPage = lazy(() => import('../features/auth/pages/Register'))
const ForgotPasswordPage = lazy(() => import('../features/auth/pages/ForgotPassword'))
const ResetPasswordPage = lazy(() => import('../features/auth/pages/ResetPassword'))
const OTPPage = lazy(() => import('../features/auth/pages/OTP'))
const GuestMenuPage = lazy(() => import('../features/qr-menu/pages/GuestMenuPage'))

// ─── Himoyalangan sahifalar ─────────────────────────────────────
const DashboardPage = lazy(() => import('../features/dashboard/pages/Dashboard'))
const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'))
const WaiterPage = lazy(() => import('../features/orders/pages/WaiterPage'))
const KitchenPage = lazy(() => import('../features/kitchen/pages/KitchenPage'))
const CashierPage = lazy(() => import('../features/cashier/pages/Cashier'))
const MenuPage = lazy(() => import('../features/menu/pages/MenuPage'))
const TablesPage = lazy(() => import('../features/tables/pages/TablesPage'))
const ReservationsPage = lazy(() => import('../features/reservations/pages/ReservationsPage'))
const EmployeesPage = lazy(() => import('../features/employees/pages/EmployeesPage'))
const NotificationsPage = lazy(() => import('../features/notifications/pages/NotificationsPage'))
const ProfilePage = lazy(() => import('../features/auth/pages/Profile'))

const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'))

// NAV_ITEMS.key -> sahifa komponenti. Kalit qo'shilsa-yu, bu yerga element
// yozilmasa, buildProtectedRoutes uni jimgina tashlab ketmaydi — dev rejimida
// konsolga ogohlantirish chiqadi.
const PAGE_BY_KEY = {
  dashboard: <DashboardPage />,
  orders: <OrdersPage />,
  waiter: <WaiterPage />,
  kitchen: <KitchenPage />,
  cashier: <CashierPage />,
  menu: <MenuPage />,
  tables: <TablesPage />,
  reservations: <ReservationsPage />,
  employees: <EmployeesPage />,
  notifications: <NotificationsPage />,
  profile: <ProfilePage />,
}

// Har bandni o'z rollari bilan RoleRoute ichiga o'raydi.
function buildProtectedRoutes() {
  return NAV_ITEMS.map((item) => {
    const element = PAGE_BY_KEY[item.key]
    if (!element) {
      if (import.meta.env.DEV) {
        console.warn(`[router] "${item.key}" uchun sahifa komponenti ulanmagan`)
      }
      return null
    }
    return {
      element: <RoleRoute roles={item.roles} />,
      children: [{ path: item.path, element }],
    }
  }).filter(Boolean)
}

// '/' ga tushgan foydalanuvchini o'z roliga mos panelga yo'naltiradi.
function RoleHomeRedirect() {
  const user = useSelector((state) => state.auth.user)
  return <Navigate to={ROLE_HOME[user?.role] ?? '/login'} replace />
}

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
          { path: '/otp', element: <OTPPage /> },
        ],
      },
    ],
  },

  // QR menyu — mehmon uchun, login talab qilinmaydi.
  { path: '/guest', element: <GuestMenuPage /> },

  {
    element: <PrivateRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <RoleHomeRedirect /> },
          { path: '/403', element: <ForbiddenPage /> },
          ...buildProtectedRoutes(),
        ],
      },
    ],
  },

  { path: '*', element: <NotFoundPage /> },
])