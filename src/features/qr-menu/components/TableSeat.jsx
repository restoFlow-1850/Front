// Bitta stol — atrofida stullar bilan, xuddi teatr o'rindiqlar sxemasidagi kabi
// tepadan ko'rinish. Rang holatga qarab: kulrang = bo'sh, qizil = band, to'q sariq = tanlangan.
export default function TableSeat({ table, isSelected, onSelect }) {
  const chairCount = Math.min(Math.max(table.capacity, 1), 8)
  const size = table.capacity > 6 ? 76 : table.capacity > 4 ? 66 : 56
  const radius = size / 2 + 15
  const boxSize = radius * 2

  const chairs = Array.from({ length: chairCount })

  const state = table.isReserved ? 'reserved' : isSelected ? 'selected' : 'available'

  const tableClasses = {
    reserved: 'bg-[#5c1a1a] border-[#dc2626] text-[#E6DCDC]',
    selected: 'bg-[#C89B5E] border-[#D9A968] text-[#2a0e10] shadow-lg shadow-[#C89B5E]/30 scale-105',
    available:
      'bg-[#3a2224] border-[#5a3436] text-[#cbbcbc] hover:bg-[#4a2a2c] hover:border-[#C89B5E]',
  }[state]

  const chairClasses = {
    reserved: 'bg-[#dc2626]/60',
    selected: 'bg-[#D9A968]',
    available: 'bg-[#5a3436]',
  }[state]

  return (
    <button
      type="button"
      disabled={table.isReserved}
      onClick={() => onSelect(table)}
      title={`Stol ${table.number} — ${table.capacity} kishilik${table.location ? ' · ' + table.location : ''}${
        table.isReserved ? ' (band)' : ''
      }`}
      className={`relative m-4 flex items-center justify-center transition-transform ${
        table.isReserved ? 'cursor-not-allowed' : 'cursor-pointer'
      }`}
      style={{ width: boxSize, height: boxSize }}
    >
      {chairs.map((_, i) => {
        const angle = (2 * Math.PI * i) / chairCount - Math.PI / 2
        const x = radius + radius * Math.cos(angle) - 7
        const y = radius + radius * Math.sin(angle) - 7
        return (
          <span
            key={i}
            className={`absolute h-3.5 w-3.5 rounded-[3px] transition-colors ${chairClasses}`}
            style={{ left: x, top: y }}
          />
        )
      })}
      <span
        className={`flex flex-col items-center justify-center rounded-full border-2 font-bold transition-all ${tableClasses}`}
        style={{ width: size, height: size }}
      >
        <span className="text-sm leading-none">{table.number}</span>
        <span className="mt-1 text-[10px] font-normal leading-none opacity-90">
          {table.capacity} kishi
        </span>
      </span>
    </button>
  )
}
