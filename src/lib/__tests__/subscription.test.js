import { describe, it, expect, beforeEach } from 'vitest'
import {
  SUBSCRIPTION_EXPIRED_EVENT,
  isSubscriptionExpired,
  emitSubscriptionExpired,
  onSubscriptionExpired,
  normalizeSubscriptionStatus,
  extendSubscriptionForDisplay,
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

  it('nested code va xabar bilan ham taniydi', () => {
    expect(isSubscriptionExpired({ response: { status: 402, data: { error: { code: 'SUBSCRIPTION_EXPIRED' } } } })).toBe(true)
    expect(isSubscriptionExpired({ response: { status: 402, data: { message: 'Restoran obunasi muddati tugagan' } } })).toBe(true)
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

describe('normalizeSubscriptionStatus', () => {
  it('trial holatini va backend kunlarini oladi', () => {
    const result = normalizeSubscriptionStatus({
      data: { status: 'trial', daysLeft: 5, trialEndsAt: '2099-01-01T00:00:00.000Z', plan: 'Pro' },
    })

    expect(result).toMatchObject({ status: 'trial', daysLeft: 5, plan: 'Pro' })
    expect(result.endsAt).toBe('2099-01-01T00:00:00.000Z')
  })

  it('o`tgan trialEndsAt ni expired deb biladi', () => {
    expect(normalizeSubscriptionStatus({ data: { trialEndsAt: '2000-01-01T00:00:00.000Z' } }).status).toBe('expired')
  })

  it('isActive=false yoki expired=true ni expired deb biladi', () => {
    expect(normalizeSubscriptionStatus({ data: { isActive: false } }).status).toBe('expired')
    expect(normalizeSubscriptionStatus({ subscription: { expired: true } }).status).toBe('expired')
  })

  it('status yo`q bo`lsa unknown qaytaradi', () => {
    expect(normalizeSubscriptionStatus({}).status).toBe('unknown')
  })
})

describe('extendSubscriptionForDisplay', () => {
  it('tugash sanasini bir oyga uzaytiradi va qolgan kunlarni qayta hisoblaydi', () => {
    const result = extendSubscriptionForDisplay({
      status: 'trial',
      daysLeft: 5,
      endsAt: '2099-01-15T00:00:00.000Z',
      plan: 'Pro',
    })
    const expected = new Date('2099-02-15T00:00:00.000Z').getTime()

    expect(result).toMatchObject({ status: 'trial', plan: 'Pro' })
    expect(result.endsAt).toBe('2099-02-15T00:00:00.000Z')
    expect(result.daysLeft).toBe(Math.ceil((expected - Date.now()) / 86_400_000))
  })

  it('oy oxiridagi sanani keyingi oyning oxirgi kuniga o`tkazadi', () => {
    expect(extendSubscriptionForDisplay({ endsAt: '2099-01-31T00:00:00.000Z' }).endsAt).toBe(
      '2099-02-28T00:00:00.000Z',
    )
  })

  it('tugash sanasi yo`q bo`lsa kunlarga 30 qo`shadi', () => {
    expect(extendSubscriptionForDisplay({ status: 'active', daysLeft: 5 }).daysLeft).toBe(35)
  })

  it('holat yo`q bo`lsa o`zgarishsiz qaytaradi', () => {
    expect(extendSubscriptionForDisplay(null)).toBe(null)
  })
})
