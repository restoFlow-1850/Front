// Z-Report modal — smena yopilgandan keyin to'liq hisobotni ko'rish va chop etish.
// Backend: GET /api/shifts/:id/report
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Banknote,
  CreditCard,
  FileText,
  Printer,
  Smartphone,
} from 'lucide-react'

import { getShiftReport } from '../api'
import { unwrap, apiErrorMessage, formatSom, formatDateTime } from '../../../lib/api'
import { PAYMENT_METHOD_LABELS } from '../../../constants/roles'
import { Button, Modal, Skeleton } from '../../../components/ui'

const METHOD_ICONS = {
  naqd: Banknote,
  karta: CreditCard,
  click: Smartphone,
  payme: Smartphone,
}

export default function ZReportModal({ isOpen, onClose, shiftId }) {
  const reportQuery = useQuery({
    queryKey: ['shift-report', shiftId],
    queryFn: async () => {
      const res = await getShiftReport(shiftId)
      return unwrap(res, 'report')
    },
    enabled: isOpen && Boolean(shiftId),
  })

  const report = reportQuery.data

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(generatePrintHTML(report))
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Z-Report — Smena hisoboti"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Yopish
          </Button>
          {report && (
            <Button onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Chop etish
            </Button>
          )}
        </>
      }
    >
      {reportQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : reportQuery.isError ? (
        <div className="flex items-center gap-3 rounded-lg bg-rose-50 p-4 dark:bg-rose-950/40">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <p className="text-sm text-rose-700 dark:text-rose-300">
            {apiErrorMessage(reportQuery.error, "Hisobotni yuklab bo'lmadi")}
          </p>
        </div>
      ) : report ? (
        <div className="space-y-4 text-sm">
          {/* Sarlavha */}
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h3 className="font-bold text-slate-900 dark:text-white">
                Z-Report #{report.shiftNumber ?? shiftId?.slice(-6)}
              </h3>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {report.user?.name ?? report.user?.username ?? '—'}
            </p>
          </div>

          {/* Vaqt oralig'i */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Ochilgan</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatDateTime(report.openedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400">Yopilgan</p>
              <p className="font-semibold text-slate-900 dark:text-white">
                {formatDateTime(report.closedAt)}
              </p>
            </div>
          </div>

          {/* Moliyaviy Summalar Jadvali (Z-Report Summary Table) */}
          <div className="rounded-lg border border-slate-200 overflow-hidden dark:border-slate-700">
            <div className="bg-slate-100 px-4 py-2.5 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h4 className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                Z-Report Moliyaviy Summalar Jadvali (Taomlar | Xizmat | Chek | To'lov | Balans)
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Smena #{report.shiftNumber ?? shiftId?.slice(-6)}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 dark:border-slate-700 dark:bg-slate-800/50 text-slate-500 font-medium">
                    <th className="px-4 py-2">Moliyaviy ko'rsatkich</th>
                    <th className="px-4 py-2">Tafsilot / Turi</th>
                    <th className="px-4 py-2 text-right">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* 1. Taomlar summasi */}
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium">Taomlar summasi</td>
                    <td className="px-4 py-2 text-slate-500">Sotilgan taomlar subtotal</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(
                        report.items?.reduce(
                          (sum, item) => sum + (item.total ?? (item.price ?? 0) * (item.quantity ?? 1)),
                          0
                        ) ?? (report.totalOrderAmount ?? 0)
                      )}
                    </td>
                  </tr>
                  {/* 2. Xizmat haqi */}
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300 font-medium">Xizmat haqi</td>
                    <td className="px-4 py-2 text-slate-500">Xizmat ko'rsatish foizi / haqi</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(
                        report.serviceFee ??
                          (report.totalOrderAmount && report.items?.length
                            ? Math.max(
                                0,
                                report.totalOrderAmount -
                                  report.items.reduce(
                                    (sum, item) => sum + (item.total ?? (item.price ?? 0) * (item.quantity ?? 1)),
                                    0
                                  )
                              )
                            : 0)
                      )}
                    </td>
                  </tr>
                  {/* 3. Chek summasi (Jami buyurtmalar) */}
                  <tr className="bg-slate-50/70 dark:bg-slate-800/70 font-semibold">
                    <td className="px-4 py-2 text-slate-900 dark:text-white">Chek summasi (Jami)</td>
                    <td className="px-4 py-2 text-slate-500">Barcha yopilgan cheklar summasi</td>
                    <td className="px-4 py-2 text-right text-slate-900 dark:text-white">
                      {formatSom(report.totalOrderAmount ?? 0)}
                    </td>
                  </tr>
                  {/* 4. To'langan summa (To'lov usullari bo'yicha) */}
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Naqd pul to'lovi</td>
                    <td className="px-4 py-2 text-slate-500">Naqd (Cash)</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(report.paymentsByMethod?.naqd ?? 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Plastik karta to'lovi</td>
                    <td className="px-4 py-2 text-slate-500">Karta (Card)</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(report.paymentsByMethod?.karta ?? 0)}
                    </td>
                  </tr>
                  {Boolean(report.paymentsByMethod?.click) && (
                    <tr>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Click to'lovi</td>
                      <td className="px-4 py-2 text-slate-500">Click Online</td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                        {formatSom(report.paymentsByMethod.click)}
                      </td>
                    </tr>
                  )}
                  {Boolean(report.paymentsByMethod?.payme) && (
                    <tr>
                      <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Payme to'lovi</td>
                      <td className="px-4 py-2 text-slate-500">Payme Online</td>
                      <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                        {formatSom(report.paymentsByMethod.payme)}
                      </td>
                    </tr>
                  )}
                  <tr className="bg-indigo-50/50 dark:bg-indigo-950/20 font-semibold">
                    <td className="px-4 py-2 text-indigo-900 dark:text-indigo-300">Jami To'langan Summa</td>
                    <td className="px-4 py-2 text-indigo-600 dark:text-indigo-400">Haqiqiy tushum yig'indisi</td>
                    <td className="px-4 py-2 text-right text-indigo-700 dark:text-indigo-300">
                      {formatSom(report.totalIncome ?? 0)}
                    </td>
                  </tr>
                  {/* 5. Z-Report Moliyaviy Kassa Balansi */}
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Boshlang'ich kassa balansi</td>
                    <td className="px-4 py-2 text-slate-500">Smena boshida kassada bo'lgan naqd</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(report.openingBalance ?? 0)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2 text-slate-700 dark:text-slate-300">Kutilgan kassa balansi</td>
                    <td className="px-4 py-2 text-slate-500">Boshlang'ich + Naqd pul tushumi</td>
                    <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-white">
                      {formatSom(report.expectedIncome ?? 0)}
                    </td>
                  </tr>
                  <tr className="bg-slate-100 dark:bg-slate-800 font-bold">
                    <td className="px-4 py-2 text-slate-900 dark:text-white">Yakuniy kassa balansi</td>
                    <td className="px-4 py-2 text-slate-500">Kassani sanashda topilgan naqd</td>
                    <td className="px-4 py-2 text-right text-slate-900 dark:text-white">
                      {formatSom(report.closingBalance ?? 0)}
                    </td>
                  </tr>
                  {report.difference !== 0 && (
                    <tr
                      className={
                        report.difference < 0
                          ? 'bg-rose-50 dark:bg-rose-950/30 font-bold text-rose-700 dark:text-rose-400'
                          : 'bg-emerald-50 dark:bg-emerald-950/30 font-bold text-emerald-700 dark:text-emerald-400'
                      }
                    >
                      <td className="px-4 py-2">Farq (kamomad/zapot)</td>
                      <td className="px-4 py-2">Yakuniy naqd - Kutilgan naqd</td>
                      <td className="px-4 py-2 text-right">{formatSom(report.difference)}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chek elementlari */}
          {report.items?.length > 0 && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
                Sotilgan taomlar
              </h4>
              <div className="max-h-48 space-y-1 overflow-y-auto">
                {report.items.map((item, index) => (
                  <div
                    key={`${item.name ?? index}`}
                    className="flex justify-between rounded px-2 py-1 text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {item.name ?? item.product?.name ?? '—'}
                      {item.quantity > 1 && (
                        <span className="ml-1 text-slate-400">×{item.quantity}</span>
                      )}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatSom(item.total ?? (item.price ?? 0) * (item.quantity ?? 1))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Ma'lumot topilmadi
        </p>
      )}
    </Modal>
  )
}

function ReportRow({ label, value, highlight = false, danger = false }) {
  return (
    <div className="flex justify-between border-b border-slate-100 pb-1.5 last:border-0 dark:border-slate-800">
      <span className="text-slate-600 dark:text-slate-400">{label}</span>
      <span
        className={`font-semibold ${
          danger
            ? 'text-rose-600 dark:text-rose-400'
            : highlight
              ? 'text-indigo-600 dark:text-indigo-400'
              : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function StatBox({ label, value, success = false, danger = false }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
      <p
        className={`text-lg font-bold ${
          danger
            ? 'text-rose-600 dark:text-rose-400'
            : success
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-slate-900 dark:text-white'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

/** Chop etish uchun HTML yaratadi */
function generatePrintHTML(report) {
  if (!report) return '<html><body></body></html>'

  const paymentRows = report.paymentsByMethod
    ? Object.entries(report.paymentsByMethod)
        .map(
          ([method, amount]) => `
        <tr>
          <td style="padding:4px 0">${PAYMENT_METHOD_LABELS[method] ?? method}</td>
          <td style="padding:4px 0;text-align:right">${formatSom(amount)}</td>
        </tr>`
        )
        .join('')
    : ''

  const itemRows = report.items
    ? report.items
        .map(
          (item) => `
        <tr>
          <td style="padding:3px 0">${item.name ?? item.product?.name ?? '—'}${item.quantity > 1 ? ` ×${item.quantity}` : ''}</td>
          <td style="padding:3px 0;text-align:right">${formatSom(item.total ?? (item.price ?? 0) * (item.quantity ?? 1))}</td>
        </tr>`
        )
        .join('')
    : ''

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Z-Report</title>
  <style>
    body { font-family: monospace; font-size: 12px; padding: 20px; max-width: 300px; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 1px dashed #000; padding-bottom: 8px; }
    .section { margin: 12px 0; }
    .section-title { font-weight: bold; margin-bottom: 4px; }
    .row { display: flex; justify-content: space-between; padding: 2px 0; }
    .total { border-top: 1px dashed #000; margin-top: 8px; padding-top: 8px; font-weight: bold; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <strong>Z-REPORT</strong><br>
    Smena #${report.shiftNumber ?? ''}<br>
    ${report.user?.name ?? report.user?.username ?? ''}<br>
  </div>

  <div class="section">
    <div class="row"><span>Ochilgan:</span><span>${formatDateTime(report.openedAt)}</span></div>
    <div class="row"><span>Yopilgan:</span><span>${formatDateTime(report.closedAt)}</span></div>
  </div>

  <div class="section">
    <div class="section-title">BALANS</div>
    <div class="row"><span>Boshlang'ich:</span><span>${formatSom(report.openingBalance)}</span></div>
    <div class="row"><span>Yakuniy:</span><span>${formatSom(report.closingBalance)}</span></div>
    <div class="row"><span>Tushum:</span><span>${formatSom(report.totalIncome)}</span></div>
    ${report.difference !== 0 ? `<div class="row"><span>Farq:</span><span>${formatSom(report.difference)}</span></div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">BUYURTMALAR</div>
    <div class="row"><span>Jami:</span><span>${report.totalOrders ?? 0}</span></div>
    <div class="row"><span>To'langan:</span><span>${report.paidOrders ?? 0}</span></div>
    <div class="row"><span>Summa:</span><span>${formatSom(report.totalOrderAmount)}</span></div>
  </div>

  ${paymentRows ? `
  <div class="section">
    <div class="section-title">TO'LOVLAR</div>
    <table>${paymentRows}</table>
  </div>` : ''}

  ${itemRows ? `
  <div class="section">
    <div class="section-title">SOTILGAN TAOMLAR</div>
    <table>${itemRows}</table>
  </div>` : ''}

  <div class="total" style="text-align:center;margin-top:20px;border-top:1px dashed #000;padding-top:12px">
    ${new Date().toLocaleString('ru-RU')}
  </div>
</body>
</html>`
}
