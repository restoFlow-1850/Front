export const AI_STORAGE_KEY = 'restoflow.ai-chat.messages'
export const MAX_HISTORY = 20
export const MAX_STORED = 50
export const MAX_TOOL_BADGES = 12

// Backend tool nomlari har xil yozilishi mumkin (daily_sales, dailySales,
// sales_report...). Hammasini bitta kanonik kalitga keltiramiz — shunda
// tarjima fayllarida faqat shu kalitlar turadi.
const TOOL_ALIASES = {
  daily_sales: 'dailySales',
  daily_sale: 'dailySales',
  dailysales: 'dailySales',
  sales: 'dailySales',
  sale: 'dailySales',
  sales_report: 'dailySales',
  salesreport: 'dailySales',
  revenue: 'dailySales',
  revenue_report: 'dailySales',
  savdo: 'dailySales',
  kunlik_savdo: 'dailySales',
  inventory: 'inventory',
  inventories: 'inventory',
  stock: 'inventory',
  warehouse: 'inventory',
  ombor: 'inventory',
  menu: 'menu',
  products: 'menu',
  product: 'menu',
  dishes: 'menu',
  orders: 'orders',
  order: 'orders',
  buyurtmalar: 'orders',
  staff: 'staff',
  employees: 'staff',
  employee: 'staff',
  team: 'staff',
  workers: 'staff',
  xodimlar: 'staff',
  tables: 'tables',
  table: 'tables',
  stollar: 'tables',
  reservations: 'reservations',
  reservation: 'reservations',
  bookings: 'reservations',
  bronlar: 'reservations',
  feedback: 'feedback',
  review: 'feedback',
  reviews: 'feedback',
  complaints: 'feedback',
  fikrlar: 'feedback',
  reports: 'reports',
  report: 'reports',
  analytics: 'reports',
  hisobot: 'reports',
}

export const TOOL_EMOJI = {
  dailySales: '📊',
  inventory: '📦',
  menu: '🍽️',
  orders: '🧾',
  staff: '👥',
  tables: '🪑',
  reservations: '📅',
  feedback: '💬',
  reports: '📈',
  custom: '🔧',
}

function normalizeToolName(value) {
  return String(value ?? '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function toolKeyFromName(name) {
  return TOOL_ALIASES[normalizeToolName(name)] ?? 'custom'
}

function toolNameOf(entry) {
  if (typeof entry === 'string') return entry.trim()
  if (!entry || typeof entry !== 'object') return ''
  const candidate =
    entry.name ??
    entry.tool ??
    entry.toolName ??
    entry.tool_name ??
    entry.function?.name ??
    entry.function?.tool ??
    entry.id
  return typeof candidate === 'string' ? candidate.trim() : ''
}

function parseToolEntries(raw) {
  if (!raw) return []
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    if (!trimmed) return []
    if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
      try {
        return parseToolEntries(JSON.parse(trimmed))
      } catch {
        return [trimmed]
      }
    }
    return [trimmed]
  }
  if (Array.isArray(raw)) return raw
  if (typeof raw === 'object') {
    for (const key of ['toolCalls', 'tool_calls', 'tools', 'calls']) {
      if (key in raw) return parseToolEntries(raw[key])
    }
    return [raw]
  }
  return []
}

export function humanizeToolName(name) {
  const text = String(name ?? '')
    .replace(/[_-]+/g, ' ')
    .trim()
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : ''
}

/** data.toolCalls -> [{ name, key }] (takrorlar olib tashlanadi). */
export function normalizeToolCalls(raw) {
  const result = []
  const seen = new Set()

  for (const entry of parseToolEntries(raw)) {
    const name = toolNameOf(entry)
    if (!name) continue
    const key = toolKeyFromName(name)
    const dedupeKey = key === 'custom' ? `custom:${normalizeToolName(name)}` : key
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    result.push({ name, key })
    if (result.length >= MAX_TOOL_BADGES) break
  }

  return result
}

export const QUICK_PROMPTS = [
  {
    id: 'sales',
    label: 'Bugungi savdo',
    prompt: "Bugungi savdo ko'rsatkichlarini qanday tahlil qilishim mumkin?",
  },
  {
    id: 'menu',
    label: 'Menyu optimizatsiyasi',
    prompt: 'Menyuni qanday qilib foydaliroq qilish mumkin?',
  },
  {
    id: 'inventory',
    label: 'Ombor nazorati',
    prompt: "Ombor zaxirasini kamaytirish uchun nimalarga e'tibor berish kerak?",
  },
  {
    id: 'staff',
    label: 'Xodimlar samaradorligi',
    prompt: "Xodimlar ish samaradorligini oshirish bo'yicha maslahat ber.",
  },
  {
    id: 'tables',
    label: 'Stollar bandligi',
    prompt: "Stollar bandligini oshirish va bronlarni boshqarish bo'yicha maslahat ber.",
  },
  {
    id: 'feedback',
    label: 'Mijozlar fikri',
    prompt: "Mijozlar fikrlari bilan qanday ishlash kerak?",
  },
]

