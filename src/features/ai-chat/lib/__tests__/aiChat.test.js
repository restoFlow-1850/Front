import { describe, it, expect } from 'vitest'

import {
  AI_STORAGE_KEY,
  MAX_HISTORY,
  MAX_STORED,
  QUICK_PROMPTS,
  clearStoredMessages,
  createMessage,
  formatMessageTime,
  humanizeToolName,
  loadMessages,
  localAssistantReply,
  normalizeToolCalls,
  saveMessages,
  toApiMessages,
} from '../aiChat'

function createStorage(initial = {}) {
  const map = new Map(Object.entries(initial))
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key),
    has: (key) => map.has(key),
  }
}

describe('createMessage', () => {
  it("matnni trim qiladi va standart maydonlarni to'ldiradi", () => {
    const message = createMessage('user', '  Salom  ')
    expect(message.role).toBe('user')
    expect(message.content).toBe('Salom')
    expect(typeof message.id).toBe('string')
    expect(message.id.length).toBeGreaterThan(0)
    expect(Number.isNaN(new Date(message.createdAt).getTime())).toBe(false)
  })

  it("qo'shimcha maydonlarni saqlaydi", () => {
    expect(createMessage('assistant', 'Javob', { source: 'local' }).source).toBe('local')
  })

  it('toolCalls ni normallashtirib saqlaydi', () => {
    const message = createMessage('assistant', 'Javob', { toolCalls: ['daily_sales', 'stock'] })
    expect(message.toolCalls).toEqual([
      { name: 'daily_sales', key: 'dailySales' },
      { name: 'stock', key: 'inventory' },
    ])
  })

  it('bo\'sh qiymatni bo\'sh satrga aylantiradi', () => {
    expect(createMessage('user', null).content).toBe('')
    expect(createMessage('user', undefined).content).toBe('')
  })
})

describe('toApiMessages', () => {
  it("faqat user va assistant rollarini qoldiradi", () => {
    const result = toApiMessages([
      { role: 'system', content: 'yashirin' },
      { role: 'user', content: 'Savol' },
      { role: 'assistant', content: 'Javob' },
    ])
    expect(result).toEqual([
      { role: 'user', content: 'Savol' },
      { role: 'assistant', content: 'Javob' },
    ])
  })

  it("bo'sh va noto'g'ri xabarlarni tashlab ketadi", () => {
    const result = toApiMessages([
      { role: 'user', content: '   ' },
      { role: 'assistant' },
      null,
      { role: 'user', content: 'OK' },
    ])
    expect(result).toEqual([{ role: 'user', content: 'OK' }])
  })

  it('oxirgi MAX_HISTORY ta xabarni qaytaradi', () => {
    const messages = Array.from({ length: MAX_HISTORY + 5 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `xabar-${index}`,
    }))
    const result = toApiMessages(messages)
    expect(result).toHaveLength(MAX_HISTORY)
    expect(result[0].content).toBe('xabar-5')
    expect(result.at(-1).content).toBe(`xabar-${MAX_HISTORY + 4}`)
  })
})

describe('loadMessages / saveMessages', () => {
  it("saqlangan xabarlarni o'qiydi", () => {
    const storage = createStorage({
      [AI_STORAGE_KEY]: JSON.stringify([
        { id: '1', role: 'user', content: 'Salom', createdAt: '2026-01-01T10:00:00.000Z' },
      ]),
    })
    const messages = loadMessages(storage)
    expect(messages).toHaveLength(1)
    expect(messages[0]).toMatchObject({ id: '1', role: 'user', content: 'Salom' })
  })

  it('saqlangan toolCalls ni normallashtirib qaytaradi', () => {
    const storage = createStorage({
      [AI_STORAGE_KEY]: JSON.stringify([
        {
          id: '1',
          role: 'assistant',
          content: 'Javob',
          toolCalls: [{ name: 'daily_sales' }, { name: 'inventory' }],
        },
      ]),
    })

    expect(loadMessages(storage)[0].toolCalls).toEqual([
      { name: 'daily_sales', key: 'dailySales' },
      { name: 'inventory', key: 'inventory' },
    ])
  })

  it("buzilgan JSON uchun bo'sh massiv qaytaradi", () => {
    expect(loadMessages(createStorage({ [AI_STORAGE_KEY]: '{not json' }))).toEqual([])
  })

  it("massiv bo'lmagan JSON uchun bo'sh massiv qaytaradi", () => {
    expect(loadMessages(createStorage({ [AI_STORAGE_KEY]: '{"a":1}' }))).toEqual([])
  })

  it("noto'g'ri rollarni filtrlaydi", () => {
    const storage = createStorage({
      [AI_STORAGE_KEY]: JSON.stringify([
        { role: 'system', content: 'yashirin' },
        { role: 'user', content: 'OK' },
      ]),
    })
    expect(loadMessages(storage)).toHaveLength(1)
  })

  it(`ko'pi bilan ${MAX_STORED} ta xabarni saqlaydi`, () => {
    const storage = createStorage()
    const messages = Array.from({ length: MAX_STORED + 10 }, (_, index) => ({
      id: String(index),
      role: 'user',
      content: `xabar-${index}`,
    }))
    saveMessages(messages, storage)
    const saved = JSON.parse(storage.getItem(AI_STORAGE_KEY))
    expect(saved).toHaveLength(MAX_STORED)
    expect(saved[0].content).toBe('xabar-10')
  })

  it("saqlashda xato bo'lsa yiqilmaydi", () => {
    const storage = {
      setItem: () => {
        throw new Error('quota')
      },
    }
    expect(() => saveMessages([{ role: 'user', content: 'x' }], storage)).not.toThrow()
  })

  it('tarixni tozalaydi', () => {
    const storage = createStorage({ [AI_STORAGE_KEY]: '[]' })
    clearStoredMessages(storage)
    expect(storage.has(AI_STORAGE_KEY)).toBe(false)
  })
})

