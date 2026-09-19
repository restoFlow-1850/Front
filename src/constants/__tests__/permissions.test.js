import { describe, it, expect } from 'vitest'
import { can, PERMISSIONS, PERMISSION_LABELS } from '../permissions'
import { ROLES } from '../roles'

describe('can', () => {
  it('returns false when userRole is falsy', () => {
    expect(can(null, 'orders:view')).toBe(false)
    expect(can(undefined, 'orders:view')).toBe(false)
    expect(can('', 'orders:view')).toBe(false)
  })

  it('returns false for a role with no PERMISSIONS entry', () => {
    expect(can('unknown-role', 'orders:view')).toBe(false)
  })

  describe('admin', () => {
    it('can do everything via the wildcard', () => {
      expect(can(ROLES.ADMIN, 'orders:view')).toBe(true)
      expect(can(ROLES.ADMIN, 'employees:edit')).toBe(true)
      expect(can(ROLES.ADMIN, 'kitchen:update')).toBe(true)
      expect(can(ROLES.ADMIN, 'cashier:process')).toBe(true)
      expect(can(ROLES.ADMIN, 'settings:edit')).toBe(true)
    })

    it('can do a permission that is not even in the known list', () => {
      expect(can(ROLES.ADMIN, 'anything:whatsoever')).toBe(true)
    })
  })

  describe('manager', () => {
    it('has employees, settings, reports, tables, orders:view', () => {
      expect(can(ROLES.MANAGER, 'employees:view')).toBe(true)
      expect(can(ROLES.MANAGER, 'employees:edit')).toBe(true)
      expect(can(ROLES.MANAGER, 'settings:view')).toBe(true)
      expect(can(ROLES.MANAGER, 'settings:edit')).toBe(true)
      expect(can(ROLES.MANAGER, 'reports:view')).toBe(true)
      expect(can(ROLES.MANAGER, 'tables:view')).toBe(true)
      expect(can(ROLES.MANAGER, 'orders:view')).toBe(true)
    })

    it('cannot create orders, update kitchen, or process cashier payments', () => {
      expect(can(ROLES.MANAGER, 'orders:create')).toBe(false)
      expect(can(ROLES.MANAGER, 'kitchen:update')).toBe(false)
      expect(can(ROLES.MANAGER, 'cashier:process')).toBe(false)
    })
  })

  describe('waiter', () => {
    it('has tables:view, orders:create, orders:view', () => {
      expect(can(ROLES.WAITER, 'tables:view')).toBe(true)
      expect(can(ROLES.WAITER, 'orders:create')).toBe(true)
      expect(can(ROLES.WAITER, 'orders:view')).toBe(true)
    })

    it('cannot access employees, settings, reports, kitchen, or cashier', () => {
      expect(can(ROLES.WAITER, 'employees:view')).toBe(false)
      expect(can(ROLES.WAITER, 'settings:view')).toBe(false)
      expect(can(ROLES.WAITER, 'reports:view')).toBe(false)
      expect(can(ROLES.WAITER, 'kitchen:update')).toBe(false)
      expect(can(ROLES.WAITER, 'cashier:process')).toBe(false)
    })
  })

  describe('cook', () => {
    it('has orders:view and kitchen:update', () => {
      expect(can(ROLES.COOK, 'orders:view')).toBe(true)
      expect(can(ROLES.COOK, 'kitchen:update')).toBe(true)
    })

    it('cannot create orders, view employees/settings/reports, or process cashier', () => {
      expect(can(ROLES.COOK, 'orders:create')).toBe(false)
      expect(can(ROLES.COOK, 'employees:view')).toBe(false)
      expect(can(ROLES.COOK, 'settings:view')).toBe(false)
      expect(can(ROLES.COOK, 'reports:view')).toBe(false)
      expect(can(ROLES.COOK, 'cashier:process')).toBe(false)
    })
  })

  describe('cashier', () => {
    it('has orders:view and cashier:process', () => {
      expect(can(ROLES.CASHIER, 'orders:view')).toBe(true)
      expect(can(ROLES.CASHIER, 'cashier:process')).toBe(true)
    })

    it('cannot create orders, update kitchen, or view employees/settings/reports', () => {
      expect(can(ROLES.CASHIER, 'orders:create')).toBe(false)
      expect(can(ROLES.CASHIER, 'kitchen:update')).toBe(false)
      expect(can(ROLES.CASHIER, 'employees:view')).toBe(false)
      expect(can(ROLES.CASHIER, 'settings:view')).toBe(false)
      expect(can(ROLES.CASHIER, 'reports:view')).toBe(false)
    })
  })
})

describe('PERMISSIONS shape', () => {
  it('every role except admin has an explicit array (no wildcard leakage)', () => {
    const nonAdminRoles = [ROLES.MANAGER, ROLES.WAITER, ROLES.COOK, ROLES.CASHIER]
    nonAdminRoles.forEach((role) => {
      expect(PERMISSIONS[role]).not.toContain('*')
    })
  })

  it('every permission referenced in PERMISSIONS has a label', () => {
    const allPermissions = new Set()
    Object.values(PERMISSIONS).forEach((list) => {
      list.forEach((perm) => {
        if (perm !== '*') allPermissions.add(perm)
      })
    })
    allPermissions.forEach((perm) => {
      expect(PERMISSION_LABELS[perm]).toBeDefined()
    })
  })
})