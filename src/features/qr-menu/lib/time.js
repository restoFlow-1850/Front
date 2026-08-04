const OPEN_HOUR = 10
const CLOSE_HOUR = 22

export function toDateInputValue(date) {
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function buildTimeSlots(dateStr) {
  const slots = []
  const now = new Date()
  const isToday = dateStr === toDateInputValue(now)
  const minMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1

  for (let h = OPEN_HOUR; h <= CLOSE_HOUR; h++) {
    for (const m of [0, 30]) {
      if (h === CLOSE_HOUR && m > 0) continue
      const totalMinutes = h * 60 + m
      if (totalMinutes < minMinutes) continue
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
}