const makeId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`

export function createMessage(role, content, extra = {}) {
  const message = {
    id: makeId(),
    role,
    content: String(content ?? '').trim(),
    createdAt: new Date().toISOString(),
    ...extra,
  }
  if ('toolCalls' in message) {
    message.toolCalls = normalizeToolCalls(message.toolCalls)
  }
  return message
}

// Suhbat joriy tab sessiyasida saqlanadi: sahifa yangilanganda (F5) tarix
// yo'qolmaydi, lekin brauzer yopilgach tozalanadi.
function defaultStorage() {
  try {
    return globalThis.sessionStorage ?? null
  } catch {
    return null
  }
}

export function toApiMessages(messages = []) {
  return messages
    .filter((message) => message && (message.role === 'user' || message.role === 'assistant'))
    .filter((message) => typeof message.content === 'string' && message.content.trim())
    .slice(-MAX_HISTORY)
    .map((message) => ({ role: message.role, content: message.content }))
}

export function loadMessages(storage = defaultStorage()) {
  try {
    const raw = storage?.getItem(AI_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (message) =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string' &&
          message.content.trim(),
      )
      .map((message) => ({
        id: message.id || makeId(),
        role: message.role,
        content: message.content,
        createdAt: message.createdAt || new Date().toISOString(),
        source: message.source,
        toolCalls: normalizeToolCalls(message.toolCalls),
      }))
  } catch {
    return []
  }
}

export function saveMessages(messages = [], storage = defaultStorage()) {
  try {
    storage?.setItem(AI_STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)))
  } catch {
    return
  }
}

export function clearStoredMessages(storage = defaultStorage()) {
  try {
    storage?.removeItem(AI_STORAGE_KEY)
  } catch {
    return
  }
}

export function formatMessageTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

const INTENTS = [
  {
    match: /salom|assalom|hello|hi\b|hayrli/i,
    reply:
      "Salom! Men RestoFlow AI yordamchisiman. Menyu, buyurtmalar, ombor, xodimlar, stollar va mijozlar fikrlari bo'yicha savollaringizga yordam beraman. Nimadan boshlaymiz?",
  },
  {
    match: /savdo|sotuv|daromad|tushum|kassa|hisobot|analitika/i,
    reply:
      "Savdoni tahlil qilish uchun avval Hisobotlar bo'limidagi kunlik savdo va to'lov usullari kesimini ko'ring. Eng foydali ko'rsatkichlar: o'rtacha chek, eng ko'p sotilgan taomlar va soatlar bo'yicha yuklama. Agar o'rtacha chek past bo'lsa, menyuda kombinatsiya takliflarini sinab ko'ring.",
  },
  {
    match: /menyu|taom|narx|kategoriya|porsiya/i,
    reply:
      "Menyuni optimallashtirish uchun: 1) eng ko'p sotilgan 20% taomni ajratib ko'rsating; 2) tannarxi yuqori, lekin kam sotiladigan taomlarni qayta ko'rib chiqing; 3) mavsumiy takliflarni qo'shing; 4) narxlarni raqobatchilar bilan solishtiring. Menyu bo'limida taomlarni kategoriyalar bo'yicha tartibga solish ham mijoz tanlovini tezlashtiradi.",
  },
  {
    match: /ombor|zaxira|ingredient|qoldiq|ta'minot/i,
    reply:
      "Ombor nazorati uchun minimal zaxira chegaralarini belgilang va kam qolgan ingredientlar bo'yicha ogohlantirishlarni yoqing. Har hafta kirim-chiqimni solishtiring, sekin aylanadigan mahsulotlarni kamaytiring. Ombor bo'limidagi harakatlar tarixi qaysi ingredient ko'p sarflanayotganini ko'rsatadi.",
  },
  {
    match: /xodim|ishchi|ofitsiant|oshpaz|kassir|samarador/i,
    reply:
      "Xodimlar samaradorligini oshirish uchun smenalarni eng gavjum soatlarga moslang, har bir rol uchun aniq vazifalar belgilang va davomatni muntazam kuzatib boring. Xodimlar bo'limidagi davomat va harakatlar tarixi orqali kechikishlar hamda buyurtmalarni qayta ishlash tezligini tahlil qilishingiz mumkin.",
  },
  {
    match: /stol|bron|band|zal|vip/i,
    reply:
      "Stollar bandligini oshirish uchun eng gavjum soatlarda bronlarni oldindan qabul qiling, VIP va katta stollarni alohida ajratib boshqaring. Stollar xaritasida bo'sh stollarni tez yangilab turish ofitsiantlarga vaqt tejaydi. Bronlar bo'limida kelmagan mijozlar ulushini ham kuzatib boring.",
  },
  {
    match: /buyurtma|zakaz|order/i,
    reply:
      "Buyurtmalar oqimini tezlashtirish uchun oshxona va ofitsiant o'rtasidagi holat almashinuvini real vaqtda kuzating. Kechikkan buyurtmalarni rang bo'yicha ajratib ko'rsatish va tayyor taomlarni darhol yopish muhim. Buyurtmalar bo'limidagi filtrlar orqali faol buyurtmalarni tanlab oling.",
  },
  {
    match: /fikr|shikoyat|reyting|mijoz|feedback/i,
    reply:
      "Mijozlar fikrlari bilan ishlashda 1-2 yulduzli shikoyatlarga birinchi navbatda javob bering. Javobda muammoni tan oling, yechim va muddatni aniq ayting. Mijozlar fikri bo'limida holatni 'Ko'rib chiqilgan' deb belgilash va admin javobini yozish tarixni tartibli saqlaydi.",
  },
]

const DEFAULT_REPLY =
  "Savolingizni tushundim. Men restoran boshqaruvi bo'yicha yordam bera olaman: savdo tahlili, menyu, ombor, xodimlar, stollar, buyurtmalar va mijozlar fikrlari. Savolni aniqroq yozsangiz, amaliy maslahat beraman."

export function localAssistantReply(prompt) {
  const text = String(prompt ?? '')
  if (!text.trim()) return DEFAULT_REPLY
  const intent = INTENTS.find((item) => item.match.test(text))
  return intent ? intent.reply : DEFAULT_REPLY
}
