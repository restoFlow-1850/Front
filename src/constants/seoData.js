export const RESTOFLOW_ORGANIZATION_SCHEMA = {
  '@type': 'Organization',
  '@id': 'https://restoflow.uz/#organization',
  name: 'RestoFlow',
  url: 'https://restoflow.uz',
  logo: {
    '@type': 'ImageObject',
    url: 'https://restoflow.uz/restoflow-logo.svg',
    width: '512',
    height: '512',
  },
  description:
    "Restoran, kafe, oshxona va choyxonalarni avtomatlashtirish uchun zamonaviy bulutli POS va boshqaruv tizimi.",
  sameAs: [
    'https://t.me/restoflow',
    'https://instagram.com/restoflow.uz',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+998-71-200-00-00',
    contactType: 'customer service',
    areaServed: 'UZ',
    availableLanguage: ['uz', 'ru', 'en'],
  },
}

export const RESTOFLOW_SOFTWARE_SCHEMA = {
  '@type': 'SoftwareApplication',
  '@id': 'https://restoflow.uz/#software',
  name: 'RestoFlow POS',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, Android, iOS, Windows, macOS',
  offers: {
    '@type': 'AggregateOffer',
    priceCurrency: 'UZS',
    lowPrice: '0',
    highPrice: '350000',
    offerCount: '3',
    price: '0',
  },
  description:
    "Restoran va kafelar uchun qulay kassa (POS), ofitsiant va oshxona KDS tizimi, QR raqamli menyu, ombor kalkulyatsiyasi va real-vaqt moliya tahlili.",
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
}

export const LANDING_FAQ_ITEMS = [
  {
    question: "RestoFlow nima va u restoran faoliyatini qanday osonlashtiradi?",
    answer:
      "RestoFlow — restoran, kafe, bar, fastfud va choyxonalar uchun bulutli boshqaruv tizimi. U ofitsiantlar buyurtmasini oshxonaga 1 soniyada yetkazadi, kassadagi barcha to'lovlarni (naqd, karta, Click, Payme) hisoblaydi, ombordagi ingredientlarni retsept bo'yicha avtomatik ayiradi va rahbarga daromad bo'yicha to'liq hisobot beradi.",
  },
  {
    question: "Tizimdan foydalanish uchun qimmatbaho maxsus kompyuter yoki uskunalar kerakmi?",
    answer:
      "Yo'q, hech qanday maxsus server yoki qimmat uskunalar shart emas. RestoFlow brauzer orqali har qanday noutbuk, kompyuter, planshet (iPad/Android) yoki smartfonda ishlaydi. Chek chiqarish uchun oddiy 58mm yoki 80mm termal printerlar bilan ulanadi.",
  },
  {
    question: "Sinov davri bormi va qancha vaqt bepul foydalanish mumkin?",
    answer:
      "Ha! Yangi restoranlar uchun 14 kunlik to'liq bepul sinov davri (Trial) taqdim etiladi. Hech qanday bank kartasi talab qilinmaydi va barcha funksiyalar to'liq ishlaydi.",
  },
  {
    question: "Mehmonlar QR-kod orqali qanday qilib ofitsiantni kutmasdan buyurtma berishadi?",
    answer:
      "Har bir stolga o'rnatilgan QR-kodni mehmon kamerasi orqali skanerlaydi. Telefonida taomlarning suratlari, tarkibi va narxi aks etgan interaktiv menyu ochiladi. Mehmon taomlarni tanlab, bir tugma bilan oshxonaga buyurtma yuboradi.",
  },
  {
    question: "Internet vaqtincha uzilib qolsa savdo to'xtab qoladimi?",
    answer:
      "Yo'q. RestoFlow PWA (Progressive Web App) texnologiyasida yaratilgan. Kassa va ofitsiantlar oflayn rejimda ham ishlashni davom ettiradi. Internet tiklanishi bilan barcha ma'lumotlar avtomatik tarzda serverga sinxronlanadi.",
  },
  {
    question: "Bir nechta filial va restoranlar tarmog'ini bitta joydan boshqarish mumkinmi?",
    answer:
      "Albatta! Multi-filial funksiyasi orqali boshqaruvchi o'z smartfoni yoki noutbukidan barcha filiallar kassasi, ombori va savdo tushumlarini bitta ekranda real-vaqtda kuzatib boradi.",
  },
]

export const RESTOFLOW_FAQ_SCHEMA = {
  '@type': 'FAQPage',
  mainEntity: LANDING_FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}
