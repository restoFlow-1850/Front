import { describe, it, expect } from 'vitest'
import { stockOf, isSoldOut, canIncreaseBy } from '../stock'

describe('stockOf', () => {
  it('reads the stock field', () => {
    expect(stockOf({ stock: 5 })).toBe(5)
  })

  it('falls back to inStock', () => {
    expect(stockOf({ inStock: 3 })).toBe(3)
  })

  it('parses numeric strings', () => {
    expect(stockOf({ stock: '7' })).toBe(7)
  })

  it('returns null when stock info is missing (no limit)', () => {
    expect(stockOf({})).toBeNull()
    expect(stockOf({ stock: null })).toBeNull()
    expect(stockOf({ stock: '' })).toBeNull()
    expect(stockOf(undefined)).toBeNull()
  })

  it('returns null for non-numeric stock', () => {
    expect(stockOf({ stock: 'many' })).toBeNull()
  })
})

describe('isSoldOut', () => {
  it('is true when stock is 0', () => {
    expect(isSoldOut({ stock: 0 })).toBe(true)
  })

  it('is true when the product is unavailable', () => {
    expect(isSoldOut({ isAvailable: false, stock: 10 })).toBe(true)
  })

  it('is false when stock remains', () => {
    expect(isSoldOut({ stock: 2 })).toBe(false)
  })

  it('is false when stock is unknown', () => {
    expect(isSoldOut({})).toBe(false)
  })
})

describe('canIncreaseBy', () => {
  it('blocks increasing a sold out product', () => {
    expect(canIncreaseBy({ stock: 0 }, 1)).toBe(false)
    expect(canIncreaseBy({ isAvailable: false }, 1)).toBe(false)
  })

  it('allows increasing within the remaining stock', () => {
    expect(canIncreaseBy({ stock: 2 }, 1)).toBe(true)
    expect(canIncreaseBy({ stock: 2 }, 2)).toBe(true)
  })

  it('blocks increasing beyond the remaining stock', () => {
    expect(canIncreaseBy({ stock: 2 }, 3)).toBe(false)
  })

  it('does not limit products without stock info', () => {
    expect(canIncreaseBy({}, 99)).toBe(true)
  })

  it('always allows decreasing so items can be removed', () => {
    expect(canIncreaseBy({ stock: 0 }, -1)).toBe(true)
    expect(canIncreaseBy({ stock: 1 }, -5)).toBe(true)
  })
})
