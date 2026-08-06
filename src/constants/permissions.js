import { ROLES } from './roles'

// Har rol nima qila olishini shu yerda belgilaymiz.
const PERMISSIONS = {
    [ROLES.ADMIN]: ['*'], // hammasi mumkin
    [ROLES.MANAGER]: ['employees:view', 'employees:edit', 'reports:view', 'tables:view', 'orders:view'],
    [ROLES.WAITER]: ['tables:view', 'orders:create', 'orders:view'],
    [ROLES.CHEF]: ['orders:view', 'kitchen:update'],
    [ROLES.CASHIER]: ['orders:view', 'cashier:process'],
}

export function can(userRole, permission) {
    if (!userRole) return false
    const allowed = PERMISSIONS[userRole] ?? []
    return allowed.includes('*') || allowed.includes(permission)
}