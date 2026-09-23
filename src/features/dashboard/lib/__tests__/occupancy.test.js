import { describe, it, expect } from 'vitest'
import { resolveTableOccupancy } from '../occupancy'
import { TABLE_STATUS } from '../../../../constants/roles'

const table = (status) => ({ status })

describe('resolveTableOccupancy — dashboard stollar kartasi', () => {
  // KRITIK: getTables() limit=20 bilan keladi — lokal hisob "1/20" berardi,
  // haqiqiy raqam esa backendda (44 ta stol). Backend ustuvor bo'lishi shart.
  it("backend hisoblagichi lokal ro'yxatdan ustuvor", () => {
    const res = resolveTableOccupancy(
      { tablesTotal: 44, tablesBusy: 5 },
      [table(TABLE_STATUS.BUSY)]
    )
    expect(res).toEqual({ total: 44, busy: 5, hasTotal: true, percent: 11 })
  })

  it("backend javob bermasa lokal ro'yxatdan hisoblaydi", () => {
    const res = resolveTableOccupancy({}, [
      table(TABLE_STATUS.BUSY),
      table(TABLE_STATUS.BUSY),
      table(TABLE_STATUS.AVAILABLE),
    ])
    expect(res).toEqual({ total: 3, busy: 2, hasTotal: true, percent: 67 })
  })

  it("stats umuman yo'q bo'lsa ham yiqilmaydi", () => {
    expect(resolveTableOccupancy(undefined, undefined)).toEqual({
      total: 0,
      busy: 0,
      hasTotal: false,
      percent: 0,
    })
    expect(resolveTableOccupancy(null, null).hasTotal).toBe(false)
    expect(resolveTableOccupancy({}, 'not-an-array').total).toBe(0)
  })

  it('NaN qiymat lokal hisobga qaytadi (karta "NaN / 44" chiqarmaydi)', () => {
    const res = resolveTableOccupancy(
      { tablesTotal: 44, tablesBusy: Number.NaN },
      [table(TABLE_STATUS.BUSY), table(TABLE_STATUS.BUSY)]
    )
    expect(res).toEqual({ total: 44, busy: 2, hasTotal: true, percent: 5 })
  })

  it('band stollar jami stoldan oshsa ham foiz 100 dan oshmaydi', () => {
    const res = resolveTableOccupancy({ tablesTotal: 3, tablesBusy: 5 }, [])
    expect(res).toEqual({ total: 3, busy: 3, hasTotal: true, percent: 100 })
  })

  it('manfiy qiymat 0 ga tushadi (foiz manfiy chiqmaydi)', () => {
    const res = resolveTableOccupancy({ tablesTotal: 44, tablesBusy: -1 }, [])
    expect(res.busy).toBe(0)
    expect(res.percent).toBe(0)
  })

  it('backend 0 stol qaytarsa hasTotal false, "0 / 0" karta ko\'rsatilmaydi', () => {
    const res = resolveTableOccupancy({ tablesTotal: 0, tablesBusy: 3 }, [])
    expect(res.hasTotal).toBe(false)
    expect(res.total).toBe(0)
    expect(res.percent).toBe(0)
  })

  it('0 qiymati yaroqli: isFinite(0) lokal ro\'yxatga almashtirmaydi', () => {
    const res = resolveTableOccupancy({ tablesTotal: 10, tablesBusy: 0 }, [
      table(TABLE_STATUS.BUSY),
      table(TABLE_STATUS.BUSY),
    ])
    expect(res).toEqual({ total: 10, busy: 0, hasTotal: true, percent: 0 })
  })
})
