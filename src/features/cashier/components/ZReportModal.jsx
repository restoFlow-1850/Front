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

          {/* Balans */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Balans
            </h4>
            <div className="space-y-2">
              <ReportRow label="Boshlang'ich balans" value={formatSom(report.openingBalance)} />
              <ReportRow label="Yakuniy balans (kassada)" value={formatSom(report.closingBalance)} />
              <ReportRow
                label="Kutilgan tushum"
                value={formatSom(report.expectedIncome)}
                highlight
              />
              <ReportRow
                label="Haqiqiy tushum"
                value={formatSom(report.totalIncome)}
                highlight
              />
              {report.difference !== 0 && (
                <ReportRow
                  label="Farq (kamomad/zapot)"
                  value={formatSom(report.difference)}
                  danger={report.difference < 0}
                />
              )}
            </div>
          </div>

          {/* Buyurtmalar statistikasi */}
          <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
              Buyurtmalar
            </h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <StatBox label="Jami" value={report.totalOrders ?? 0} />
              <StatBox label="To'langan" value={report.paidOrders ?? 0} success />
              <StatBox label="To'lanmagan" value={report.unpaidOrders ?? 0} danger />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-center">
              <StatBox label="Bekor qilingan" value={report.cancelledOrders ?? 0} danger />
              <StatBox label="Umumiy summa" value={formatSom(report.totalOrderAmount)} />
            </div>
          </div>

          {/* To'lov usullari bo'yicha */}
          {report.paymentsByMethod && Object.keys(report.paymentsByMethod).length > 0 && (
            <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
              <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">
                To'lov usullari bo'yicha
              </h4>
              <div className="space-y-2">
                {Object.entries(report.paymentsByMethod).map(([method, amount]) => {
                  const Icon = METHOD_ICONS[method] || Banknote
                  return (
                    <div
                      key={method}
                      className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-500" />
                        <span className="text-slate-700 dark:text-slate-300">
                          {PAYMENT_METHOD_LABELS[method] ?? method}
                        </span>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatSom(amount)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

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
