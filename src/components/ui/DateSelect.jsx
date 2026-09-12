// DateSelect — sana va vaqt tanlash uchun soddalashtirilgan picker.
// Sana: tez tanlov chip'lari (Bugun, Ertaga, ...) + kompakt kalendar input.
// Vaqt: tayyor slotlar (10:00–22:00, 30 daq interval).
import { useState, useMemo } from 'react'
import { Calendar, Clock } from 'lucide-react'

// Bugun → "2026-08-29" formatida
function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Bir kun qo'shish
function addDays(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// "2026-08-29" → "29 avg"
function shortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  const months = ['yan', 'feb', 'mar', 'apr', 'may', 'iyun', 'iyul', 'avg', 'sen', 'okt', 'noy', 'dek']
  return `${d.getDate()} ${months[d.getMonth()]}`
}

// Vaqt slotlari: 10:00 - 22:00, 30 daq intervalda
function buildTimeSlots() {
  const slots = []
  for (let h = 10; h <= 22; h++) {
    slots.push(`${String(h).padStart(2, '0')}:00`)
    if (h < 22) slots.push(`${String(h).padStart(2, '0')}:30`)
  }
  return slots
}

const TIME_SLOTS = buildTimeSlots()

// Tez tanlov chip'lari
function DateChips({ value, onChange }) {
  const today = todayStr()
  const seen = new Set()
  const chips = []
  const addChip = (label, date) => {
    if (!seen.has(date)) {
      seen.add(date)
      chips.push({ label, date })
    }
  }
  addChip('Bugun', today)
  addChip('Ertaga', addDays(today, 1))
  addChip('Indin', addDays(today, 2))
  // Keyingi dushanba (kamida 3 kundan keyin)
  const d = new Date(today + 'T00:00:00')
  const dayOfWeek = d.getDay() // 0=Yak, 1=Dush, ...
  const diff = dayOfWeek === 1 ? 7 : ((8 - dayOfWeek) % 7 || 7)
  if (diff >= 3) addChip('Keyingi dushanba', addDays(today, diff))

  return (
    <div className="flex flex-wrap gap-1.5">
      {chips.map((chip) => (
        <button
          key={chip.date}
          type="button"
          onClick={() => onChange(chip.date)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all
            ${value === chip.date
              ? 'border-[#F97316] bg-[#FFF7ED] text-[#F97316] shadow-sm'
              : 'border-gray-200 text-gray-600 hover:border-[#F97316]/40 hover:bg-orange-50/50 dark:border-gray-700 dark:text-gray-400'
            }`}
        >
          {chip.label}
        </button>
      ))}
    </div>
  )
}

export default function DateSelect({ label, dateValue, timeValue, onDateChange, onTimeChange, error }) {
  const today = todayStr()

  return (
    <div className="space-y-2">
      {label && (
        <label className="mb-1 block text-sm font-semibold text-[#111827] dark:text-gray-200">
          {label}
        </label>
      )}

      {/* Sana */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Calendar className="h-3.5 w-3.5" /> Sana
        </div>
        <DateChips value={dateValue} onChange={onDateChange} />

        {/* Kompakt kalendar — boshqa sana kerak bo'lsa */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateValue}
            min={today}
            onChange={(e) => onDateChange(e.target.value)}
            className="rounded-lg border border-gray-200 bg-[#FFFDF9] px-3 py-1.5 text-xs font-medium text-[#111827] outline-none transition-all
              focus:border-[#F97316] focus:ring-2 focus:ring-orange-100
              dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
          {dateValue && (
            <span className="text-xs font-medium text-[#F97316]">{shortDate(dateValue)}</span>
          )}
        </div>
      </div>

      {/* Vaqt */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
          <Clock className="h-3.5 w-3.5" /> Vaqt
        </div>
        <div className="flex flex-wrap gap-1.5">
          {TIME_SLOTS.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onTimeChange(slot)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all
                ${timeValue === slot
                  ? 'border-[#F97316] bg-[#F97316] text-white shadow-sm'
                  : 'border-gray-200 text-gray-600 hover:border-[#F97316]/40 hover:bg-orange-50/50 dark:border-gray-700 dark:text-gray-400'
                }`}
            >
              {slot}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
}
