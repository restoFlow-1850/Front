// Obuna tugagan (402) hodisasi — axios interceptor bilan banner o'rtasidagi ko'prik.
//
// Backend checkSubscription middleware muddati tugagan restoranga POST/PUT/PATCH/DELETE
// so'rovlarida 402 + code: 'SUBSCRIPTION_EXPIRED' qaytaradi. Bu hodisani bir joyda
// aniqlaymiz va butun ilovaga e'lon qilamiz (banner, toast va h.k. tinglaydi).

export const SUBSCRIPTION_EXPIRED_EVENT = 'restoflow:subscription-expired'

/** Axios xatosida obuna tugaganini aniqlaydi. */
export function isSubscriptionExpired(error) {
  return error?.response?.status === 402 && error?.response?.data?.code === 'SUBSCRIPTION_EXPIRED'
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
