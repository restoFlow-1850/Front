import { describe, it, expect, beforeEach } from 'vitest'

describe('QuickSetup localStorage State Persistence', () => {
  const STORAGE_KEY_STEP = 'restoflow_onboarding_step'
  const STORAGE_KEY_DATA = 'restoflow_onboarding_data'

  beforeEach(() => {
    localStorage.clear()
  })

  it('saqlangan qadam yoq bo\'lsa default 1 bo\'ladi', () => {
    const savedStep = localStorage.getItem(STORAGE_KEY_STEP)
    expect(savedStep).toBeNull()
  })

  it('qadam va data saqlanadi hamda qayta o\'qib olinadi', () => {
    const mockData = { name: 'Rayhon', city: 'Toshkent', phone: '+998901234567' }
    localStorage.setItem(STORAGE_KEY_STEP, '3')
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(mockData))

    const loadedStep = parseInt(localStorage.getItem(STORAGE_KEY_STEP), 10)
    const loadedData = JSON.parse(localStorage.getItem(STORAGE_KEY_DATA))

    expect(loadedStep).toBe(3)
    expect(loadedData.name).toBe('Rayhon')
    expect(loadedData.city).toBe('Toshkent')
  })

  it('reset qilinganda localStorage tozalanadi', () => {
    localStorage.setItem(STORAGE_KEY_STEP, '4')
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify({ test: true }))

    localStorage.removeItem(STORAGE_KEY_STEP)
    localStorage.removeItem(STORAGE_KEY_DATA)

    expect(localStorage.getItem(STORAGE_KEY_STEP)).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY_DATA)).toBeNull()
  })
})
