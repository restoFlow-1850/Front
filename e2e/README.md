# E2E testlar (Playwright)

To'liq zanjirni tekshiradi: **Front (vite preview) → Backend (Node) → MongoDB**.
CI'da har PR'da avtomatik ishlaydi (`.github/workflows/e2e.yml`); xato bo'lsa
skrinshot, video, trace va `backend.log` → Actions → run → **Artifacts → playwright-report**.

## Tuzilma

| Fayl | Vazifasi |
|---|---|
| `fixtures.js` | Test hisoblari (admin/waiter/cook/cashier), restoran, taom, stol |
| `seed/seed.mjs` | Test bazasini tozalab, `fixtures.js` dagi ma'lumotlarni yozadi |
| `helpers/auth.js` | `login(page, account)` — forma orqali kirish |
| `*.spec.js` | Ssenariylar |

## Lokal ishga tushirish (Windows / PowerShell)

Kerak: MongoDB **replica set** rejimida (to'lovlar tranzaksiya ishlatadi) va Backend repo Front yonida.

```powershell
# 1) MongoDB (Docker bilan eng oson)
docker run -d --name mongo-e2e -p 27017:27017 mongo:7 --replSet rs0 --bind_ip_all
docker exec mongo-e2e mongosh --eval "rs.initiate({_id:'rs0',members:[{_id:0,host:'127.0.0.1:27017'}]})"

# 2) Seed (Front papkasida)
$env:BACKEND_DIR = "..\BackRes"
$env:MONGO_URI = "mongodb://127.0.0.1:27017/restoflow_e2e?replicaSet=rs0&directConnection=true"
npm run e2e:seed

# 3) Backend (alohida oynada, BackRes papkasida)
$env:MONGO_URI = "mongodb://127.0.0.1:27017/restoflow_e2e?replicaSet=rs0&directConnection=true"
$env:PORT = "5000"; $env:NODE_ENV = "test"; $env:CORS_ORIGIN = "http://localhost:4173"
$env:JWT_ACCESS_SECRET = "e2e"; $env:JWT_REFRESH_SECRET = "e2e2"
node src/server.js

# 4) Front build + E2E (Front papkasida)
$env:VITE_API_URL = "http://localhost:5000/api"; $env:VITE_SOCKET_URL = "http://localhost:5000"
npm run build
npx playwright install chromium   # birinchi marta
npm run test:e2e
```

Hisobot: `npx playwright show-report`

⚠️ Seed bazani **tozalaydi** — `MONGO_URI` nomida `e2e` yoki `test` bo'lmasa ishlamaydi (himoya).
