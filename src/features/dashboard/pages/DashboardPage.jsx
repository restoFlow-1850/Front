import {
  ShoppingCart,
  LayoutGrid,
  Users,
  Wallet,
  TrendingUp,
  TrendingDown,
  Bell,
  Calendar,
  Search,
  MoreVertical,
  Clock,
} from '../../../lib/Icons';
import ThemeToggle from '../../../components/ui/ThemeToggle';
import { TABLE_STATUS_COLORS } from '../../../constants/tableStatus';

const stats = [
  {
    icon: ShoppingCart,
    accent: 'orange',
    label: 'Faol buyurtmalar',
    value: '28',
    delta: '12%',
    deltaUp: true,
    sub: '+3 ta yangi',
  },
  {
    icon: LayoutGrid,
    accent: 'emerald',
    label: "Bo'sh stollar",
    value: '14 / 46',
    delta: '8%',
    deltaUp: false,
    sub: 'zalda',
  },
  {
    icon: Users,
    accent: 'violet',
    label: 'Smenadagi xodimlar',
    value: '19',
    delta: '5%',
    deltaUp: true,
    sub: '25 tadan',
  },
  {
    icon: Wallet,
    accent: 'cyan',
    label: 'Bugungi tushum',
    value: '128 450 ₽',
    delta: '18%',
    deltaUp: true,
    sub: "kechagidan 19 650 ₽ ko'p",
  },
];

const accentClasses = {
  orange: 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
  violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300',
  cyan: 'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/15 dark:text-cyan-300',
};

