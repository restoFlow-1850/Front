// Ovozli bildirishnoma (Notification Sound) — Web Audio API orqali.
// Hech qanday tashqi .mp3 faylga bog'liq emas, barcha brauzerlarda 100% ishlaydi.

let sharedAudioCtx = null

function getAudioContext() {
  if (!sharedAudioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      sharedAudioCtx = new AudioContextClass()
    }
  }
  if (sharedAudioCtx && sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {})
  }
  return sharedAudioCtx
}

// Sahifaning ixtiyoriy joyiga birinchi bosishda audio kontekstni faollashtirish
if (typeof window !== 'undefined') {
  const unlockAudio = () => {
    const ctx = getAudioContext()
    if (ctx) {
      window.removeEventListener('click', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
      window.removeEventListener('touchstart', unlockAudio)
    }
  }
  window.addEventListener('click', unlockAudio, { once: true })
  window.addEventListener('keydown', unlockAudio, { once: true })
  window.addEventListener('touchstart', unlockAudio, { once: true })
}

/**
 * Yangi buyurtma va bildirishnoma kelganda yoqimli oshxona qo'ng'irog'i (Ding-Dong chime) chaladi
 */
export function playNotificationSound() {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // 1-ohang: D5 (587.33 Hz) — Ding
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.type = 'sine'
    osc1.frequency.setValueAtTime(587.33, now)
    gain1.gain.setValueAtTime(0.35, now)
    gain1.gain.exponentialRampToValueAtTime(0.0001, now + 0.6)
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.start(now)
    osc1.stop(now + 0.6)

    // 2-ohang: A5 (880 Hz) — Dong (120ms kechikish bilan)
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(880, now + 0.12)
    gain2.gain.setValueAtTime(0.45, now + 0.12)
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.9)
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.start(now + 0.12)
    osc2.stop(now + 0.9)
  } catch (err) {
    console.warn('[Sound] Audio ijro etishda ogohlantirish:', err)
  }
}
