const OPEN_HOUR = 10
const CLOSE_HOUR = 22

export function toDateInputValue(date) {
  const d = new Date(date)
  const offset = d.getTimezoneOffset()
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10)
}

export function buildTimeSlots(dateStr) {
  const now = new Date()
  const isToday = dateStr === toDateInputValue(now)
  const minMinutes = isToday ? now.getHours() * 60 + now.getMinutes() + 30 : -1

  return Array.from({ length: CLOSE_HOUR - OPEN_HOUR + 1 }, (_, i) => i + OPEN_HOUR).flatMap((h) =>
    [0, 30]
      .filter((m) => h !== CLOSE_HOUR || m === 0)
      .filter((m) => h * 60 + m >= minMinutes)
      .map((m) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`),
  )
}
