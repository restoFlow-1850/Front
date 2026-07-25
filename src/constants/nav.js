// Sidebar navigatsiyasi — har bandda ruxsat etilgan rollar ko'rsatiladi.
// roles: undefined = hammaga ko'rinadi.
import {
  LayoutDashboard,
  ChefHat,
  ClipboardList,
  Grid2x2,
  UtensilsCrossed,
  QrCode,
  Wallet,
  CalendarClock,
  Users,
  Bell,
  Settings,
} from 'lucide-react'
import { ROLES } from './roles'

export const NAV_ITEMS = [
  { key: 'dashboard', to: '/', icon: LayoutDashboard },
  {
    key: 'kitchen',
    to: '/kitchen',
    icon: ChefHat,
    roles: [ROLES.CHEF, ROLES.ADMIN, ROLES.MANAGER],
  },
  { key: 'orders', to: '/orders', icon: ClipboardList },
  { key: 'tables', to: '/tables', icon: Grid2x2 },
  { key: 'menu', to: '/menu', icon: UtensilsCrossed },
  { key: 'qrMenu', to: '/qr-menu', icon: QrCode },
  {
    key: 'cashier',
    to: '/cashier',
    icon: Wallet,
    roles: [ROLES.CASHIER, ROLES.ADMIN, ROLES.MANAGER],
  },
  { key: 'reservations', to: '/reservations', icon: CalendarClock },
  {
    key: 'employees',
    to: '/employees',
    icon: Users,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
  { key: 'notifications', to: '/notifications', icon: Bell },
  {
    key: 'settings',
    to: '/settings',
    icon: Settings,
    roles: [ROLES.ADMIN, ROLES.MANAGER],
  },
]
