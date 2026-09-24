import { useNavigate } from 'react-router-dom'
import { CheckCircle2, Sparkles, Building2, Utensils, Grid3X3, QrCode, Users, ExternalLink, ArrowRight } from 'lucide-react'
import { Button, Card } from '../../../components/ui'

export default function Step6Success({ wizardData, onReset }) {
  const navigate = useNavigate()

  const restaurantName = wizardData.name || 'Rayhon Milliy Taomlari'
  const city = wizardData.city || 'Toshkent'
  const menuCount = wizardData.menuItems?.length || 0
  const tablesCount = wizardData.totalTables || 0
  const hallsCount = wizardData.halls?.length || 0
  const staffCount = wizardData.staffAccounts?.length || 5

  const loginUrl = `${window.location.origin}/login`
  const guestUrl = `${window.location.origin}/guest`

  return (
    <Card className="p-8 max-w-2xl mx-auto shadow-2xl border-emerald-800/40 bg-[#161f1a]/95 text-center">
      <div className="w-20 h-20 rounded-full bg-emerald-900/60 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950 px-3 py-1 rounded-full border border-emerald-800">
        ⚡ 10 Daqiqada Boshdan-Oxirigacha
      </span>

      <h1 className="text-3xl font-extrabold text-white mt-3 mb-1">
        RESTORAN TAYYOR! 🎉
      </h1>
      <p className="text-sm text-gray-300 max-w-md mx-auto mb-6">
        Tabriklaymiz, <strong className="text-emerald-400">{restaurantName}</strong> tizimda to'liq sozlandi va ishga tushirishga tayyor!
      </p>

      {/* Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6 text-left">
        <div className="bg-[#121915] border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Building2 className="w-4 h-4 text-[#C89B5E]" /> Restoran
          </div>
          <p className="text-sm font-bold text-white truncate">{restaurantName}</p>
          <p className="text-[11px] text-gray-500">{city}</p>
        </div>

        <div className="bg-[#121915] border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Utensils className="w-4 h-4 text-[#C89B5E]" /> Menyu
          </div>
          <p className="text-sm font-bold text-white">{menuCount} ta taom</p>
          <p className="text-[11px] text-emerald-400">Excel'dan yuklandi</p>
        </div>

        <div className="bg-[#121915] border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Grid3X3 className="w-4 h-4 text-[#C89B5E]" /> Stollar
          </div>
          <p className="text-sm font-bold text-white">{tablesCount} ta stol</p>
          <p className="text-[11px] text-gray-500">{hallsCount} ta zal bo'yicha</p>
        </div>

        <div className="bg-[#121915] border border-gray-800 rounded-xl p-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <QrCode className="w-4 h-4 text-[#C89B5E]" /> QR Paket
          </div>
          <p className="text-sm font-bold text-emerald-400">A4 PDF Tayyor</p>
          <p className="text-[11px] text-gray-500">Chop etishga tayyor</p>
        </div>

        <div className="bg-[#121915] border border-gray-800 rounded-xl p-3 col-span-2 sm:col-span-2">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Users className="w-4 h-4 text-[#C89B5E]" /> Akkauntlar
          </div>
          <p className="text-sm font-bold text-white">{staffCount} ta xodimlarga rol va parollar biriktirildi</p>
          <p className="text-[11px] text-emerald-400">Admin, Manager, Kassir, Ofitsiant, Oshpaz</p>
        </div>
      </div>

      {/* Login URL display */}
      <div className="bg-[#0f1712] border border-emerald-800/60 rounded-xl p-4 mb-6 text-left">
        <span className="text-xs font-medium text-emerald-400 block mb-1">
          🔗 Tizimga kirish havolasi:
        </span>
        <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-lg border border-gray-800">
          <code className="text-xs font-mono text-emerald-300 truncate">{loginUrl}</code>
          <a
            href={loginUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#C89B5E] hover:underline flex items-center gap-1 shrink-0 ml-2"
          >
            Ochish <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button
          onClick={() => navigate('/dashboard')}
          className="w-full sm:w-auto bg-[#C89B5E] hover:bg-[#b08449] text-[#1e1112] font-semibold px-6 gap-2"
        >
          Boshqaruv paneliga o'tish
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={onReset}
          className="w-full sm:w-auto border-gray-700 text-gray-300 hover:bg-gray-800 gap-2"
        >
          Yangi restoran sozlash
        </Button>
      </div>
    </Card>
  )
}
