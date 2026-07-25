// Marshrutlar (React Router) — barcha sahifalar shu yerda ulanadi.
// Mas'ul: Ziyodulla. Har feature o'z sahifalarini lazy import qiladi.
import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import ProtectedRoute from '../routes/ProtectedRoute'
import AppLayout from '../layouts/AppLayout'
import AuthLayout from '../layouts/AuthLayout'
import Forbidden from '../components/common/Forbidden'
import { ROLES } from '../constants/roles'

// Sahifalar (har mas'ul o'z feature/pages ichida yaratadi)
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'))
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
const KitchenPage = lazy(() => import('../features/kitchen/pages/KitchenPage'))
const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'))
// const MenuPage = lazy(() => import('../features/menu/pages/MenuPage'))          // Izzat
// const TablesPage = lazy(() => import('../features/tables/pages/TablesPage'))    // Abdugani
// const CashierPage = lazy(() => import('../features/cashier/pages/CashierPage')) // Madina

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/orders', element: <OrdersPage /> },
          // { path: '/menu', element: <MenuPage /> },
          // { path: '/tables', element: <TablesPage /> },
          // { path: '/cashier', element: <CashierPage /> },
          {
            element: <ProtectedRoute roles={[ROLES.CHEF, ROLES.ADMIN, ROLES.MANAGER]} />,
            children: [{ path: '/kitchen', element: <KitchenPage /> }],
          },
        ],
      },
    ],
  },
])
