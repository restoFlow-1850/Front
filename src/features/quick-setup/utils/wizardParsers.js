/**
 * Matn shaklidagi zallar va stollarni tahlil qilish.
 * Masalan:
 * "Asosiy zal: 20 stol"
 * "VIP zal: 5 stol"
 * "Teras - 10"
 */
export function parseHallsAndTablesInput(input) {
  if (!input || typeof input !== 'string') return []

  const lines = input.split('\n').map((l) => l.trim()).filter(Boolean)
  const results = []

  lines.forEach((line) => {
    // Matches patterns like "Asosiy zal: 20 stol", "VIP zal - 5", "Teras: 10 stol"
    const match = line.match(/^([^:-]+)[:\-]\s*(\d+)\s*(?:stol|ta)?/i)
    if (match) {
      const name = match[1].trim()
      const count = parseInt(match[2], 10)
      if (name && !isNaN(count) && count > 0) {
        const tables = Array.from({ length: count }, (_, i) => ({
          number: i + 1,
          name: `${name} — ${i + 1}-stol`,
          hallName: name,
        }))
        results.push({ name, count, tables })
      }
    } else {
      // Fallback regex if line has number
      const numberMatch = line.match(/(\d+)/)
      if (numberMatch) {
        const count = parseInt(numberMatch[1], 10)
        const name = line.replace(/\d+/g, '').replace(/[:\-]/g, '').trim() || 'Zal'
        if (count > 0) {
          const tables = Array.from({ length: count }, (_, i) => ({
            number: i + 1,
            name: `${name} — ${i + 1}-stol`,
            hallName: name,
          }))
          results.push({ name, count, tables })
        }
      }
    }
  })

  return results
}

/**
 * 5 ta rol uchun avtomatik xodimlarning foydalanuvchi nomi va bir martalik parolini generatsiya qilish
 */
export function generateStaffAccounts(restaurantName = 'resto') {
  const cleanName = restaurantName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10) || 'resto'

  const getRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let pass = ''
    for (let i = 0; i < 6; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `Resto#${pass}`
  }

  const roles = [
    { key: 'admin', roleName: 'ADMIN', label: 'Administrator', desc: 'Barcha tizim huquqlari va boshqaruv' },
    { key: 'manager', roleName: 'MANAGER', label: 'Menedjer', desc: 'Sotuv, menyu va xodimlarni boshqarish' },
    { key: 'cashier', roleName: 'CASHIER', label: 'Kassir', desc: 'Kassa operatsiyalari va to\'lovlar' },
    { key: 'waiter', roleName: 'WAITER', label: 'Ofitsiant', desc: 'Buyurtmalar qabul qilish va stollar' },
    { key: 'cook', roleName: 'COOK', label: 'Oshpaz', desc: 'Oshxona ekrani va taomlar holati' },
  ]

  return roles.map((r) => ({
    ...r,
    username: `${r.key}_${cleanName}`,
    password: getRandomPassword(),
  }))
}

/**
 * Demo menyu ma'lumotlari (1-click instant load uchun)
 */
export const DEMO_MENU_DATA = [
  { nom: 'Toshkent Palov', kategoriya: 'Milliy taomlar', narx: 38000, tavsif: 'An\'anaviy qo\'y go\'shtli maxsus osh' },
  { nom: 'Tandir Somsa', kategoriya: 'Milliy taomlar', narx: 14000, tavsif: 'Mazzali tandirda yopilgan mol go\'shtli somsa' },
  { nom: 'Miyon Shashlik', kategoriya: 'Kabablar', narx: 22000, tavsif: 'Yumshoq qo\'y go\'shtidan shashlik' },
  { nom: 'Mastava', kategoriya: 'Suyuq taomlar', narx: 28000, tavsif: 'Guruchli va sabzavotli quyuq sorba' },
  { nom: 'Ko\'k Choy (Choynak)', kategoriya: 'Ichimliklar', narx: 5000, tavsif: 'Xushbo\'y ko\'k choy' },
  { nom: 'Qora Choy (Choynak)', kategoriya: 'Ichimliklar', narx: 5000, tavsif: 'Limonli damlangan qora choy' },
  { nom: 'Moxito Limonad', kategoriya: 'Ichimliklar', narx: 24000, tavsif: 'Yalpiz va limonli muzli salqin ichimlik' },
  { nom: 'Muzqaymoq Assorti', kategoriya: 'Shirinliklar', narx: 20000, tavsif: 'Shokolad va meva qiyomli muzqaymoq' },
]
