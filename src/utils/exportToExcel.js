import ExcelJS from 'exceljs'

/**
 * Excel formatida (.xlsx) hisobot va ma'lumotlarni yuklab olish
 * @param {Object} params
 * @param {Object} params.stats - dashboard statistikasi
 * @param {Array} params.topProducts - eng ko'p sotilgan taomlar
 * @param {Array} params.dailySales - kunlik sotuvlar
 * @param {string} params.filename - fayl nomi
 */
export async function exportToExcel({ stats = {}, topProducts = [], dailySales = [], filename = 'RestoFlow_Hisobot.xlsx' }) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'RestoFlow App'
  workbook.created = new Date()

  // 1. Umumiy Ko'rsatkichlar varag'i
  const summarySheet = workbook.addWorksheet('Umumiy Hisobot')

  summarySheet.columns = [
    { header: 'Ko\'rsatkich', key: 'label', width: 30 },
    { header: 'Qiymat', key: 'value', width: 25 },
  ]

  summarySheet.addRows([
    { label: 'Bugungi tushum', value: `${Number(stats.todayRevenue || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Bugungi to\'lovlar soni', value: stats.todayPaymentsCount || 0 },
    { label: 'Bugungi buyurtmalar soni', value: stats.todayOrdersCount || 0 },
    { label: 'Faol buyurtmalar', value: stats.activeOrdersCount || 0 },
    { label: 'O\'rtacha chek', value: `${Number(stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Omborda kam qolgan mahsulotlar', value: stats.lowStockCount || 0 },
    { label: 'Jami mahsulotlar', value: stats.totalProducts || 0 },
  ])

  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }

  // 2. Eng ko'p sotilgan taomlar varag'i
  if (topProducts.length > 0) {
    const productsSheet = workbook.addWorksheet('Top Taomlar')
    productsSheet.columns = [
      { header: '#', key: 'index', width: 8 },
      { header: 'Taom nomi', key: 'name', width: 30 },
      { header: 'Sotilgan soni (ta)', key: 'totalQuantity', width: 20 },
      { header: 'Jami tushum', key: 'totalRevenue', width: 25 },
    ]

    topProducts.forEach((p, idx) => {
      productsSheet.addRow({
        index: idx + 1,
        name: p.name || p.productName || '—',
        totalQuantity: p.totalQuantity || p.quantity || 0,
        totalRevenue: p.totalRevenue ? `${Number(p.totalRevenue).toLocaleString('ru-RU')} so'm` : '—',
      })
    })

    productsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    productsSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
  }

  // 3. Kunlik sotuvlar varag'i
  if (dailySales.length > 0) {
    const salesSheet = workbook.addWorksheet('Kunlik Sotuvlar')
    salesSheet.columns = [
      { header: 'Sana', key: 'date', width: 15 },
      { header: 'Tushum', key: 'revenue', width: 25 },
      { header: 'Buyurtmalar soni', key: 'ordersCount', width: 20 },
    ]

    dailySales.forEach((s) => {
      salesSheet.addRow({
        date: s.date || s._id || '—',
        revenue: `${Number(s.totalRevenue || s.revenue || 0).toLocaleString('ru-RU')} so'm`,
        ordersCount: s.ordersCount || s.count || 0,
      })
    })

    salesSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    salesSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}

/**
 * CSV formatida (.csv) hisobotni yuklab olish
 * @param {Object} params
 * @param {Object} params.stats
 * @param {Array} params.topProducts
 * @param {string} params.filename
 */
export function exportToCSV({ stats = {}, topProducts = [], filename = 'RestoFlow_Hisobot.csv' }) {
  let csvContent = '\uFEFF' // UTF-8 BOM

  csvContent += '--- UMUMIY KO\'RSATKICHLAR ---\n'
  csvContent += 'Ko\'rsatkich,Qiymat\n'
  csvContent += `Bugungi tushum,${stats.todayRevenue || 0} so'm\n`
  csvContent += `Bugungi to'lovlar soni,${stats.todayPaymentsCount || 0}\n`
  csvContent += `Bugungi buyurtmalar soni,${stats.todayOrdersCount || 0}\n`
  csvContent += `Faol buyurtmalar,${stats.activeOrdersCount || 0}\n`
  csvContent += `O'rtacha chek,${stats.todayPaymentsCount ? Math.round(stats.todayRevenue / stats.todayPaymentsCount) : 0} so'm\n\n`

  if (topProducts.length > 0) {
    csvContent += '--- ENG KO\'P SOTILGAN TAOMLAR ---\n'
    csvContent += '#,Taom nomi,Sotilgan soni,Jami tushum\n'
    topProducts.forEach((p, i) => {
      const name = (p.name || p.productName || '—').replace(/"/g, '""')
      const qty = p.totalQuantity || p.quantity || 0
      const rev = p.totalRevenue || 0
      csvContent += `${i + 1},"${name}",${qty},${rev} so'm\n`
    })
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  window.URL.revokeObjectURL(url)
}
