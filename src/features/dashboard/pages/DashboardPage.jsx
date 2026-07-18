import React from 'react';

const stats = [
  {
    icon: '🧾',
    iconBg: 'bg-orange-500/15',
    label: 'Faol buyurtmalar',
    value: '28',
    delta: '↑ 12%',
    deltaUp: true,
    sub: '+3 ta yangi',
  },
  {
    icon: '🪑',
    iconBg: 'bg-sky-500/15',
    label: "Bo'sh stollar",
    value: '14 / 46',
    delta: '↓ 8%',
    deltaUp: false,
    sub: 'zalda',
  },
  {
    icon: '👥',
    iconBg: 'bg-violet-500/15',
    label: 'Smenadagi xodimlar',
    value: '19',
    delta: '↑ 5%',
    deltaUp: true,
    sub: '25 tadan',
  },
  {
    icon: '💰',
    iconBg: 'bg-cyan-500/15',
    label: 'Bugungi tushum',
    value: '128 450 ₽',
    delta: '↑ 18%',
    deltaUp: true,
    sub: "kechagidan 19 650 ₽ ko'p",
  },
];

const orders = [
  { id: '#1058', status: 'Yangi', statusClass: 'bg-emerald-500/15 text-emerald-300', place: 'Stol 5', time: '19:42' },
  { id: '#1057', status: 'Tayyorlanmoqda', statusClass: 'bg-amber-500/15 text-amber-300', place: 'Stol 2', time: '19:35' },
  { id: '#1056', status: 'Tayyor', statusClass: 'bg-sky-500/15 text-sky-300', place: 'Yetkazish', time: '19:20' },
  { id: '#1055', status: 'Yangi', statusClass: 'bg-emerald-500/15 text-emerald-300', place: 'Stol 8', time: '19:15' },
  { id: '#1054', status: 'Bekor qilingan', statusClass: 'bg-rose-500/15 text-rose-300', place: 'Yetkazish', time: '19:05' },
];

const floorTables = [
  { number: 1, status: 'free' },
  { number: 2, status: 'occupied' },
  { number: 3, status: 'free' },
  { number: 4, status: 'reserved' },
  { number: 5, status: 'free', round: true },
  { number: 6, status: 'occupied' },
  { number: 7, status: 'inactive' },
  { number: 8, status: 'reserved' },
  { number: 9, status: 'free' },
  { number: 10, status: 'free' },
];

const seatColors = {
  free: 'border-emerald-400 bg-emerald-500/10 text-emerald-300',
  occupied: 'border-rose-400 bg-rose-500/10 text-rose-300',
  reserved: 'border-amber-400 bg-amber-500/10 text-amber-300',
  inactive: 'border-slate-600 bg-white/5 text-slate-400',
};

const popularDishes = [
  { icon: '🍔', name: 'Firma burgeri', sold: 45, price: '650 ₽' },
  { icon: '🥗', name: 'Tovuqli sezar', sold: 38, price: '550 ₽' },
  { icon: '🍝', name: 'Karbonara pasta', sold: 32, price: '620 ₽' },
  { icon: '🍰', name: 'Tiramisu', sold: 28, price: '320 ₽' },
];

const staffOnShift = [
  { icon: '👨‍💼', name: 'Ivan Petrov', role: 'Administrator', status: 'on' },
  { icon: '👩', name: 'Mariya Smirnova', role: 'Ofitsiant', status: 'on' },
  { icon: '👨‍🍳', name: 'Dmitriy Kuznetsov', role: 'Oshpaz', status: 'on' },
  { icon: '👩‍🦰', name: 'Anna Vasilyeva', role: 'Barmen', status: 'off' },
  { icon: '👨', name: 'Sergey Lebedev', role: 'Ofitsiant', status: 'on' },
];

const upcomingReservations = [
  { time: 'Bugun, 20:00', table: 'Stol 4', name: 'Ivan Sidorov', guests: 4 },
  { time: 'Bugun, 20:30', table: 'Stol 7', name: 'Olga Nikolaeva', guests: 2 },
  { time: 'Bugun, 21:00', table: 'Stol 1', name: 'Aleksey Ivanov', guests: 6 },
  { time: 'Bugun, 21:30', table: 'Stol 10', name: 'Mariya Petrova', guests: 3 },
];

