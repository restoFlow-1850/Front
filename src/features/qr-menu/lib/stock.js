// Mehmon menyusidagi qoldiq (stock) mantiqi — 3-hafta: "tugagan" taomni
// to'g'ri ko'rsatish va savatda chegara qo'yish.
//
// Backend qoldiqni turli nomlar bilan qaytarsa ham ishlaydi (stock / inStock).
// null = qoldiq haqida ma'lumot yo'q, demak miqdorni cheklamaymiz.

/** Mahsulotdagi qoldiq soni yoki null. */
export function stockOf(product) {
  const raw = product?.stock ?? product?.inStock
  if (raw === null || raw === undefined || raw === '') return null
  const value = Number(raw)
  return Number.isFinite(value) ? value : null
}

/** Taom tugaganmi: isAvailable=false yoki qoldiq 0. */
export function isSoldOut(product) {
  if (product?.isAvailable === false) return true
  return stockOf(product) === 0
}

/**
 * Keyingi miqdor haqiqatani ko'rsatilishi mumkinmi.
 * `delta` manfiy bo'lsa (kamaytirish/o'chirish) — har doim ruxsat beriladi.
 */
export function canIncreaseBy(product, delta) {
  if (delta <= 0) return true
  if (isSoldOut(product)) return false
  const stock = stockOf(product)
  return stock === null || delta <= stock
}
