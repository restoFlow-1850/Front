import { FiCalendar, FiClock, FiMinus, FiPlus, FiUsers } from 'react-icons/fi'
import TableSeat from './TableSeat'
import { buildTimeSlots, toDateInputValue } from '../lib/time'

export default function HallStep({
  date,
  time,
  guests,
  onDateChange,
  onTimeChange,
  onGuestsChange,
  tables,
  isLoading,
  selectedTable,
  onSelectTable,
  onNext,
}) {
  const timeSlots = buildTimeSlots(date)
  const zones = groupByLocation(tables)

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 rounded-2xl border border-[#4a1616] bg-[#1c0a0b] p-4 shadow-sm sm:grid-cols-3 sm:p-5">
        <label className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#cbbcbc]">
            <FiCalendar /> Sana
          </span>
          <input
            type="date"
            value={date}
            min={toDateInputValue(new Date())}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border border-[#4a1616] bg-[#150708] px-3 py-2 text-sm text-[#E6DCDC] outline-none focus:border-[#C89B5E] focus:ring-1 focus:ring-[#C89B5E] [color-scheme:dark]"
          />
        </label>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#cbbcbc]">
            <FiClock /> Vaqt
          </span>
          <select
            value={time}
            onChange={(e) => onTimeChange(e.target.value)}
            className="rounded-lg border border-[#4a1616] bg-[#150708] px-3 py-2 text-sm text-[#E6DCDC] outline-none focus:border-[#C89B5E] focus:ring-1 focus:ring-[#C89B5E] [color-scheme:dark]"
          >
            {timeSlots.length === 0 && <option value="">Bugun uchun vaqt qolmadi</option>}
            {timeSlots.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-[#cbbcbc]">
            <FiUsers /> Mehmonlar soni
          </span>
          <div className="flex items-center gap-3 rounded-lg border border-[#4a1616] px-2 py-1.5">
            <button
              type="button"
              onClick={() => onGuestsChange(Math.max(1, guests - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a1315] text-[#D9A968] hover:bg-[#3a1a1c]"
            >
              <FiMinus size={14} />
            </button>
            <span className="min-w-6 flex-1 text-center text-sm font-semibold text-[#E6DCDC]">
              {guests}
            </span>
            <button
              type="button"
              onClick={() => onGuestsChange(Math.min(20, guests + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a1315] text-[#D9A968] hover:bg-[#3a1a1c]"
            >
              <FiPlus size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-5 text-xs font-medium text-[#cbbcbc]">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#5a3436]" /> Bo'sh
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#dc2626]" /> Band
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#C89B5E]" /> Tanlangan
        </span>
      </div>

      <div className="rounded-2xl border border-[#4a1616] bg-[#1a0809] p-4 shadow-inner sm:p-6">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center text-sm text-[#8a7373]">
            Zal plani yuklanmoqda...
          </div>
        ) : tables.length === 0 ? (
          <div className="flex h-64 items-center justify-center text-sm text-[#8a7373]">
            Hozircha stollar mavjud emas
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {zones.map(([zoneName, zoneTables]) => (
              <div key={zoneName}>
                <h3 className="mb-2 text-sm font-semibold text-[#cbbcbc]">{zoneName}</h3>
                <div className="flex flex-wrap items-start justify-center gap-1 rounded-xl bg-[#20090a] p-3 sm:justify-start">
                  {zoneTables.map((table) => (
                    <TableSeat
                      key={table._id}
                      table={table}
                      isSelected={selectedTable?._id === table._id}
                      onSelect={onSelectTable}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-[#9a8080]">
          {selectedTable
            ? `Tanlandi: Stol ${selectedTable.number} (${selectedTable.capacity} kishilik)`
            : 'Davom etish uchun bo\'sh stolni tanlang'}
        </p>
        <button
          type="button"
          disabled={!selectedTable}
          onClick={onNext}
          className="rounded-lg bg-[#C89B5E] px-6 py-2.5 text-sm font-semibold text-[#2a0e10] shadow-sm transition hover:bg-[#D9A968] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Davom etish
        </button>
      </div>
    </div>
  )
}

function groupByLocation(tables) {
  const map = new Map()
  for (const table of tables) {
    const zone = table.location?.trim() || 'Asosiy zal'
    if (!map.has(zone)) map.set(zone, [])
    map.get(zone).push(table)
  }
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
}
