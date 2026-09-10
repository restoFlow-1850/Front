import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiArrowRight, FiGrid, FiClipboard, FiBarChart2 } from 'react-icons/fi'

import { getPublicRestaurants } from '../api'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton'
import EmptyRestaurants from '../components/EmptyRestaurants'
import ErrorRestaurants from '../components/ErrorRestaurants'

export default function LandingPage() {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRestaurants = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await getPublicRestaurants()
      const payload = res.data?.data ?? res.data
      setRestaurants(payload.restaurants ?? payload ?? [])
    } catch (err) {
      // Agar API mavjud bo'lmasa — statik restoranlar ko'rsatiladi
      if (err.response?.status === 404) {
        setRestaurants(FALLBACK_RESTAURANTS)
      } else {
        setError(err.message || "Restoranlarni yuklab bo'lmadi")
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#2a0e10_0%,#140708_100%)]">
      {/* ─── Navbar ────────────────────────────────────────── */}
      <nav className="border-b border-[#4a1616] bg-[#140708]/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-[#D9A968]">
            Resto<span className="text-white">Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/clients"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white sm:block"
            >
              Mijozlar
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white"
            >
              <FiUser size={14} /> Kirish
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#C89B5E] px-4 py-1.5 text-xs font-semibold text-[#2a0e10] transition hover:bg-[#D9A968]"
            >
              Boshlash
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          Restoraningizni{' '}
          <span className="text-[#D9A968]">smart</span> boshqaring
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#9a8080] sm:mt-6 sm:text-lg">
          Buyurtmalar, stollar, oshxona va kassa — barchasi bir platformada.
          Real-vaqtda boshqaruv, tezkor va oson.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-[#D9A968] px-6 py-3 text-sm font-bold text-[#2a0e10] shadow-lg transition hover:bg-[#C89B5E] sm:px-8 sm:text-lg"
          >
            Bepul boshlash →
          </Link>
          <a
            href="#restaurants"
            className="flex items-center gap-2 rounded-xl border-2 border-[#4a1616] px-6 py-3 text-sm font-semibold text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white sm:px-8 sm:text-lg"
          >
            Restoranlar <FiArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────── */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pb-16 sm:grid-cols-3 sm:px-6 sm:pb-24">
        {[
          {
            icon: <FiClipboard className="h-6 w-6" />,
            title: 'Buyurtmalar',
            desc: "Ofitsiantlar tezkor ravishda buyurtma oladi, oshxona real-vaqtda ko'radi.",
          },
          {
            icon: <FiGrid className="h-6 w-6" />,
            title: 'Stollar xaritasi',
            desc: 'Stol holatini xaritada ko\'ring — band, bo\'sh, bron qilingan.',
          },
          {
            icon: <FiBarChart2 className="h-6 w-6" />,
            title: 'Dashboard & Kassa',
            desc: "Statistika, grafiklar, to'lov va chek chiqarish — avtomatik.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-[#4a1616] bg-[#1c0a0b] p-6 transition hover:border-[#C89B5E]/30 sm:p-8"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C89B5E]/10 text-[#C89B5E]">
              {f.icon}
            </div>
            <h3 className="mt-4 text-lg font-bold text-[#E6DCDC]">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#9a8080]">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* ─── Restaurants ───────────────────────────────────── */}
      <section
        id="restaurants"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            Restoranlarimiz
          </h2>
          <p className="mt-2 text-sm text-[#9a8080]">
            Menyuni ko'ring va stolni onlayn bron qiling
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <RestaurantCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <ErrorRestaurants message={error} onRetry={fetchRestaurants} />
        )}

        {/* Empty */}
        {!loading && !error && restaurants.length === 0 && <EmptyRestaurants />}

        {/* List */}
        {!loading && !error && restaurants.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r._id || r.slug || i} restaurant={r} />
            ))}
          </div>
        )}
      </section>

      {/* ─── CTA ──────────────────────────────────────────── */}
      <section className="border-t border-[#4a1616] bg-[#1c0a0b] py-12 text-center sm:py-16">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          Restorani hozir boshlang
        </h2>
        <p className="mt-2 text-sm text-[#9a8080]">
          Bepul ro'yxatdan o'ting va 14 kunlik sinov muddatini boshlang.
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-xl bg-[#D9A968] px-8 py-3 font-bold text-[#2a0e10] shadow-lg transition hover:bg-[#C89B5E]"
        >
          Bepul boshlash →
        </Link>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#4a1616] py-6 text-center text-xs text-[#5a4a4a]">
        © {new Date().getFullYear()} RestoFlow. Barcha huquqlar himoyalangan.
      </footer>
    </div>
  )
}

// API mavjud bo'lmagan taqdirda ko'rsatiladigan namunali restoranlar
const FALLBACK_RESTAURANTS = [
  {
    _id: '1',
    name: 'Oshxona',
    slug: 'oshxona',
    address: 'Toshkent, Amir Temur ko\'chasi 15',
    cuisine: 'Milliy',
    rating: 4.8,
    description: 'O\'zbek milliy taomlari — somsa, shashlag, manti.',
  },
  {
    _id: '2',
    name: 'La Piazza',
    slug: 'la-piazza',
    address: 'Samarqand, Registon ko\'chasi 8',
    cuisine: 'Italiya',
    rating: 4.6,
    description: 'Haqiqiy italiya pitssasi va pastasi — oilaviy restoran.',
  },
  {
    _id: '3',
    name: 'Sushi Master',
    slug: 'sushi-master',
    address: 'Buxoro, Al-Buxoriy ko\'chasi 22',
    cuisine: 'Yaponiya',
    rating: 4.7,
    description: 'Yangi dengiz mahsulotlari va an\'anaviy yapon taomlari.',
  },
  {
    _id: '4',
    name: 'Choyxona Milliy',
    slug: 'choyxona-milliy',
    address: "Farg'ona, Mustaqillik ko'chasi 5",
    cuisine: 'Choyxona',
    rating: 4.5,
    description: 'Milliy choyxona — issiq non, somsa va mazzali choy.',
  },
  {
    _id: '5',
    name: 'BBQ House',
    slug: 'bbq-house',
    address: "Qarshi, Bobur ko'chasi 12",
    cuisine: 'Shashlik',
    rating: 4.9,
    description: "Ko'zgu ustida pishirilgan shashlik va kabob.",
  },
  {
    _id: '6',
    name: 'Nonvoy Uy',
    slug: 'nonvoy-uy',
    address: "Urgench, Split Boulevard 30",
    cuisine: 'Nonvoy',
    rating: 4.4,
    description: "Non, patir va pyuri — uy-nonvoyxona.",
  },
]