describe('localAssistantReply', () => {
  it('salomlashuvga javob beradi', () => {
    expect(localAssistantReply('Salom')).toMatch(/RestoFlow AI/)
  })

  it("ombor haqidagi savolga ombor bo'yicha javob beradi", () => {
    expect(localAssistantReply('Ombordagi zaxirani qanday nazorat qilaman?')).toMatch(/Ombor/)
  })

  it("noma'lum savolga umumiy javob qaytaradi", () => {
    expect(localAssistantReply('Marsga qachon ucha olamiz?')).toMatch(/restoran boshqaruvi/i)
  })

  it("bo'sh savolga umumiy javob qaytaradi", () => {
    expect(localAssistantReply('')).toMatch(/restoran boshqaruvi/i)
  })
})

describe('QUICK_PROMPTS', () => {
  it("har bir tayyor savolda id, label va prompt bor", () => {
    expect(QUICK_PROMPTS.length).toBeGreaterThan(0)
    for (const item of QUICK_PROMPTS) {
      expect(item.id).toBeTruthy()
      expect(item.label).toBeTruthy()
      expect(item.prompt).toBeTruthy()
    }
  })
})

describe('normalizeToolCalls', () => {
  it("turli ko'rinishdagi tool nomlarini kanonik kalitga keltiradi", () => {
    expect(
      normalizeToolCalls([
        { name: 'daily_sales' },
        { tool: 'inventory' },
        'orders',
        { function: { name: 'sales_report' } },
      ]),
    ).toEqual([
      { name: 'daily_sales', key: 'dailySales' },
      { name: 'inventory', key: 'inventory' },
      { name: 'orders', key: 'orders' },
    ])
  })

  it('takrorlarni olib tashlaydi', () => {
    expect(
      normalizeToolCalls([{ name: 'inventory' }, { name: 'stock' }, { name: 'inventory' }]),
    ).toEqual([{ name: 'inventory', key: 'inventory' }])
  })

  it("JSON satr va bo'sh qiymatlarni qabul qiladi", () => {
    expect(normalizeToolCalls('["menu"]')).toEqual([{ name: 'menu', key: 'menu' }])
    expect(normalizeToolCalls(null)).toEqual([])
    expect(normalizeToolCalls('')).toEqual([])
    expect(normalizeToolCalls([{}, null, 42])).toEqual([])
  })

  it("noma'lum tool nomini custom sifatida saqlaydi", () => {
    expect(normalizeToolCalls([{ name: 'weather_api' }])).toEqual([
      { name: 'weather_api', key: 'custom' },
    ])
  })
})

describe('humanizeToolName', () => {
  it("pastki chiziqlarni bo'sh joyga almashtiradi", () => {
    expect(humanizeToolName('weather_api')).toBe('Weather api')
  })
})

describe('formatMessageTime', () => {
  it('ISO sanani HH:MM ga aylantiradi', () => {
    const value = formatMessageTime('2026-01-01T10:05:00.000Z')
    expect(value).toMatch(/^\d{2}:\d{2}$/)
  })

  it("noto'g'ri sana uchun bo'sh satr qaytaradi", () => {
    expect(formatMessageTime('not-a-date')).toBe('')
  })
})
