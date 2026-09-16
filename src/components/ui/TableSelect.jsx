// TableSelect — stol tanlash uchun kastom picker.
// Stollar zonalar bo'yicha guruhlangan, raqam bo'yicha tartiblangan,
// tanlangan stol ajralib turadi (orange border).
import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronDown, Users, MapPin, X } from 'lucide-react'

function isVipTable(table) {
  return Boolean(table.location && /vip/i.test(table.location))
}

function zoneLabel(table) {
  if (isVipTable(table)) return 'VIP xona'
  return 'Asosiy zal'
}

export default function TableSelect({ label, value, onChange, options = [], placeholder = 'Stolni tanlang', disabled = false, error }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Tashqarida bosilganda yopiladi
  useEffect(() => {
    if (!open) return
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Tanlangan stol
  const selected = useMemo(() => options.find((o) => o.value === value), [options, value])

  // Zonalar bo'yicha guruhlash
  const grouped = useMemo(() => {
    const zones = {}
    const sorted = [...options].sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
    for (const opt of sorted) {
      const zone = opt.isVip ? 'VIP xona' : 'Asosiy zal'
      if (!zones[zone]) zones[zone] = []
      zones[zone].push(opt)
    }
    return zones
  }, [options])

  return (
    <div className="w-full" ref={ref}>
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen(!open)}
        className={`w-full rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
          ${error ? 'border-red-500' : open ? 'border-[#F97316] ring-2 ring-orange-100' : 'border-[#E5E7EB] hover:border-[#F97316]/50'}
          bg-[#FFFDF9] text-[#111827] dark:border-gray-700 dark:bg-gray-800 dark:text-white
          dark:focus:border-orange-400`}
      >
        <span className="flex items-center justify-between">
          <span className={selected ? '' : 'text-gray-400'}>
            {selected ? `Stol ${selected.number} — ${selected.label.split('—')[1]?.trim() || ''}` : placeholder}
          </span>
          <ChevronDown className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="relative z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-[#E5E7EB] bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
          {/* Tanlangan stolni tozalash */}
          {value && (
            <button
              type="button"
              onClick={() => { onChange({ target: { value: '' } }); setOpen(false) }}
              className="flex w-full items-center gap-2 border-b border-gray-100 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-950/30"
            >
              <X className="h-3 w-3" /> Tanlovni tozalash
            </button>
          )}

          {Object.entries(grouped).map(([zone, tables]) => (
            <div key={zone}>
              {/* Zone header */}
              <div className="sticky top-0 z-10 flex items-center gap-1.5 border-b border-gray-100 bg-gray-50/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-400">
                <MapPin className="h-3 w-3" />
                {zone}
                <span className="ml-auto text-[10px] font-normal normal-case">{tables.length} ta</span>
              </div>

              {/* Tables grid */}
              <div className="grid grid-cols-3 gap-1.5 p-2">
                {tables.map((opt) => {
                  const isSelected = opt.value === value
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { onChange({ target: { value: opt.value } }); setOpen(false) }}
                      className={`flex flex-col items-center gap-0.5 rounded-lg border-2 px-2 py-2 text-center transition-all
                        ${isSelected
                          ? 'border-[#F97316] bg-[#FFF7ED] shadow-sm dark:border-orange-400 dark:bg-orange-950/40'
                          : 'border-gray-200 hover:border-[#F97316]/40 hover:bg-orange-50/50 dark:border-gray-700 dark:hover:border-orange-400/40'
                        }`}
                    >
                      <span className={`text-lg font-bold ${isSelected ? 'text-[#F97316]' : 'text-[#111827] dark:text-white'}`}>
                        {opt.number}
                      </span>
                      <span className="flex items-center gap-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        <Users className="h-2.5 w-2.5" />
                        {opt.capacity}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
}
