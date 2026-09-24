// Mehmon (QR-menyu) oqimi uchun umumiy sarlavha — RestoFlow brendi,
// restoran nomi va stol raqamini ko'rsatadi. Landing'dagi tashrif sahifasidagi
// uslub bilan bir xil (qora fon, orange aksent).
import { UtensilsCrossed, MapPin } from 'lucide-react'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'

export function GuestHeader({ restaurant, tableNumber, children }) {
  const restName = restaurant?.name || null
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#0F172A] to-[#1E293B] text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/30">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">
                Resto<span className="text-[#F97316]">Flow</span>
              </p>
              {restName ? (
                <p className="flex max-w-[180px] items-center gap-1 truncate text-[11px] font-bold text-[#F97316]">
                  <MapPin size={11} /> {restName}
                  {tableNumber && <span className="text-slate-400">· stol {tableNumber}</span>}
                </p>
              ) : (
                <p className="text-[11px] font-bold text-slate-400">
                  {tableNumber ? `Stol ${tableNumber}` : 'Onlayn menyu'}
                </p>
              )}
            </div>
          </div>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-6 sm:px-6">{children}</main>
    </div>
  )
}

export default GuestHeader