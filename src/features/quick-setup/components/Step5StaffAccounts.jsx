import { useState, useMemo } from 'react'
import { Users, Copy, Download, ShieldAlert, Check, ArrowRight, ArrowLeft, KeyRound, Sparkles } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button, Card } from '../../../components/ui'
import { generateStaffAccounts } from '../utils/wizardParsers'

export default function Step5StaffAccounts({ data, onNext, onPrev }) {
  const restaurantName = data.name || 'Rayhon'

  const accounts = useMemo(() => {
    return data.staffAccounts || generateStaffAccounts(restaurantName)
  }, [data.staffAccounts, restaurantName])

  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopyOne = (acc, idx) => {
    const text = `Rol: ${acc.label}\nLogin: ${acc.username}\nParol: ${acc.password}`
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    toast.success(`${acc.label} ma'lumotlari ko'chirildi!`)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = () => {
    const text = accounts
      .map((acc) => `=== ${acc.label.toUpperCase()} ===\nLogin: ${acc.username}\nParol: ${acc.password}\n`)
      .join('\n')
    navigator.clipboard.writeText(text)
    toast.success("Barcha 5 ta xodim parollari ko'chirildi!")
  }

  const handleDownloadTxt = () => {
    const text = `=================================================\n${restaurantName.toUpperCase()} — XODIM AKKAUNTLARI (PAROLLAR)\n=================================================\n\n` +
      accounts
        .map(
          (acc) =>
            `[${acc.label}]\nRol: ${acc.roleName}\nFoydalanuvchi nomi: ${acc.username}\nBir martalik parol: ${acc.password}\nTavsif: ${acc.desc}\n-------------------------------------------------`,
        )
        .join('\n\n')

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${restaurantName}_xodimlar_parollar.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.info("Xodimlar login va parollari .txt fayl sifatida yuklandi!")
  }

  const handleSubmit = () => {
    onNext({ staffAccounts: accounts })
  }

  return (
    <Card className="p-6 max-w-3xl mx-auto shadow-xl border-[#C89B5E]/30 bg-[#1e1112]">
      <div className="flex items-center justify-between mb-6 border-b border-gray-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-[#C89B5E] w-6 h-6" />
            5-Qadam: Xodim akkauntlari (5 rol)
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Har bir lavozim uchun avtomatik tayyorlangan akkauntlar va bir martalik maxsus parollar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopyAll}
            className="border-gray-700 text-gray-300 hover:bg-gray-800 gap-1.5"
          >
            <Copy className="w-4 h-4 text-[#C89B5E]" />
            Barchasini ko'chirish
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadTxt}
            className="border-[#C89B5E]/40 text-[#C89B5E] hover:bg-[#C89B5E]/10 gap-1.5"
          >
            <Download className="w-4 h-4" />
            TXT Yuklab olish
          </Button>
        </div>
      </div>

      {/* Warning Box */}
      <div className="bg-amber-950/50 border border-amber-800/80 rounded-xl p-4 mb-6 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-200">
            ⚠️ DIQQAT: Parollar faqat bir marta ko'rsatiladi!
          </h4>
          <p className="text-xs text-amber-300/80 mt-1">
            Xavfsizlik nuqtai nazaridan ushbu parollar qayta ko'rinmaydi. Iltimos, hoziroq "Barchasini ko'chirish" yoki "TXT Yuklab olish" tugmasini bosing.
          </p>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {accounts.map((acc, idx) => (
          <div
            key={idx}
            className="bg-[#140a0b] border border-gray-800 rounded-xl p-3.5 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#C89B5E] uppercase tracking-wider bg-[#C89B5E]/10 border border-[#C89B5E]/20 px-2 py-0.5 rounded">
                {acc.label}
              </span>
              <span className="text-[10px] text-gray-500 font-mono">{acc.roleName}</span>
            </div>

            <div className="space-y-1 my-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Login:</span>
                <span className="font-mono font-medium text-white">{acc.username}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Parol:</span>
                <span className="font-mono font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  {acc.password}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCopyOne(acc, idx)}
              className="mt-3 text-xs text-gray-300 hover:text-white bg-gray-900/80 hover:bg-gray-800 border border-gray-800 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              {copiedIndex === idx ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-medium">Ko'chirildi</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Nusxalash</span>
                </>
              )}
            </button>
          </div>
        ))}
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
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 gap-2 shadow-lg"
        >
          <Sparkles className="w-4 h-4" />
          Restoranni ishga tushirish!
        </Button>
      </div>
    </Card>
  )
}
