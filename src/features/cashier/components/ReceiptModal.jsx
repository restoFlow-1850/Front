import { Printer, X } from 'lucide-react'
import { formatDateTime, formatSom } from '../../../lib/api'
import { PAYMENT_METHOD_LABELS } from '../../../constants/roles'
import { Badge, Button } from '../../../components/ui'

/**
 * Chek (Receipt) chop etish va ko'rish oynasi (Modal)
 * @param {Object} props
 * @param {boolean} props.isOpen - modal ochiqlik holati
 * @param {Function} props.onClose - yopish funksiyasi
 * @param {Object} props.receipt - backend receipt ma'lumoti
 */
export default function ReceiptModal({ isOpen, onClose, receipt }) {
  if (!isOpen || !receipt) return null

  const order = receipt.order || {}
  const items = order.items || []
  const payments = receipt.payments || []

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm print:p-0 print:bg-transparent">
      {/* Printable Area CSS */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-receipt-modal, #printable-receipt-modal * {
            visibility: visible;
          }
          #printable-receipt-modal {
            position: absolute;
            left: 0;
            top: 0;
            width: 80mm; /* Standart kassa termochek eni */
            padding: 10px;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            color: black !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div
        id="printable-receipt-modal"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900 dark:text-white print:max-w-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800 print:border-black">
          <div className="text-center w-full print:text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white print:text-black">
              RestoFlow
            </h1>
            <p className="text-xs text-slate-500 print:text-black">Restoran va Kassa Cheki</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="print-hide rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Info */}
        <div className="my-4 space-y-1 text-xs text-slate-600 dark:text-slate-300 print:text-black">
          <div className="flex justify-between">
            <span>Stol:</span>
            <span className="font-bold">№ {order.table?.number ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Ofitsiant:</span>
            <span className="font-medium">{order.waiter?.name ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span>Sana/Vaqt:</span>
            <span>{formatDateTime(order.createdAt)}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span>Holati:</span>
            <Badge variant={receipt.isPaid ? 'success' : 'warning'} className="print-hide">
              {receipt.isPaid ? "To'langan" : "To'lanmagan"}
            </Badge>
            <span className="hidden print:inline font-bold">
              {receipt.isPaid ? "TO'LANGAN" : "TO'LANMAGAN"}
            </span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-b border-slate-200 py-3 dark:border-slate-800 print:border-black">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-800 print:border-black print:text-black">
                <th className="pb-1 font-semibold">Nomi</th>
                <th className="pb-1 text-center font-semibold">Soni</th>
                <th className="pb-1 text-right font-semibold">Narx</th>
                <th className="pb-1 text-right font-semibold">Jami</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-black">
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-1.5 font-medium">{item.name}</td>
                  <td className="py-1.5 text-center">{item.quantity}</td>
                  <td className="py-1.5 text-right">{formatSom(item.price)}</td>
                  <td className="py-1.5 text-right font-semibold">
                    {formatSom(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="mt-3 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 print:text-black">
          <div className="flex justify-between">
            <span>Jami buyurtma:</span>
            <span className="font-semibold">{formatSom(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span>To'langan:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 print:text-black">
              {formatSom(receipt.paidTotal)}
            </span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-white print:border-black print:text-black">
            <span>Qolgan balans:</span>
            <span>{formatSom(receipt.remainingBalance)}</span>
          </div>
        </div>

        {/* Payments History */}
        {payments.length > 0 && (
          <div className="mt-4 border-t border-slate-200 pt-3 dark:border-slate-800 print:border-black">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 print:text-black">
              To'lovlar tarixi
            </p>
            <div className="space-y-1 text-xs">
              {payments.map((p) => (
                <div key={p._id} className="flex justify-between text-slate-500 dark:text-slate-400 print:text-black">
                  <span>
                    {PAYMENT_METHOD_LABELS[p.method] || p.method} ({p.receivedBy?.name || 'Kassa'})
                  </span>
                  <span className="font-semibold">{formatSom(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 print:text-black print:mt-4">
          <p>Tashrifingiz uchun rahmat!</p>
          <p className="text-[10px]">RestoFlow tizimi orqali chop etildi</p>
        </div>

        {/* Print & Action Buttons */}
        <div className="mt-5 flex gap-2 print-hide">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Yopish
          </Button>
          <Button className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" /> Chop etish
          </Button>
        </div>
      </div>
    </div>
  )
}
