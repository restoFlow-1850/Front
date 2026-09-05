// TABLE_STATUS_LABELS uchun 2 ta test.
//
// Nima uchun aynan shu ikkitasi: bu loyihada TABLE_STATUS ikki xil faylda
// (constants/roles.js va constants/tableStatus.js) mos kelmaydigan holda
// takrorlangan edi, va birlashtirilganda label'lar tasodifan noto'g'ri tilga
// (ruscha) almashtirilib qo'yilgan edi. Bu testlar aynan shu turdagi
// regressiyani avtomatik tutib olish uchun yozilgan:
//   1) har bir statusga label mavjudligini tekshiradi (to'liqlik)
//   2) label matnlari aniq kutilgan (o'zbekcha) qiymatlarga teng ekanini
//      tekshiradi (til/qiymat regressiyasi)
import { describe, expect, it } from 'vitest'
import { TABLE_STATUS, TABLE_STATUS_LABELS } from './tableStatus'

describe('TABLE_STATUS_LABELS', () => {
  it('has a label for every TABLE_STATUS value (no missing translations)', () => {
    Object.values(TABLE_STATUS).forEach((statusValue) => {
      expect(TABLE_STATUS_LABELS[statusValue]).toBeTruthy()
      expect(typeof TABLE_STATUS_LABELS[statusValue]).toBe('string')
    })
  })

  it('uses the expected Uzbek text for each status (guards against language regressions)', () => {
    expect(TABLE_STATUS_LABELS[TABLE_STATUS.AVAILABLE]).toBe("Bo'sh")
    expect(TABLE_STATUS_LABELS[TABLE_STATUS.OCCUPIED]).toBe('Band')
    expect(TABLE_STATUS_LABELS[TABLE_STATUS.RESERVED]).toBe('Bron qilingan')
    expect(TABLE_STATUS_LABELS[TABLE_STATUS.CLEANING]).toBe('Tozalanmoqda')
  })
})
