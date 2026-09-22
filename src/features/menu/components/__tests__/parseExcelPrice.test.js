import { describe, it, expect } from 'vitest'
import { parseExcelPrice } from '../ExcelImportModal.jsx'

describe('parseExcelPrice — narx parsingi (ming ajratgichlar)', () => {
  // KRITIK: "45.000" avval parseFloat bilan 45 qaytarardi (1000 marta kichrayardi)
  it('"45.000" → 45000 (nuqta ming ajratgich sifatida o\'qiladi)', () => {
    expect(parseExcelPrice('45.000')).toBe(45000)
  })

  it('"1 250 000" → 1250000 (probel ming ajratgich)', () => {
    expect(parseExcelPrice('1 250 000')).toBe(1250000)
  })

  it('"45000" → 45000 (ajratgichsiz butun son o\'zgarmaydi)', () => {
    expect(parseExcelPrice('45000')).toBe(45000)
  })

  it('"1.250.000" → 1250000 (ko\'p nuqtali)', () => {
    expect(parseExcelPrice('1.250.000')).toBe(1250000)
  })

  it('"1,250,000" → 1250000 (vergul ajratgich)', () => {
    expect(parseExcelPrice('1,250,000')).toBe(1250000)
  })

  it('"1 250 000 so\'m" → 1250000 (matn ichidan tozalaydi)', () => {
    expect(parseExcelPrice("1 250 000 so'm")).toBe(1250000)
  })

  it('raqam (number tip) o\'zgarmaydi', () => {
    expect(parseExcelPrice(35000)).toBe(35000)
  })

  it('kasr narx saqlanadi: "12.50" → 12.5 (2 xonali kasr)', () => {
    expect(parseExcelPrice('12.50')).toBe(12.5)
  })

  it('null/undefined/bo\'sh → 0', () => {
    expect(parseExcelPrice(null)).toBe(0)
    expect(parseExcelPrice(undefined)).toBe(0)
    expect(parseExcelPrice('')).toBe(0)
    expect(parseExcelPrice('   ')).toBe(0)
  })

  it('noto\'g\'ri matn → 0', () => {
    expect(parseExcelPrice('narx yo\'q')).toBe(0)
  })

  it('ExcelJS formulaga natija obyekti: { result: 45000 } → 45000', () => {
    expect(parseExcelPrice({ result: 45000 })).toBe(45000)
  })
})
