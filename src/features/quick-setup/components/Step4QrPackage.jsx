import { useState } from 'react'
import { QrCode, Printer, Download, Sparkles, ArrowRight, ArrowLeft, CheckCircle2, FileText } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, Card } from '../../../components/ui'

export default function Step4QrPackage({ data, onNext, onPrev }) {
  const restaurantName = data.name || 'RestoFlow Restoran'
  const halls = data.halls || []
  const totalTables = data.totalTables || 0

  const allTables = halls.flatMap((h) =>
    h.tables.map((t) => ({
      ...t,
      hallName: h.name,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        `${window.location.origin}/guest?table=${encodeURIComponent(t.name)}&restaurant=${encodeURIComponent(
          restaurantName,
        )}`,
      )}`,
    })),
  )

  const handlePrintA4Package = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      toast.error('Brauzeringizda pop-up (yangi oyna) bloklangan. Iltimos ruxsat bering.')
      return
    }

    const cardsHtml = allTables
      .map(
        (t) => `
        <div class="qr-card">
          <div class="card-header font-bold text-sm text-amber-700">${restaurantName}</div>
          <div class="card-hall text-xs text-gray-600">${t.hallName}</div>
          <div class="card-table font-extrabold text-lg text-gray-900 mt-1">${t.name}</div>
          <img src="${t.qrUrl}" alt="QR" class="qr-img" />
          <div class="card-footer text-[10px] text-gray-500">
            📱 Menyuni ko'rish va buyurtma berish uchun skanerlang
          </div>
        </div>
      `,
      )
      .join('')

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${restaurantName} — A4 QR Paket</title>
          <style>
            @page { size: A4; margin: 10mm; }
            body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #fff; color: #000; }
            .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15mm; page-break-inside: auto; }
            .qr-card { border: 2px dashed #C89B5E; border-radius: 12px; padding: 15px; text-align: center; background: #fff; page-break-inside: avoid; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 110mm; box-sizing: border-box; }
            .qr-img { width: 140px; height: 140px; margin: 10px 0; border: 1px solid #eee; border-radius: 8px; padding: 4px; }
            .card-header { font-[#C89B5E]; text-transform: uppercase; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          <h2 style="text-center: center; font-size: 16px; margin-bottom: 10px; text-align: center;">
            ${restaurantName} — Barcha stollar uchun QR Paket (A4 Format)
          </h2>
          <div class="grid">
            ${cardsHtml}
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
    toast.success('A4 QR Paket chop etish oynasiga yuborildi!')
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto shadow-xl border-[#C89B5E]/30 bg-[#1e1112]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <QrCode className="text-[#C89B5E] w-6 h-6" />
            4-Qadam: QR Paket (barcha stollarga A4 PDF)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Bitta tugma orqali barcha {totalTables} ta stol uchun tayyor A4 formatdagi QR to'plamini yuklab oling yoki chop eting.
          </p>
        </div>
        <Button
          type="button"
          onClick={handlePrintA4Package}
          className="bg-[#C89B5E] hover:bg-[#b08449] text-[#1e1112] font-semibold gap-2 shadow-lg"
        >
          <Printer className="w-4 h-4" />
          A4 QR Paketni chop etish (1-Tugma)
        </Button>
      </div>

      {/* Stats banner */}
      <div className="bg-[#180c0d] border border-gray-800 rounded-xl p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">
              {halls.length} ta zal, Jami {totalTables} ta stol tayyorlandi
            </h4>
            <p className="text-xs text-gray-400">
              Har bir stol uchun takrorlanmas individual QR va mehmon havolasi yaratildi.
            </p>
          </div>
        </div>
        <span className="text-xs text-[#C89B5E] font-medium bg-[#C89B5E]/10 border border-[#C89B5E]/30 px-3 py-1 rounded-full">
          A4 Tayyor
        </span>
      </div>

      {/* QR Cards Preview */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Stol QR kodlari ko'rinishi (Preview)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
          {allTables.slice(0, 8).map((t, idx) => (
            <div
              key={idx}
              className="bg-[#120909] border border-dashed border-[#C89B5E]/40 rounded-xl p-3 text-center flex flex-col items-center"
            >
              <span className="text-[10px] text-[#C89B5E] font-bold uppercase">{restaurantName}</span>
              <span className="text-xs font-semibold text-white mt-0.5">{t.name}</span>
              <div className="w-16 h-16 bg-white p-1 rounded-lg my-2 flex items-center justify-center">
                <img src={t.qrUrl} alt="QR" className="w-full h-full object-contain" />
              </div>
              <span className="text-[9px] text-gray-500">Mehmon menyusi</span>
            </div>
          ))}
        </div>
        {allTables.length > 8 && (
          <p className="text-xs text-center text-gray-500 mt-2">
            ... va yana {allTables.length - 8} ta stol QR kodlari. Barchasi A4 PDF fayliga jamlangan.
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-gray-800 flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="border-gray-700 text-gray-300 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Orqaga
        </Button>
        <Button
          type="button"
          onClick={() => onNext({ qrTables: allTables })}
          className="bg-[#C89B5E] hover:bg-[#b08449] text-[#1e1112] font-semibold px-6 gap-2"
        >
          Keyingi qadam: Xodim akkauntlari
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  )
}
