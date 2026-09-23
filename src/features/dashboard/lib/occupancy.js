import { TABLE_STATUS } from '../../../constants/roles'

/**
 * Dashboard "egallangan stollar" kartasi uchun raqamlarni tayyorlaydi.
 *
 * Asosiy manba — backend hisoblagan `stats.tablesTotal` / `stats.tablesBusy`:
 * `getTables()` limit=20 bilan keladi, shuning uchun lokal ro'yxatdan
 * hisoblasak "1 / 20" kabi noto'g'ri raqam chiqadi (haqiqatda 44 ta stol).
 * Lokal ro'yxat faqat backend javob bermaganda (yoki buzuq qiymat berganda)
 * zaxira sifatida ishlatiladi.
 */
export function resolveTableOccupancy(stats, tables) {
  const source = stats ?? {}
  const list = Array.isArray(tables) ? tables : []

  const busyFromList = list.filter(
    (tbl) => tbl?.status === TABLE_STATUS.BUSY || tbl?.status === TABLE_STATUS.OCCUPIED
  ).length

  // `??` NaN ni ushlamaydi — shuning uchun isFinite (0 esa yaroqli qiymat).
  const total = Number.isFinite(source.tablesTotal) ? source.tablesTotal : list.length
  const rawBusy = Number.isFinite(source.tablesBusy) ? source.tablesBusy : busyFromList

  // Buzuq backend javobida karta ham buzuq ko'rinmasin:
  // manfiy qiymat 0 ga tushadi, band stollar jami stoldan oshmaydi,
  // foiz har doim 0..100 oralig'ida qoladi.
  const safeBusy = Math.max(0, rawBusy)
  const busy = total > 0 ? Math.min(safeBusy, total) : safeBusy

  return {
    total,
    busy,
    // Ishonchli maxraj borligini bildiradi: 0 bo'lsa karta "0 / 0" emas, "—" ko'rsatadi.
    hasTotal: total > 0,
    percent: total > 0 ? Math.round((busy / total) * 100) : 0,
  }
}
