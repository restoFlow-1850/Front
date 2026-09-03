import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeKitchenOrder } from '../api.js'

test('1. null yoki undefined berilganda null qaytarishi kerak', () => {
  assert.equal(normalizeKitchenOrder(null), null)
  assert.equal(normalizeKitchenOrder(undefined), null)
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

  assert.equal(result.id, '64f1a2b3c4d5e6f7a8b9c0d1')
  assert.equal(result.number, 'ORD-1042')
  assert.equal(result.table, '5')
  assert.equal(result.waiter, 'Aziza')
  assert.equal(result.status, 'yangi')
  assert.equal(result.notes, 'Piyozsiz')
  assert.equal(result.items.length, 3)

  assert.equal(result.items[0].product, "Lag'mon")
  assert.equal(result.items[0].isReady, true)
  assert.equal(result.items[0].note, "Achchiq bo'lmasin")

  assert.equal(result.items[1].product, 'Choy')
  assert.equal(result.items[1].isReady, true)
  assert.equal(result.items[1].note, "Ko'k choy")

  assert.equal(result.items[2].product, 'Osh')
  assert.equal(result.items[2].isReady, false)
})

test('3. items, table yoki waiter bo\'sh yoki yetishmayotganda xavfsiz defolt qiymatlarni qaytarishi kerak', () => {
  const minimalOrder = {
    id: 'ord_9999',
  }

  const result = normalizeKitchenOrder(minimalOrder)

  assert.equal(result.id, 'ord_9999')
  assert.equal(result.number, 'ORD-9999')
  assert.equal(result.table, '—')
  assert.equal(result.waiter, '—')
  assert.equal(result.notes, '')
  assert.deepEqual(result.items, [])
})
