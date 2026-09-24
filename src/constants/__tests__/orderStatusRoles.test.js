import { describe, it, expect } from 'vitest'
import { ORDER_STATUS, ROLES, canSetOrderStatus, NEXT_ORDER_STATUS } from '../roles'

// Backend order.service.STATUS_ROLES (PR #23) bilan bir xil bo'lishi kerak.
describe('canSetOrderStatus', () => {
  it('only kitchen (and admin/manager) can mark an order ready', () => {
    expect(canSetOrderStatus(ROLES.COOK, ORDER_STATUS.READY)).toBe(true)
    expect(canSetOrderStatus(ROLES.WAITER, ORDER_STATUS.READY)).toBe(false)
    expect(canSetOrderStatus(ROLES.CASHIER, ORDER_STATUS.READY)).toBe(false)
  })

  it('cook and cashier cannot cancel, waiter can', () => {
    expect(canSetOrderStatus(ROLES.COOK, ORDER_STATUS.CANCELLED)).toBe(false)
    expect(canSetOrderStatus(ROLES.CASHIER, ORDER_STATUS.CANCELLED)).toBe(false)
    expect(canSetOrderStatus(ROLES.WAITER, ORDER_STATUS.CANCELLED)).toBe(true)
  })

  it('cook cannot serve or close; cashier can close', () => {
    expect(canSetOrderStatus(ROLES.COOK, ORDER_STATUS.SERVED)).toBe(false)
    expect(canSetOrderStatus(ROLES.COOK, ORDER_STATUS.CLOSED)).toBe(false)
    expect(canSetOrderStatus(ROLES.CASHIER, ORDER_STATUS.CLOSED)).toBe(true)
  })

  it('admin and manager can perform every forward transition', () => {
    for (const next of Object.values(NEXT_ORDER_STATUS).filter(Boolean)) {
      expect(canSetOrderStatus(ROLES.ADMIN, next)).toBe(true)
      expect(canSetOrderStatus(ROLES.MANAGER, next)).toBe(true)
    }
  })

  it('returns false for missing role or status', () => {
    expect(canSetOrderStatus(undefined, ORDER_STATUS.READY)).toBe(false)
    expect(canSetOrderStatus(ROLES.ADMIN, null)).toBe(false)
  })
})
