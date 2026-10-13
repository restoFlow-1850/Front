// Report Export Utilities (Excel & PDF) for RestoFlow Reports Module
// Barcha og'ir kutubxonalar (exceljs, jspdf) dynamic import orqali yuklanadi.

/**
 * Excel (.xlsx) eksport qilish
 */
export async function exportFullReportToExcel({
  dateRangeLabel,
  stats,
  paymentsByMethod,
  topProducts,
  leastProducts,
  waiters,
  cancelledOrders,
  filename = 'RestoFlow_Hisobot.xlsx',
}) {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'RestoFlow Management'
  workbook.created = new Date()

  // 1. Asosiy ko'rsatkichlar & To'lov usullari
  const summarySheet = workbook.addWorksheet('Umumiy Ko\'rsatkichlar')
  summarySheet.columns = [
    { header: 'Ko\'rsatkich', key: 'label', width: 35 },
    { header: 'Qiymat', key: 'value', width: 25 },
  ]
  summarySheet.addRows([
    { label: 'Hisobot davri', value: dateRangeLabel },
    { label: 'Jami tushum', value: `${Number(stats.totalRevenue || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Jami buyurtmalar soni', value: stats.totalOrdersCount || 0 },
    { label: 'To\'lovlar soni', value: stats.paymentsCount || 0 },
    { label: 'O\'rtacha chek', value: `${Number(stats.avgCheck || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Bekor qilingan buyurtmalar soni', value: stats.cancelledCount || 0 },
    { label: 'Bekor qilingan buyurtmalar summasi', value: `${Number(stats.cancelledRevenue || 0).toLocaleString('ru-RU')} so'm` },
    { label: '---', value: '---' },
    { label: 'Naqd pul tushumi', value: `${Number(paymentsByMethod.naqd || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Plastik karta tushumi', value: `${Number(paymentsByMethod.karta || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Click tushumi', value: `${Number(paymentsByMethod.click || 0).toLocaleString('ru-RU')} so'm` },
    { label: 'Payme tushumi', value: `${Number(paymentsByMethod.payme || 0).toLocaleString('ru-RU')} so'm` },
  ])
  summarySheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
  summarySheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }

  // 2. Top 10 Taomlar
  if (topProducts?.length > 0) {
    const topSheet = workbook.addWorksheet('Top 10 Taomlar')
    topSheet.columns = [
      { header: '#', key: 'idx', width: 8 },
      { header: 'Taom nomi', key: 'name', width: 32 },
      { header: 'Sotilgan miqdor (ta)', key: 'qty', width: 22 },
      { header: 'Jami tushum', key: 'revenue', width: 25 },
    ]
    topProducts.forEach((p, i) => {
      topSheet.addRow({
        idx: i + 1,
        name: p.name || '—',
        qty: p.totalQuantity || 0,
        revenue: `${Number(p.totalRevenue || 0).toLocaleString('ru-RU')} so'm`,
      })
    })
    topSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    topSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF10B981' } }
  }

  // 3. Eng kam sotilgan taomlar
  if (leastProducts?.length > 0) {
    const leastSheet = workbook.addWorksheet('Kam Sotilgan Taomlar')
    leastSheet.columns = [
      { header: '#', key: 'idx', width: 8 },
      { header: 'Taom nomi', key: 'name', width: 32 },
      { header: 'Kategoriya', key: 'category', width: 20 },
      { header: 'Narxi', key: 'price', width: 20 },
      { header: 'Sotilgan miqdor', key: 'qty', width: 18 },
      { header: 'Ombor qoldig\'i', key: 'stock', width: 18 },
    ]
    leastProducts.forEach((p, i) => {
      leastSheet.addRow({
        idx: i + 1,
        name: p.name || '—',
        category: p.categoryName || '—',
        price: `${Number(p.price || 0).toLocaleString('ru-RU')} so'm`,
        qty: p.totalQuantity || 0,
        stock: p.stock ?? '—',
      })
    })
    leastSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    leastSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }
  }

  // 4. Ofitsiantlar kesimida
  if (waiters?.length > 0) {
    const waiterSheet = workbook.addWorksheet('Ofitsiantlar')
    waiterSheet.columns = [
      { header: '#', key: 'idx', width: 8 },
      { header: 'Ofitsiant', key: 'name', width: 30 },
      { header: 'Buyurtmalar soni', key: 'ordersCount', width: 20 },
      { header: 'Jami savdo summasi', key: 'totalRevenue', width: 25 },
      { header: 'O\'rtacha chek', key: 'avgRevenue', width: 22 },
    ]
    waiters.forEach((w, i) => {
      waiterSheet.addRow({
        idx: i + 1,
        name: w.name || '—',
        ordersCount: w.ordersCount || 0,
        totalRevenue: `${Number(w.totalRevenue || 0).toLocaleString('ru-RU')} so'm`,
        avgRevenue: `${Number(w.avgRevenue || 0).toLocaleString('ru-RU')} so'm`,
      })
    })
    waiterSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    waiterSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF6366F1' } }
  }

  // 5. Bekor qilingan buyurtmalar
  if (cancelledOrders?.length > 0) {
    const cancelSheet = workbook.addWorksheet('Bekor Qilinganlar')
    cancelSheet.columns = [
      { header: '#', key: 'idx', width: 8 },
      { header: 'Vaqt', key: 'time', width: 20 },
      { header: 'Stol', key: 'table', width: 15 },
      { header: 'Summa', key: 'amount', width: 20 },
      { header: 'Bekor qilish sababi', key: 'reason', width: 35 },
    ]
    cancelledOrders.forEach((o, i) => {
      cancelSheet.addRow({
        idx: i + 1,
        time: o.createdAt ? new Date(o.createdAt).toLocaleString('ru-RU') : '—',
        table: o.table?.number ? `Stol #${o.table.number}` : '—',
        amount: `${Number(o.totalAmount || 0).toLocaleString('ru-RU')} so'm`,
        reason: o.cancelReason || 'Sabab ko\'rsatilmagan',
      })
    })
    cancelSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }
    cancelSheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEF4444' } }
  }

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  window.URL.revokeObjectURL(url)
}

/**
 * PDF eksport qilish (jspdf + jspdf-autotable)
 */
export async function exportFullReportToPDF({
  dateRangeLabel,
  stats,
  paymentsByMethod,
  topProducts,
  waiters,
  cancelledOrders,
  filename = 'RestoFlow_Hisobot.pdf',
}) {
  const { jsPDF } = await import('jspdf')
  const autoTable = (await import('jspdf-autotable')).default
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.setTextColor(79, 70, 229)
  doc.text('RestoFlow — Kengaytirilgan Analitika Hisoboti', 14, 20)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Davr: ${dateRangeLabel} | Sana: ${new Date().toLocaleString('ru-RU')}`, 14, 27)

  let finalY = 33

  // 1. Asosiy Moliyaviy Ko'rsatkichlar & To'lov Usullari
  autoTable(doc, {
    startY: finalY,
    head: [['Moliyaviy Ko\'rsatkich', 'Qiymat', 'To\'lov Usuli', 'Tushum']],
    body: [
      ['Jami Tushum', `${Number(stats.totalRevenue || 0).toLocaleString('ru-RU')} so'm`, 'Naqd (Cash)', `${Number(paymentsByMethod.naqd || 0).toLocaleString('ru-RU')} so'm`],
      ['Buyurtmalar Soni', `${stats.totalOrdersCount || 0} ta`, 'Karta (Terminal)', `${Number(paymentsByMethod.karta || 0).toLocaleString('ru-RU')} so'm`],
      ['O\'rtacha Chek', `${Number(stats.avgCheck || 0).toLocaleString('ru-RU')} so'm`, 'Click Online', `${Number(paymentsByMethod.click || 0).toLocaleString('ru-RU')} so'm`],
      ['Bekor qilinganlar', `${stats.cancelledCount || 0} ta (${Number(stats.cancelledRevenue || 0).toLocaleString('ru-RU')} so'm)`, 'Payme Online', `${Number(paymentsByMethod.payme || 0).toLocaleString('ru-RU')} so'm`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
  })
  finalY = doc.lastAutoTable.finalY + 10

  // 2. Top Taomlar
  if (topProducts?.length > 0) {
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('Top Sotilgan Taomlar', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['#', 'Taom nomi', 'Sotilgan miqdori', 'Jami tushum']],
      body: topProducts.slice(0, 10).map((p, i) => [
        i + 1,
        p.name || '—',
        `${p.totalQuantity || 0} ta`,
        `${Number(p.totalRevenue || 0).toLocaleString('ru-RU')} so'm`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] },
    })
    finalY = doc.lastAutoTable.finalY + 10
  }

  // 3. Ofitsiantlar
  if (waiters?.length > 0) {
    if (finalY > 220) {
      doc.addPage()
      finalY = 20
    }
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('Ofitsiantlar Samaradorligi', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['#', 'Ofitsiant', 'Buyurtmalar soni', 'Jami summa', 'O\'rtacha chek']],
      body: waiters.map((w, i) => [
        i + 1,
        w.name || '—',
        `${w.ordersCount || 0} ta`,
        `${Number(w.totalRevenue || 0).toLocaleString('ru-RU')} so'm`,
        `${Number(w.avgRevenue || 0).toLocaleString('ru-RU')} so'm`,
      ]),
      theme: 'striped',
      headStyles: { fillColor: [99, 102, 241] },
    })
    finalY = doc.lastAutoTable.finalY + 10
  }

  // 4. Bekor qilingan buyurtmalar
  if (cancelledOrders?.length > 0) {
    if (finalY > 220) {
      doc.addPage()
      finalY = 20
    }
    doc.setFontSize(13)
    doc.setTextColor(15, 23, 42)
    doc.text('Bekor Qilingan Buyurtmalar', 14, finalY)

    autoTable(doc, {
      startY: finalY + 4,
      head: [['#', 'Vaqt', 'Stol', 'Summa', 'Sababi']],
      body: cancelledOrders.slice(0, 15).map((o, i) => [
        i + 1,
        o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ru-RU') : '—',
        o.table?.number ? `Stol #${o.table.number}` : '—',
        `${Number(o.totalAmount || 0).toLocaleString('ru-RU')} so'm`,
        o.cancelReason || 'Sabab ko\'rsatilmagan',
      ]),
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68] },
    })
  }

  doc.save(filename)
}