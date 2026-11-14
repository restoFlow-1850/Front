import { describe, it, expect } from 'vitest'

function isReservationValid(form) {
  return Boolean(
    form.customerName?.trim() &&
    form.table &&
    form.date &&
    form.time &&
    Number(form.guests) > 0
  )
}

function formatCustomerPhone(phone) {
  return phone && phone.trim() ? phone.trim() : '—'
}

describe('Reservation validation & display (telefonsiz)', () => {
  it('telefon raqamisiz ham forma to\'g\'ri (valid) deb hisoblanishi kerak', () => {
    const validWithoutPhone = {
      customerName: 'Alisher Karimov',
      customerPhone: '',
      table: 'table-123',
      date: '2026-11-14',
      time: '19:00',
      guests: 4,
    }
    expect(isReservationValid(validWithoutPhone)).toBe(true)
  })

  it('telefon raqami kiritilganda ham forma valid bo\'lishi kerak', () => {
    const validWithPhone = {
      customerName: 'Alisher Karimov',
      customerPhone: '+998901234567',
      table: 'table-123',
      date: '2026-11-14',
      time: '19:00',
      guests: 4,
    }
    expect(isReservationValid(validWithPhone)).toBe(true)
  })

  it('mijoz ismi yoki stol tanlanmagan bo\'lsa valid bo\'lmasligi kerak', () => {
    expect(isReservationValid({ customerName: '', table: 't1', date: '2026-11-14', time: '19:00', guests: 2 })).toBe(false)
    expect(isReservationValid({ customerName: 'Ali', table: '', date: '2026-11-14', time: '19:00', guests: 2 })).toBe(false)
    expect(isReservationValid({ customerName: 'Ali', table: 't1', date: '', time: '19:00', guests: 2 })).toBe(false)
    expect(isReservationValid({ customerName: 'Ali', table: 't1', date: '2026-11-14', time: '19:00', guests: 0 })).toBe(false)
  })

  it('telefon bo\'lmagan yoki bo\'sh bo\'lganda xavfsiz defolt fallback ("—") ko\'rsatilishi kerak', () => {
    expect(formatCustomerPhone('')).toBe('—')
    expect(formatCustomerPhone(null)).toBe('—')
    expect(formatCustomerPhone(undefined)).toBe('—')
    expect(formatCustomerPhone('   ')).toBe('—')
    expect(formatCustomerPhone('+998901234567')).toBe('+998901234567')
  })
})
