# RestoFlow Frontend — Arxitektura

Feature-based (modulli) arxitektura. Har dasturchi o'z **feature** papkasiga egalik qiladi.

## Texnologiyalar
React 19 · Vite · TailwindCSS · React Router · Redux Toolkit · TanStack Query · Axios · React Hook Form + Zod · Socket.io-client · React Hot Toast · ApexCharts · i18next

## O'rnatish (Sprint 0)
```bash
npm install react-router-dom axios @tanstack/react-query \
  @reduxjs/toolkit react-redux react-hook-form zod \
  socket.io-client react-hot-toast apexcharts react-apexcharts i18next react-i18next
npm install -D tailwindcss @tailwindcss/vite
```
`.env` fayl:
```
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

## Papka tuzilishi
```
src/
├── app/
│   ├── store.js            # Redux store (barcha slice shu yerda ulanadi)
│   └── router.jsx          # Marshrutlar (React Router)
├── components/
│   ├── ui/                 # Umumiy UI: Button, Input, Modal, Table, Skeleton, Toast  → Behruz Shogirt
│   └── common/             # Sidebar, Navbar, EmptyState, Loading                     → Behruz Shogirt / Ziyodulla
├── layouts/                # AppLayout, AuthLayout                                     → Ziyodulla
├── routes/                 # ProtectedRoute (rolga qarab kirish)                       → Ziyodulla
├── features/               # HAR MODUL O'Z PAPKASIDA (egasi bor)
│   ├── auth/               # → Fayoz
│   ├── employees/          # → Fayoz
│   ├── settings/           # → Fayoz
│   ├── kitchen/            # → Ziyodulla
│   ├── menu/               # → Izzat
│   ├── qr-menu/            # → Izzat
│   ├── tables/             # → Abdugani
│   ├── orders/             # → Abdugani
│   ├── dashboard/          # → Madina
│   ├── cashier/            # → Madina
│   ├── reservations/       # → Behruz Shogirt
│   └── notifications/      # → Behruz Shogirt
├── services/
│   ├── axios.js            # API instance + interceptor
│   └── socket.js           # Socket.io ulanishi
├── hooks/                  # Umumiy hooklar
├── constants/              # roles.js, ORDER_STATUS, TABLE_STATUS
├── utils/                  # yordamchi funksiyalar (formatMoney, date...)
├── lib/                    # tashqi kutubxona konfiguratsiyalari
├── locales/                # i18n: uz / ru / en
└── styles/                 # global css
```

## Har feature ichidagi struktura
```
features/<nom>/
├── components/       # shu modul komponentlari
├── pages/            # sahifalar (route target)
├── api.js            # backend so'rovlari (axios orqali)
├── <nom>Slice.js     # redux slice (kerak bo'lsa)
└── index.js          # eksport
```

## Qoidalar
- Boshqa feature ichidan to'g'ridan-to'g'ri import qilinmaydi — umumiy narsa `components/ui`, `hooks`, `utils`da bo'ladi.
- Backend javob formati: `{ success, message, data, pagination }`.
- Har sahifa: loading (skeleton) + error + empty state holatini ko'rsatadi.
- Barcha API so'rov `services/axios.js` orqali, real-time `services/socket.js` orqali.

## Git tartibi
`main` ← `develop` ← `feature/<modul>` · Har vazifa alohida branch → PR → 1 review → develop.
