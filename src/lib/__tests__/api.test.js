import { describe, it, expect } from 'vitest'
import { unwrap, unwrapList, unwrapPagination, apiErrorMessage, formatSom, formatDateTime, formatTime } from '../api'

describe('unwrap', () => {
  it('returns data.data when present', () => {
    const res = { data: { data: { order: { id: 1 } } } }
    expect(unwrap(res)).toEqual({ order: { id: 1 } })
  })

  it('extracts a named key from the payload', () => {
    const res = { data: { data: { order: { id: 1 } } } }
    expect(unwrap(res, 'order')).toEqual({ id: 1 })
  })

  it('falls back to data.data when key is missing from payload', () => {
    const res = { data: { data: { order: { id: 1 } } } }
    expect(unwrap(res, 'missingKey')).toEqual({ order: { id: 1 } })
  })

  it('falls back to data when data.data is absent', () => {
    const res = { data: { order: { id: 1 } } }
    expect(unwrap(res)).toEqual({ order: { id: 1 } })
  })

  it('returns undefined when res is null/undefined', () => {
    expect(unwrap(null)).toBeUndefined()
    expect(unwrap(undefined)).toBeUndefined()
  })
})

describe('unwrapList', () => {
  it('returns the array when payload is an array', () => {
    const res = { data: { data: { orders: [{ id: 1 }, { id: 2 }] } } }
    expect(unwrapList(res, 'orders')).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('returns an empty array when payload is not an array', () => {
    const res = { data: { data: { orders: null } } }
    expect(unwrapList(res, 'orders')).toEqual([])
  })

  it('returns an empty array when key is missing entirely', () => {
    const res = { data: { data: {} } }
    expect(unwrapList(res, 'orders')).toEqual([])
  })
})

describe('unwrapPagination', () => {
  it('returns pagination info when present', () => {
    const res = { data: { pagination: { page: 1, total: 10 } } }
    expect(unwrapPagination(res)).toEqual({ page: 1, total: 10 })
  })

  it('returns null when pagination is absent', () => {
    const res = { data: {} }
    expect(unwrapPagination(res)).toBeNull()
  })

  it('returns null when res is undefined', () => {
    expect(unwrapPagination(undefined)).toBeNull()
  })
})

describe('apiErrorMessage', () => {
  it('prefers response.data.message', () => {
    const error = { response: { data: { message: 'Ruxsat yo\'q' } } }
    expect(apiErrorMessage(error)).toBe('Ruxsat yo\'q')
  })

  it('falls back to response.data.error when message is absent', () => {
    const error = { response: { data: { error: 'Server xatosi' } } }
    expect(apiErrorMessage(error)).toBe('Server xatosi')
  })

  it('falls back to error.message when no response data', () => {
    const error = { message: 'Network Error' }
    expect(apiErrorMessage(error)).toBe('Network Error')
  })

  it('falls back to the provided default when nothing is available', () => {
    expect(apiErrorMessage({}, 'Nomalum xato')).toBe('Nomalum xato')
  })

  it('uses the built-in default message when no fallback is given', () => {
    expect(apiErrorMessage({})).toBe('Xatolik yuz berdi')
  })
})

describe('formatSom', () => {
  it('formats a whole number with thousands separators and the so\'m suffix', () => {
    const result = formatSom(245000)
    expect(result).toContain('245')
    expect(result).toContain('000')
    expect(result).toContain('so\'m')
  })

  it('treats null/undefined as zero', () => {
    expect(formatSom(null)).toBe('0 so\'m')
    expect(formatSom(undefined)).toBe('0 so\'m')
  })

  it('formats zero correctly', () => {
    expect(formatSom(0)).toBe('0 so\'m')
  })
})

describe('formatDateTime', () => {
  it('returns the dash placeholder for a falsy value', () => {
    expect(formatDateTime(null)).toBe('—')
    expect(formatDateTime(undefined)).toBe('—')
    expect(formatDateTime('')).toBe('—')
  })

  it('returns the dash placeholder for an invalid date string', () => {
    expect(formatDateTime('not-a-date')).toBe('—')
  })

  it('formats a valid ISO date string', () => {
    const result = formatDateTime('2026-07-25T14:30:00Z')
    expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/)
  })
})

describe('formatTime', () => {
  it('returns the dash placeholder for a falsy value', () => {
    expect(formatTime(null)).toBe('—')
    expect(formatTime(undefined)).toBe('—')
  })

  it('returns the dash placeholder for an invalid date string', () => {
    expect(formatTime('not-a-date')).toBe('—')
  })

  it('formats a valid ISO date string as HH:MM', () => {
    const result = formatTime('2026-07-25T14:30:00Z')
    expect(result).toMatch(/\d{2}:\d{2}/)
  })
})