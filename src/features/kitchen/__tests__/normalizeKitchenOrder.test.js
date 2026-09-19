import { test, expect } from 'vitest'
import { normalizeKitchenOrder } from '../api.js'

test('1. null yoki undefined berilganda null qaytarishi kerak', () => {
  expect(normalizeKitchenOrder(null)).toBe(null)
  expect(normalizeKitchenOrder(undefined)).toBe(null)
})

test('2. Backend formatidagi obyektni (items, table.number, waiter.name, isReady) to\'g\'ri normallashtirishi kerak', () => {
  const rawOrder = {
    _id: '64f1a2b3c4d5e6f7a8b9c0d1',
    number: 'ORD-1042',
    table: { number: '5' },
    waiter: { name: 'Aziza' },
    status: 'yangi',
    createdAt: '2026-08-27T10:00:00.000Z',
    notes: 'Piyozsiz',
    items: [
      { _id: 'item_1', name: "Lag'mon", quantity: 2, note: "Achchiq bo'lmasin", isReady: true },
      { _id: 'item_2', product: 'Choy', quantity: 1, comment: "Ko'k choy", status: 'ready' },
      { _id: 'item_3', product: 'Osh', quantity: 1, isDone: false },
    ],
  }

  const result = normalizeKitchenOrder(rawOrder)

  expect(result.id).toBe('64f1a2b3c4d5e6f7a8b9c0d1')
  expect(result.number).toBe('ORD-1042')
  expect(result.table).toBe('5')
  expect(result.waiter).toBe('Aziza')
  expect(result.status).toBe('yangi')
  expect(result.notes).toBe('Piyozsiz')
  expect(result.items.length).toBe(3)

  expect(result.items[0].product).toBe("Lag'mon")
  expect(result.items[0].isReady).toBe(true)
  expect(result.items[0].note).toBe("Achchiq bo'lmasin")

  expect(result.items[1].product).toBe('Choy')
  expect(result.items[1].isReady).toBe(true)
  expect(result.items[1].note).toBe("Ko'k choy")

  expect(result.items[2].product).toBe('Osh')
  expect(result.items[2].isReady).toBe(false)
})

test('3. items, table yoki waiter bo\'sh yoki yetishmayotganda xavfsiz defolt qiymatlarni qaytarishi kerak', () => {
  const minimalOrder = {
    id: 'ord_9999',
  }

  const result = normalizeKitchenOrder(minimalOrder)

  expect(result.id).toBe('ord_9999')
  expect(result.number).toBe('ORD-9999')
  expect(result.table).toBe('—')
  expect(result.waiter).toBe('—')
  expect(result.notes).toBe('')
  expect(result.items).toEqual([])
})
