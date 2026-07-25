# RestoFlow Frontend — Vazifalar (kim nima qiladi)

Jamoa: 6 frontend dasturchi. Har kim o'z `features/<modul>` papkasiga egalik qiladi.
To'liq arxitektura: [ARCHITECTURE.md](./ARCHITECTURE.md)

## Vazifalar taqsimoti

| Dasturchi | Papka(lar) | Vazifa |
|-----------|-----------|--------|
| **Fayoz** | `features/auth`, `features/employees`, `features/settings`, `services/axios.js` | Auth, token/interceptor, Xodimlar, Rollar & Sozlamalar |
| **Ziyodulla** | `layouts/`, `routes/`, `features/kitchen`, `services/socket.js` | App Shell (sidebar/navbar/theme), ProtectedRoute, i18n, Oshxona paneli (real-time) |
| **Izzat** | `features/menu`, `features/qr-menu` | Kategoriya & Taomlar CRUD (rasm, qidiruv, filter), QR-menyu |
| **Abdugani** | `features/tables`, `features/orders` | Stollar xaritasi, Ofitsiant ekrani (savat → buyurtma), stol ko'chirish |
| **Madina** | `features/dashboard`, `features/cashier` | Dashboard + Analitika (ApexCharts), Kassa (to'lov, chek, split bill) |
| **Behruz Shogirt** | `components/ui`, `components/common`, `features/reservations`, `features/notifications` | Umumiy UI komponentlar, Bron (kalendar), Bildirishnomalar (real-time) |

---

## Batafsil vazifalar

### 👤 Fayoz — Auth va Ruxsatlar
- [ ] Login / Register / Parolni tiklash (React Hook Form + Zod)
- [ ] Token saqlash + axios interceptor (refresh) — `services/axios.js`
- [ ] Redux `auth` slice
- [ ] Profil sahifasi
- [ ] Xodimlar (Employees) — ro'yxat, CRUD, rol biriktirish
- [ ] Rollar & Ruxsatlar + Sozlamalar sahifasi

### 👤 Ziyodulla — App Shell + Oshxona
- [x] Layout: Sidebar, Navbar, Dark/Light mode, responsive
- [x] ProtectedRoute (rolga qarab) + React Router marshrutlari
- [x] i18next sozlash (uz / ru / en)
- [x] Oshxona paneli: Pending → Preparing → Ready
- [x] Socket.io real-time + "Tayyor" tugmasi

### 👤 Izzat — Menyu + QR-menyu
- [ ] Kategoriyalar CRUD
- [ ] Taomlar CRUD + rasm yuklash, narx, mavjudlik
- [ ] Qidiruv + filter + pagination
- [ ] QR-menyu (mijoz ekrani, mobil-first)

### 👤 Abdugani — Stollar + Ofitsiant ekrani
- [ ] Stollar xaritasi (grid, zonalar, holat ranglari)
- [ ] Ofitsiant ekrani: stol → savat → buyurtma yuborish
- [ ] Miqdor o'zgartirish + izoh
- [ ] Stolni ko'chirish (transfer)

### 👤 Madina — Dashboard + Kassa
- [ ] Dashboard: statistika kartalari
- [ ] Analitika: ApexCharts grafiklar + Excel/PDF eksport
- [ ] Kassa: to'lov (naqd/karta/Click/Payme), chek chiqarish
- [ ] Split bill + to'lovlar tarixi

### 👤 Behruz Shogirt — Umumiy komponentlar + Bron + Bildirishnoma
- [ ] Umumiy UI: Button, Input, Modal, Table, Skeleton, Toast
- [ ] Empty state + Loading komponentlari
- [ ] Bron (Reservation) — kalendar bilan
- [ ] Bildirishnomalar — socket real-time

---

## "Tayyor" mezoni (Definition of Done)
UI + API integratsiya + loading/skeleton + validatsiya + error handling + responsive.

## Ishlash tartibi
1. `git checkout develop && git pull`
2. `git checkout -b feature/<modul>` (masalan `feature/menu`)
3. Ishla → commit → `git push origin feature/<modul>`
4. GitHub'da Pull Request och → 1 kishi review → `develop`ga merge