const orders = [
  { id: '#1058', status: 'Yangi', statusClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', place: 'Stol 5', time: '19:42' },
  { id: '#1057', status: 'Tayyorlanmoqda', statusClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300', place: 'Stol 2', time: '19:35' },
  { id: '#1056', status: 'Tayyor', statusClass: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300', place: 'Yetkazish', time: '19:20' },
  { id: '#1055', status: 'Yangi', statusClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', place: 'Stol 8', time: '19:15' },
  { id: '#1054', status: 'Bekor qilingan', statusClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', place: 'Yetkazish', time: '19:05' },
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

const floorStatus = {
  free: { color: TABLE_STATUS_COLORS.available, label: "Bo'sh" },
  occupied: { color: TABLE_STATUS_COLORS.occupied, label: 'Band' },
  reserved: { color: TABLE_STATUS_COLORS.reserved, label: 'Bron' },
  inactive: { color: TABLE_STATUS_COLORS.cleaning, label: 'Faol emas' },
};

const popularDishes = [
  { icon: '🍔', name: 'Firma burgeri', sold: 45, price: '650 ₽' },
  { icon: '🥗', name: 'Tovuqli sezar', sold: 38, price: '550 ₽' },
  { icon: '🍝', name: 'Karbonara pasta', sold: 32, price: '620 ₽' },
  { icon: '🍰', name: 'Tiramisu', sold: 28, price: '320 ₽' },
];

const staffOnShift = [
  { name: 'Ivan Petrov', role: 'Administrator', status: 'on' },
  { name: 'Mariya Smirnova', role: 'Ofitsiant', status: 'on' },
  { name: 'Dmitriy Kuznetsov', role: 'Oshpaz', status: 'on' },
  { name: 'Anna Vasilyeva', role: 'Barmen', status: 'off' },
  { name: 'Sergey Lebedev', role: 'Ofitsiant', status: 'on' },
];

const upcomingReservations = [
  { time: 'Bugun, 20:00', table: 'Stol 4', name: 'Ivan Sidorov', guests: 4 },
  { time: 'Bugun, 20:30', table: 'Stol 7', name: 'Olga Nikolaeva', guests: 2 },
  { time: 'Bugun, 21:00', table: 'Stol 1', name: 'Aleksey Ivanov', guests: 6 },
  { time: 'Bugun, 21:30', table: 'Stol 10', name: 'Mariya Petrova', guests: 3 },
];

const initialsOf = (fullName) =>
  fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

const SectionHeader = ({ eyebrow, title, action }) => (
  <div className="flex items-center justify-between gap-3">
    <div>
      <p className="text-xs uppercase tracking-[0.28em] text-orange-600 dark:text-cyan-300">{eyebrow}</p>
      <h2 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
    </div>
    {action && (
      <button type="button" className="shrink-0 text-xs font-semibold text-orange-600 hover:underline dark:text-cyan-300">
        {action}
      </button>
    )}
  </div>
);

const Dashboard = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] px-4 py-6 text-slate-900 dark:bg-[#03060d] dark:text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />

      <div className="relative mx-auto max-w-340 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs uppercase tracking-[0.35em] text-orange-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">
              Boshqaruv paneli
            </span>
            <h1 className="mt-3 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Xayrli kech, Aleksey! 👋</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Bugun restoranda nimalar bo'layotgani</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-35 flex-1 sm:flex-none">
              <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                type="search"
                placeholder="Qidiruv..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-cyan-500/10 dark:bg-[#05111d] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
              />
            </div>
            <button
              type="button"
              aria-label="Bildirishnomalar"
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-orange-300 hover:text-orange-600 dark:border-cyan-500/10 dark:bg-[#05111d] dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-cyan-300"
            >
              <Bell size={16} />
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">3</span>
            </button>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 dark:border-cyan-500/10 dark:bg-[#05111d] dark:text-slate-300">
              <Calendar size={15} />
              23 may 2025
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((s) => {
            const Icon = s.icon;
            const DeltaIcon = s.deltaUp ? TrendingUp : TrendingDown;
            return (
              <div key={s.label} className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/10 dark:bg-[#07101d]/90 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accentClasses[s.accent]}`}>
                    <Icon size={18} />
                  </div>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${s.deltaUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'}`}>
                    <DeltaIcon size={12} />
                    {s.delta}
                  </span>
                </div>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white sm:text-2xl">{s.value}</p>
                <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">{s.sub}</p>
              </div>
            );
          })}
        </div>

        {/* Middle grid: orders + floor map */}
        <div className="grid gap-5 xl:grid-cols-[1.6fr_1fr]">

          {/* Recent orders */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90">
            <SectionHeader eyebrow="Buyurtma oqimi" title="So'nggi buyurtmalar" action="Barchasini ko'rish" />
            <div className="mt-4 divide-y divide-slate-100 dark:divide-cyan-500/10">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{o.id}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock size={11} />
                      {o.time}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${o.statusClass}`}>{o.status}</span>
                  <p className="hidden w-28 truncate text-sm text-slate-500 dark:text-slate-400 sm:block">{o.place}</p>
                  <button type="button" aria-label="Amallar" className="shrink-0 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
                    <MoreVertical size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Floor map */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90">
            <SectionHeader eyebrow="Hududiy reja" title="Zal xaritasi" action="Barchasini ko'rish" />
            <div
              className="relative mt-4 grid grid-cols-3 gap-4 rounded-[1.25rem] p-5 sm:grid-cols-4 [--floor-bg:#f6f1ea] [--floor-grid:rgba(234,88,12,0.06)] dark:[--floor-bg:#071923] dark:[--floor-grid:rgba(20,184,166,0.06)]"
              style={{
                backgroundColor: 'var(--floor-bg)',
                backgroundImage:
                  'linear-gradient(var(--floor-grid) 1px, transparent 1px), linear-gradient(90deg, var(--floor-grid) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                boxShadow: 'inset 0 0 40px rgba(0,0,0,0.08)',
              }}
            >
              {floorTables.map((t) => {
                const { color, label } = floorStatus[t.status];
                return (
                  <div key={t.number} className="flex flex-col items-center gap-1">
                    <div
                      style={{ backgroundColor: `${color}1A`, borderColor: color, color }}
                      className={`flex h-12 w-12 items-center justify-center border-2 text-sm font-bold sm:h-14 sm:w-14 ${t.round ? 'rounded-full' : 'rounded-xl'}`}
                    >
                      {t.number}
                    </div>
                    <span className="text-[9px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
              {Object.values(floorStatus).map((item) => (
                <span key={item.label} className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom grid */}
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">

          {/* Popular dishes */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90">
            <SectionHeader eyebrow="Menyu" title="Mashhur taomlar" action="Barchasini ko'rish" />
            <div className="mt-3 divide-y divide-slate-100 dark:divide-cyan-500/10">
              {popularDishes.map((d) => (
                <div key={d.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-lg dark:bg-[#0a1c29]">{d.icon}</div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{d.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">Sotildi: {d.sold}</p>
                    </div>
                  </div>
                  <p className="whitespace-nowrap text-sm font-semibold text-slate-900 dark:text-white">{d.price}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staff on shift */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90">
            <SectionHeader eyebrow="Xodimlar" title="Smenadagi xodimlar" action="Barchasini ko'rish" />
            <div className="mt-3 divide-y divide-slate-100 dark:divide-cyan-500/10">
              {staffOnShift.map((p) => (
                <div key={p.name} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-bold text-orange-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                      {initialsOf(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{p.role}</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 whitespace-nowrap text-[11px] font-semibold ${p.status === 'on' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    <i className={`h-2 w-2 rounded-full ${p.status === 'on' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    {p.status === 'on' ? 'Smenada' : 'Dam olish kuni'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming reservations */}
          <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90 lg:col-span-2 xl:col-span-1">
            <SectionHeader eyebrow="Bronlar" title="Yaqin bronlar" action="Barchasini ko'rish" />
            <div className="mt-3 divide-y divide-slate-100 dark:divide-cyan-500/10">
              {upcomingReservations.map((r) => (
                <div key={r.table + r.time} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                      <Clock size={11} />
                      {r.time}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-semibold text-slate-900 dark:text-white">{r.table}</p>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">{r.name}</p>
                  </div>
                  <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-500 dark:bg-[#04111a] dark:text-slate-400">
                    <Users size={12} />
                    {r.guests}
                  </span>
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
