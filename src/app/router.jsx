// Marshrutlar (React Router) — barcha sahifalar shu yerda ulanadi.
// Mas'ul: Ziyoddila. Har feature o'z sahifalarini lazy import qiladi.
import { createBrowserRouter } from 'react-router-dom'
import { lazy } from 'react'
import AppLayout from '../layouts/AppLayout'

const WaiterPage = lazy(() => import('../features/waiter/Waiter'))
const ReservationsPage = lazy(() => import('../features/reservations/pages/ReservationsPage')) // Behruz Shogirt
const CategoriesPage = lazy(() => import('../features/menu/pages/CategoriesPage'))              // Izzat
// const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'))
// const TablesPage = lazy(() => import('../features/tables/pages/TablesPage'))    // Abdugani
// const OrdersPage = lazy(() => import('../features/orders/pages/OrdersPage'))    // Abdugani
// const KitchenPage = lazy(() => import('../features/kitchen/pages/KitchenPage')) // Ziyoddila
// const CashierPage = lazy(() => import('../features/cashier/pages/CashierPage')) // Madina

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <WaiterPage /> },
      { path: '/reservations', element: <ReservationsPage /> },
      { path: '/menu/categories', element: <CategoriesPage /> },
      // { path: '/dashboard', element: <DashboardPage /> },
    ],
  },
])
