// Oshxona uchun ovozli signal: qisqa "chime" tovushi + ovozli xabar (TTS).
// Yangi buyurtma kelganda chaqiriladi (useKitchenOrders.js).
// Brauzer Web Audio API va SpeechSynthesis API dan foydalanadi — qo'shimcha
// kutubxona shart emas.

let audioCtx = null

function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return null
    audioCtx = new Ctx()
  }
  return audioCtx
}

// Ikki notali qisqa "ding-dong" chime — real oshxona qo'ng'irog'iga o'xshatilgan.
function playChime() {
  const ctx = getAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') ctx.resume()

  const notes = [
    { freq: 880, start: 0, duration: 0.18 },
    { freq: 660, start: 0.16, duration: 0.28 },
  ]

  notes.forEach(({ freq, start, duration }) => {
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.type = 'sine'
    oscillator.frequency.value = freq
    oscillator.connect(gain)
    gain.connect(ctx.destination)

    const startTime = ctx.currentTime + start
    gain.gain.setValueAtTime(0.0001, startTime)
    gain.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

    oscillator.start(startTime)
    oscillator.stop(startTime + duration + 0.05)
  })
}

function speak(message, langCode = 'uz') {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  const utterance = new window.SpeechSynthesisUtterance(message)
  // Brauzerlarning aksariyati 'uz-UZ' ovozini qo'llamaydi — shu sabab 'ru-RU'ga
  // tushamiz (eng yaqin qo'llab-quvvatlanadigan variant), boshqa tillar to'g'ridan-to'g'ri.
  const localeMap = { uz: 'ru-RU', ru: 'ru-RU', en: 'en-US' }
  utterance.lang = localeMap[langCode] || 'ru-RU'
  utterance.rate = 1
  utterance.volume = 1
  window.speechSynthesis.speak(utterance)
}

export function triggerNewOrderAlert(table, message, langCode = 'uz') {
  try {
    playChime()
    window.setTimeout(() => speak(message, langCode), 350)
  } catch {
    // Ovoz ishlamasa ham oshxona ekrani ishlashda davom etishi kerak — jim o'tkazamiz.
  }
}
