import { ROLES } from './roles'

// Har rol nima qila olishini shu yerda belgilaymiz.
export const PERMISSION_LABELS = {
    'employees:view': 'Xodimlarni ko\'rish',
    'employees:edit': 'Xodimlarni tahrirlash',
    'settings:view': 'Sozlamalarni ko\'rish',
    'settings:edit': 'Sozlamalarni tahrirlash',
    'reports:view': 'Hisobotlarni ko\'rish',
    'tables:view': 'Stollarni ko\'rish',
    'orders:view': 'Buyurtmalarni ko\'rish',
    'orders:create': 'Buyurtma yaratish',
    'kitchen:update': 'Oshxonani boshqarish',
    'cashier:process': 'To\'lovni qabul qilish',
    'payments:view': 'To\'lovlar yozuvlarini ko\'rish',
}

export const PERMISSIONS = {
    [ROLES.ADMIN]: ['*'], // hammasi mumkin
    [ROLES.MANAGER]: ['employees:view', 'employees:edit', 'settings:view', 'settings:edit', 'reports:view', 'tables:view', 'orders:view', 'payments:view'],
    [ROLES.WAITER]: ['tables:view', 'orders:create', 'orders:view', 'payments:view'],
    [ROLES.COOK]: ['orders:view', 'kitchen:update', 'payments:view'],
    [ROLES.CASHIER]: ['orders:view', 'cashier:process', 'payments:view'],
}

export function can(userRole, permission) {
    if (!userRole) return false
    const allowed = PERMISSIONS[userRole] ?? []
    return allowed.includes('*') || allowed.includes(permission)
}