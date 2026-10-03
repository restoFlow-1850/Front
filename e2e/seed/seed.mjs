// E2E test bazasini noldan tayyorlaydi: 1 restoran, 4 xodim, 1 kategoriya,
// 1 taom, 1 stol. Har ishga tushirishda baza TOZALANADI — faqat test bazasi uchun!
//
// Backend modellaridan foydalanadi (sxema/validatsiya bir xil bo'lsin), shuning
// uchun Backend repo yonida turishi kerak:
//   BACKEND_DIR=../Backend MONGO_URI=mongodb://127.0.0.1:27017/restoflow_e2e npm run e2e:seed

import { createRequire } from 'node:module'
import path from 'node:path'
import { ACCOUNTS, PASSWORD, RESTAURANT, MENU, TABLE } from '../fixtures.js'

const BACKEND_DIR = path.resolve(process.env.BACKEND_DIR || '../Backend')
const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  console.error('❌ MONGO_URI berilmagan')
  process.exit(1)
}
// Xavfsizlik: tasodifan production bazani tozalab yubormaslik uchun
if (!/e2e|test/i.test(MONGO_URI)) {
  console.error(`❌ MONGO_URI nomida "e2e" yoki "test" bo'lishi shart (hozir: ${MONGO_URI})`)
  process.exit(1)
}

const backendRequire = createRequire(path.join(BACKEND_DIR, 'package.json'))
const mongoose = backendRequire('mongoose')
const bcrypt = backendRequire('bcryptjs')
const model = (name) => backendRequire(path.join(BACKEND_DIR, 'src/models', name))

const Client = model('Client')
const User = model('User')
const Category = model('Category')
const Product = model('Product')
const Table = model('Table')

await mongoose.connect(MONGO_URI)
await mongoose.connection.db.dropDatabase()

const restaurant = await Client.create({ ...RESTAURANT, isActive: true })
const password = await bcrypt.hash(PASSWORD, 10)

for (const account of Object.values(ACCOUNTS)) {
  await User.create({
    name: account.name,
    email: account.email,
    password,
    role: account.role,
    restaurant: restaurant._id,
    isActive: true,
  })
}

const category = await Category.create({ name: MENU.category, restaurant: restaurant._id })
await Product.create({ ...MENU.product, category: category._id, restaurant: restaurant._id, isAvailable: true })
await Table.create({ ...TABLE, restaurant: restaurant._id })

console.log(`✅ E2E seed tayyor: restoran ${restaurant._id}, ${Object.keys(ACCOUNTS).length} xodim, 1 taom, 1 stol`)
await mongoose.disconnect()