const Dashboard = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] px-4 py-6 text-slate-100 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-[1360px] space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Xayrli kech, Aleksey! 👋</h1>
            <p className="mt-1 text-sm text-slate-400">Bugun restoranda nimalar bo'layotgani</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              placeholder="Qidiruv..."
              className="min-w-[140px] flex-1 rounded-full border border-cyan-500/10 bg-[#05111d] px-4 py-2 text-sm text-slate-300 outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 sm:flex-none"
            />
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-cyan-500/10 bg-[#05111d] text-slate-300">
              🔔
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
            </button>
            <div className="rounded-full border border-cyan-500/10 bg-[#05111d] px-4 py-2 text-sm text-slate-300">📅 23 may 2025</div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-[1.5rem] border border-cyan-500/10 bg-[#07101d]/90 p-4 sm:p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-base ${s.iconBg}`}>{s.icon}</div>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-lg font-semibold text-white sm:text-2xl">{s.value}</span>
                <span className={`text-xs font-semibold ${s.deltaUp ? 'text-emerald-400' : 'text-rose-400'}`}>{s.delta}</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-500">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Middle grid: orders + floor map */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">

          {/* Recent orders */}
          <div className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">So'nggi buyurtmalar</h2>
              <span className="text-xs text-slate-500">Barchasini ko'rish</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-500">
                    <th className="pb-3 font-medium">Buyurtma №</th>
                    <th className="pb-3 font-medium">Holat</th>
                    <th className="pb-3 font-medium">Stol / Yetkazish</th>
                    <th className="pb-3 font-medium">Vaqt</th>
                    <th className="pb-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-t border-cyan-500/10">
                      <td className="py-3 text-slate-200">{o.id}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${o.statusClass}`}>{o.status}</span>
                      </td>
                      <td className="py-3 text-slate-300">{o.place}</td>
                      <td className="py-3 text-slate-400">{o.time}</td>
                      <td className="py-3 text-right text-slate-500">⋮</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Floor map */}
          <div className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Zal xaritasi</h2>
              <span className="text-xs text-slate-500">Barchasini ko'rish</span>
            </div>
            <div
              className="relative mt-4 grid grid-cols-3 gap-4 rounded-[1.25rem] p-5 sm:grid-cols-4"
              style={{
                backgroundColor: '#071923',
                backgroundImage:
                  'linear-gradient(rgba(20,184,166,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.06) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)',
              }}
            >
              {floorTables.map((t) => (
                <div
                  key={t.number}
                  className={`flex h-12 w-12 items-center justify-center border-2 text-sm font-bold sm:h-14 sm:w-14 ${t.round ? 'rounded-full' : 'rounded-lg'} ${seatColors[t.status]}`}
                >
                  {t.number}
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-400" />Bo'sh</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-rose-400" />Band</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" />Bron</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-500" />Faol emas</span>
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

          {/* Popular dishes */}
          <div className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Mashhur taomlar</h2>
              <span className="text-xs text-slate-500">Barchasini ko'rish</span>
            </div>
            <div className="mt-3 divide-y divide-cyan-500/10">
              {popularDishes.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#0a1c29] text-lg">{d.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{d.name}</p>
                      <p className="text-[11px] text-slate-500">Sotildi: {d.sold}</p>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-white">{d.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff on shift */}
          <div className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Smenadagi xodimlar</h2>
              <span className="text-xs text-slate-500">Barchasini ko'rish</span>
            </div>
            <div className="mt-3 divide-y divide-cyan-500/10">
              {staffOnShift.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#0a1c29] text-base">{p.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-500">{p.role}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold ${p.status === 'on' ? 'text-emerald-400' : 'text-amber-400'}`}>
                    <i className={`h-2 w-2 rounded-full ${p.status === 'on' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {p.status === 'on' ? 'Smenada' : 'Dam olish kuni'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming reservations */}
          <div className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5 lg:col-span-2 xl:col-span-1">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Yaqin bronlar</h2>
              <span className="text-xs text-slate-500">Barchasini ko'rish</span>
            </div>
            <div className="mt-3 divide-y divide-cyan-500/10">
              {upcomingReservations.map((r) => (
                <div key={r.table + r.time} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-slate-500">{r.time}</p>
                    <p className="truncate text-sm font-semibold text-white">{r.table}</p>
                    <p className="truncate text-[11px] text-slate-500">{r.name}</p>
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap text-xs text-slate-400">👤 {r.guests}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;