/**
 * Dynamic import yordamida Excel, PDF va HTML2Canvas (Screen) eksport yordamchilari.
 * Main entry bundle hajmini 500 kB dan pastga tushirish uchun barcha og'ir kutubxonalar
 * faqat foydalanuvchi tugmani bosgandagina yuklanadi.
 */

export async function exportToExcel({ stats = {}, topProducts = [], dailySales = [], filename = 'RestoFlow_Hisobot.xlsx' }) {
  const ExcelJS = (await import('exceljs')).default
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

export async function exportToPDF({ stats = {}, topProducts = [], dailySales = [], filename = 'RestoFlow_Hisobot.pdf' }) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()

  doc.setFontSize(20)
  doc.setTextColor(79, 70, 229)
  doc.text('RestoFlow — Analitika Hisoboti', 14, 22)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Sana: ${new Date().toLocaleString('ru-RU')}`, 14, 28)

  let finalY = 35

  const avgCheck = stats.todayPaymentsCount ? Math.round(stats.todayRevenue / stats.todayPaymentsCount) : 0
  autoTable(doc, {
    startY: finalY,
    head: [['Ko\'rsatkich', 'Qiymat']],
    body: [
      ['Bugungi tushum', `${Number(stats.todayRevenue || 0).toLocaleString('ru-RU')} so'm`],
      ['To\'lovlar soni', `${stats.todayPaymentsCount || 0} ta`],
      ['Buyurtmalar soni', `${stats.todayOrdersCount || 0} ta`],
      ['Faol buyurtmalar', `${stats.activeOrdersCount || 0} ta`],
      ['O\'rtacha chek', `${avgCheck.toLocaleString('ru-RU')} so'm`],
      ['Omborda kam qolgan mahsulotlar', `${stats.lowStockCount || 0} ta`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  })

  finalY = doc.lastAutoTable.finalY + 10

  if (topProducts.length > 0) {
    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Eng ko\'p sotilgan taomlar', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['#', 'Taom nomi', 'Sotilgan soni', 'Tushum']],
      body: topProducts.map((p, i) => [
        i + 1,
        p.name || p.productName || '—',
        `${p.totalQuantity || p.quantity || 0} ta`,
        p.totalRevenue ? `${Number(p.totalRevenue).toLocaleString('ru-RU')} so'm` : '—',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    })

    finalY = doc.lastAutoTable.finalY + 10
  }

  if (dailySales.length > 0) {
    if (finalY > 220) {
      doc.addPage()
      finalY = 20
    }

    doc.setFontSize(14)
    doc.setTextColor(15, 23, 42)
    doc.text('Kunlik sotuvlar dinamikasi', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['Sana', 'Buyurtmalar soni', 'Tushum']],
      body: dailySales.map((s) => [
        s.date || s._id || '—',
        `${s.ordersCount || s.count || 0} ta`,
        `${Number(s.totalRevenue || s.revenue || 0).toLocaleString('ru-RU')} so'm`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229] },
    })
  }

  doc.save(filename)
}

/**
 * html2canvas ni dinamik import orqali ekrandan rasm olib yuklab berish
 */
export async function exportDashboardToImage(elementId = 'dashboard-container', filename = 'RestoFlow_Dashboard.png') {
  const html2canvas = (await import('html2canvas')).default
  const element = document.getElementById(elementId)
  if (element) {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true })
    const link = document.createElement('a')
    link.download = filename
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
}
