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
}

export const PERMISSIONS = {
    [ROLES.ADMIN]: ['*'], // hammasi mumkin
    [ROLES.MANAGER]: ['employees:view', 'employees:edit', 'settings:view', 'settings:edit', 'reports:view', 'tables:view', 'orders:view'],
    [ROLES.WAITER]: ['tables:view', 'orders:create', 'orders:view'],
    [ROLES.COOK]: ['orders:view', 'kitchen:update'],
    [ROLES.CASHIER]: ['orders:view', 'cashier:process'],
}

export function can(userRole, permission) {
    if (!userRole) return false
    const allowed = PERMISSIONS[userRole] ?? []
    return allowed.includes('*') || allowed.includes(permission)
}