// Obuna tugagan (402) hodisasi — axios interceptor bilan banner o'rtasidagi ko'prik.
//
// Backend checkSubscription middleware muddati tugagan restoranga POST/PUT/PATCH/DELETE
// so'rovlarida 402 + code: 'SUBSCRIPTION_EXPIRED' qaytaradi. Bu hodisani bir joyda
// aniqlaymiz va butun ilovaga e'lon qilamiz (banner, toast va h.k. tinglaydi).

export const SUBSCRIPTION_EXPIRED_EVENT = 'restoflow:subscription-expired'
export const SUBSCRIPTION_EXPIRED_TOAST_ID = 'restoflow:subscription-expired-toast'

/** Axios xatosida obuna tugaganini aniqlaydi. */
export function isSubscriptionExpired(error) {
  if (error?.response?.status !== 402) return false

  const data = error.response?.data ?? {}
  const code = data.code ?? data.error?.code ?? (typeof data.error === 'string' ? data.error : null) ?? error.code
  if (code === 'SUBSCRIPTION_EXPIRED') return true

  const message = String(data.message ?? data.error?.message ?? error.message ?? '').toLowerCase()
  return /subscription.{0,30}expired|obuna.{0,40}tugagan|podpiska.{0,40}zakonchil/i.test(message)
}

/** Hodisani global e'lon qiladi (window bo'lmagan muhitda jim o'tadi). */
export function emitSubscriptionExpired(detail = {}) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_EXPIRED_EVENT, { detail }))
  } catch {
    // CustomEvent qo'llab-quvvatlanmasa — banner'siz qolamiz, xato emas
  }
}

/** Hodisani tinglaydi, unsubscribe funksiyasini qaytaradi. */
export function onSubscriptionExpired(listener) {
  if (typeof window === 'undefined') return () => {}
  window.addEventListener(SUBSCRIPTION_EXPIRED_EVENT, listener)
  return () => window.removeEventListener(SUBSCRIPTION_EXPIRED_EVENT, listener)
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function toDaysLeft(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return null
  return Math.max(0, Math.ceil(number))
}

function toDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeSubscriptionStatus(payload) {
  const data = payload?.data ?? payload ?? {}
  const subscription = data.subscription ?? data
  const rawStatus = String(firstDefined(subscription.status, subscription.state, data.status, data.state) ?? '').toLowerCase()
  const isActive = firstDefined(subscription.isActive, subscription.active, data.isActive, data.active)
  const isExpired = firstDefined(subscription.expired, data.expired)
  const isTrial = firstDefined(subscription.trial, data.trial, subscription.isTrial, data.isTrial)
  const endsAtValue = firstDefined(
    subscription.trialEndsAt,
    subscription.endsAt,
    subscription.expiresAt,
    subscription.currentPeriodEnd,
    data.trialEndsAt,
    data.endsAt,
    data.expiresAt,
  )
  const endsAtDate = toDate(endsAtValue)
  const endsAt = endsAtDate ? endsAtDate.toISOString() : null
  let daysLeft = toDaysLeft(firstDefined(subscription.daysLeft, subscription.remainingDays, data.daysLeft, data.remainingDays))

  if (daysLeft === null && endsAtDate) {
    daysLeft = toDaysLeft((endsAtDate.getTime() - Date.now()) / 86_400_000)
  }

  const statusByDate = endsAtDate ? (endsAtDate.getTime() <= Date.now() ? 'expired' : isTrial ? 'trial' : 'active') : null
  const normalizedStatus =
    rawStatus === 'expired' || rawStatus === 'cancelled' || rawStatus === 'canceled' || rawStatus === 'inactive' || isExpired === true || isActive === false || statusByDate === 'expired'
      ? 'expired'
      : rawStatus === 'trial' || isTrial === true || statusByDate === 'trial'
        ? 'trial'
        : rawStatus === 'active' || statusByDate === 'active'
          ? 'active'
          : 'unknown'

  return {
    status: normalizedStatus,
    daysLeft,
    endsAt,
    plan: firstDefined(subscription.plan, subscription.planName, data.plan, data.planName) ?? null,
  }
}
