import { describe, it, expect } from 'vitest'
import { parseHallsAndTablesInput, generateStaffAccounts, DEMO_MENU_DATA } from '../wizardParsers'

describe('parseHallsAndTablesInput — zallar va stollar matnini parsingi', () => {
  it('matnni to\'g\'ri zal va stollarga ajratadi', () => {
    const input = `Asosiy zal: 20 stol\nVIP zal: 5 stol\nTeras - 10 stol`
    const result = parseHallsAndTablesInput(input)

    expect(result).toHaveLength(3)
    expect(result[0]).toEqual({
      name: 'Asosiy zal',
      count: 20,
      tables: expect.arrayContaining([
        expect.objectContaining({ number: 1, name: 'Asosiy zal — 1-stol' }),
        expect.objectContaining({ number: 20, name: 'Asosiy zal — 20-stol' }),
      ]),
    })
    expect(result[1].name).toBe('VIP zal')
    expect(result[1].count).toBe(5)
    expect(result[2].name).toBe('Teras')
    expect(result[2].count).toBe(10)
  })

  it('bo\'sh matn yoki null berilganda bo\'sh massiv qaytaradi', () => {
    expect(parseHallsAndTablesInput('')).toEqual([])
    expect(parseHallsAndTablesInput(null)).toEqual([])
  })
})

describe('generateStaffAccounts — 5 rol uchun xodimlar paroli', () => {
  it('5 ta rolni to\'liq generatsiya qiladi va parollari mavjud bo\'ladi', () => {
    const accounts = generateStaffAccounts('Rayhon')
    expect(accounts).toHaveLength(5)
    expect(accounts.map((a) => a.roleName)).toEqual(['ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'COOK'])
    expect(accounts[0].username).toBe('admin_rayhon')
    expect(accounts[0].password).toMatch(/^Resto#/)
  })
})

describe('DEMO_MENU_DATA — demo menyu elementlari', () => {
  it('kamida 8 ta taom va narxlarga ega bo\'ladi', () => {
    expect(DEMO_MENU_DATA.length).toBeGreaterThanOrEqual(8)
    expect(DEMO_MENU_DATA[0]).toHaveProperty('nom')
    expect(DEMO_MENU_DATA[0]).toHaveProperty('narx')
  })
})
