/**
 * Dynamic import yordamida Excel, PDF va HTML2Canvas (Screen) eksport yordamchilari.
 * Main entry bundle hajmini 500 kB dan pastga tushirish uchun barcha og'ir kutubxonalar
 * faqat foydalanuvchi tugmani bosgandagina yuklanadi.
 */

export { exportToExcel, exportToCSV } from './exportToExcel'

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
