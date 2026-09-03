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
  ScrollText,
  SlidersHorizontal,
} from 'lucide-react'

import { ROLES, ROLE_HOME } from './roles.js'

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
    key: 'settings',
    path: '/settings',
    label: 'Sozlamalar',
    icon: SlidersHorizontal,
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
  if (!path) return []
  const cleanPath = path.split('?')[0].split('#')[0].replace(/\/+$/, '') || '/'
  return NAV_ITEMS.find((item) => item.path === cleanPath)?.roles ?? []
}

/**
 * Login yoki PublicRoute'dan keyin xavfsiz yo'naltirish manzilini aniqlaydi.
 *
 * @param {string | { pathname?: string, search?: string, hash?: string }} from
 * @param {string} role
 * @returns {string}
 */
export function resolveRedirect(_from, role) {
  return (role && ROLE_HOME[role]) ? ROLE_HOME[role] : '/'
}

