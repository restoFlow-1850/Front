import { describe, it, expect, beforeEach } from 'vitest'
import {
  SUBSCRIPTION_EXPIRED_EVENT,
  isSubscriptionExpired,
  emitSubscriptionExpired,
  onSubscriptionExpired,
} from '../subscription'

const expiredError = {
  response: {
    status: 402,
    data: { success: false, message: "Restoran obunasi muddati tugagan", code: 'SUBSCRIPTION_EXPIRED' },
  },
}

describe('isSubscriptionExpired', () => {
  it('402 + SUBSCRIPTION_EXPIRED kodini taniydi', () => {
    expect(isSubscriptionExpired(expiredError)).toBe(true)
  })

  it('boshqa 402 (kodsiz) ni obuna deb hisoblamaydi', () => {
    expect(isSubscriptionExpired({ response: { status: 402, data: {} } })).toBe(false)
  })

  it('401/500 ni obuna deb hisoblamaydi', () => {
    expect(isSubscriptionExpired({ response: { status: 401 } })).toBe(false)
    expect(isSubscriptionExpired({ response: { status: 500 } })).toBe(false)
  })

  it('javobsiz xato (tarmoq xatosi) xavfli emas', () => {
    expect(isSubscriptionExpired({})).toBe(false)
    expect(isSubscriptionExpired(undefined)).toBe(false)
  })
})

describe('emit/onSubscriptionExpired', () => {
  let unsubscribe

  beforeEach(() => {
    unsubscribe?.()
    unsubscribe = undefined
  })

  it('emit -> listener detail bilan chaqiriladi', () => {
    const seen = []
    unsubscribe = onSubscriptionExpired((event) => seen.push(event.detail))
    emitSubscriptionExpired({ message: 'tugagan' })
    expect(seen).toEqual([{ message: 'tugagan' }])
  })

  it('unsubscribe dan keyin listener chaqirilmaydi', () => {
    let called = 0
    const off = onSubscriptionExpired(() => { called += 1 })
    off()
    emitSubscriptionExpired({})
    expect(called).toBe(0)
  })

  it('event nomi barqaror (banner ham shu nomni tinglaydi)', () => {
    expect(SUBSCRIPTION_EXPIRED_EVENT).toBe('restoflow:subscription-expired')
    const names = []
    unsubscribe = onSubscriptionExpired(() => names.push(SUBSCRIPTION_EXPIRED_EVENT))
    emitSubscriptionExpired({})
    expect(names).toEqual([SUBSCRIPTION_EXPIRED_EVENT])
  })
})
