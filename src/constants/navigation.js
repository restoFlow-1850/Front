// Navigatsiya — YAGONA MANBA (single source of truth).
// Marshrutlar (app/router.jsx) ham, sidebar (layouts/AppLayout.jsx) ham shu
// ro'yxatdan oziqlanadi. Yangi sahifa qo'shganda faqat shu yerga yozing —
// rol tekshiruvi va menyu avtomatik moslashadi.
import {
  LayoutDashboard,
  ClipboardList,
  ChefHat,
  Wallet,
  UtensilsCrossed,
  Grid3X3,
  CalendarDays,
  Users,
  Bell,
  Settings,
} from 'lucide-react'

import { ROLES } from './roles'

const ALL = [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER, ROLES.COOK]
const STAFF = [ROLES.ADMIN, ROLES.MANAGER]

/**
 * roles — sahifani ko'ra oladigan rollar.
 * inSidebar — menyuda ko'rinadimi (profil kabi sahifalar ko'rinmaydi).
 */
export const NAV_ITEMS = [
  {
    key: 'dashboard',
    path: '/dashboard',
    label: 'Boshqaruv paneli',
    icon: LayoutDashboard,
    roles: STAFF,
    inSidebar: true,
  },
  {
    key: 'orders',
    path: '/orders',
    label: 'Buyurtmalar',
    icon: ClipboardList,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER, ROLES.CASHIER],
    inSidebar: true,
  },
  {
    key: 'waiter',
    path: '/waiter',
    label: 'Ofitsiant paneli',
    icon: UtensilsCrossed,
    roles: [ROLES.WAITER, ROLES.ADMIN, ROLES.MANAGER],
    inSidebar: true,
  },
  {
    key: 'kitchen',
    path: '/kitchen',
    label: 'Oshxona',
    icon: ChefHat,
    roles: [ROLES.COOK, ROLES.ADMIN, ROLES.MANAGER],
    inSidebar: true,
  },
  {
    key: 'cashier',
    path: '/cashier',
    label: 'Kassa',
    icon: Wallet,
    roles: [ROLES.CASHIER, ROLES.ADMIN, ROLES.MANAGER],
    inSidebar: true,
  },
  {
    key: 'menu',
    path: '/menu',
    label: 'Menyu',
    icon: UtensilsCrossed,
    roles: ALL,
    inSidebar: true,
  },
  {
    key: 'tables',
    path: '/tables',
    label: 'Stollar',
    icon: Grid3X3,
    roles: ALL,
    inSidebar: true,
  },
  {
    key: 'reservations',
    path: '/reservations',
    label: 'Bronlar',
    icon: CalendarDays,
    roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.WAITER],
    inSidebar: true,
  },
  {
    key: 'employees',
    path: '/employees',
    label: 'Xodimlar',
    icon: Users,
    roles: STAFF,
    inSidebar: true,
  },
  {
    key: 'notifications',
    path: '/notifications',
    label: 'Bildirishnomalar',
    icon: Bell,
    roles: ALL,
    inSidebar: true,
  },
  {
    key: 'profile',
    path: '/profile',
    label: 'Profil',
    icon: Settings,
    roles: ALL,
    inSidebar: false,
  },
]

/** Sidebar uchun — faqat shu rol ko'ra oladigan bandlar. */
export function navItemsForRole(role) {
  return NAV_ITEMS.filter((item) => item.inSidebar && item.roles.includes(role))
}

/** Marshrutni himoyalash uchun — shu yo'lga ruxsat etilgan rollar. */
export function rolesForPath(path) {
  return NAV_ITEMS.find((item) => item.path === path)?.roles ?? []
}
