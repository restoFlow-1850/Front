// Backend javob formati bilan ishlash yordamchilari.
//
// Barcha endpointlar { success, message, data, pagination? } ko'rinishida qaytaradi,
// bunda `data` esa { orders: [...] } / { order: {...} } kabi nomlangan konteyner.
// Har sahifada `res.data.data.orders ?? res.data.data ?? res.data` yozib chiqmaslik
// uchun shu yerda bir marta yechamiz.

/** Javobdan `data` ichidagi nomlangan maydonni oladi. */
export function unwrap(res, key) {
  const payload = res?.data?.data ?? res?.data
  if (key && payload && typeof payload === 'object' && key in payload) {
    return payload[key]
  }
  return payload
}

/** Ro'yxat qaytaradigan endpointlar uchun — hamma holatda massiv qaytaradi. */
export function unwrapList(res, key) {
  const value = unwrap(res, key)
  return Array.isArray(value) ? value : []
}

/** Sahifalash ma'lumoti (bo'lmasa null). */
export function unwrapPagination(res) {
  return res?.data?.pagination ?? null
}

/** Backend xato xabarini foydalanuvchiga ko'rsatish uchun matnga aylantiradi. */
export function apiErrorMessage(error, fallback = 'Xatolik yuz berdi') {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  )
}

/** 245000 -> "245 000 so'm" */
export function formatSom(amount) {
  return `${Number(amount ?? 0).toLocaleString('ru-RU')} so'm`
}

/** ISO sana -> "25.07.2026, 14:30" */
export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** ISO sana -> "14:30" */
export function formatTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
