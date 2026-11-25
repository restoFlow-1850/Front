import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: {} })) },
}))

import api from '../axios'
import { getReports, getDashboardStats, getDailySales, getTopProducts } from '../dashboardService'

describe('dashboardService', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the canonical /reports endpoint for dashboard stats', async () => {
    await getReports({ from: '2026-11-01' })
    expect(api.get).toHaveBeenCalledWith('/reports', { params: { from: '2026-11-01' } })
  })

  it('getDashboardStats is an alias and never calls the removed /reports/dashboard route', async () => {
    await getDashboardStats()
    expect(api.get).toHaveBeenCalledWith('/reports', { params: undefined })
    expect(api.get).not.toHaveBeenCalledWith('/reports/dashboard', expect.anything())
  })

  it('keeps daily-sales and top-products endpoints unchanged', async () => {
    await getDailySales({ date: '2026-11-25' })
    await getTopProducts({ limit: 5 })
    expect(api.get).toHaveBeenCalledWith('/reports/daily-sales', { params: { date: '2026-11-25' } })
    expect(api.get).toHaveBeenCalledWith('/reports/top-products', { params: { limit: 5 } })
  })
})
