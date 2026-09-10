import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiArrowRight, FiStar } from 'react-icons/fi'

import { getPublicRestaurants } from '../api'
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton'
import EmptyRestaurants from '../components/EmptyRestaurants'
import ErrorRestaurants from '../components/ErrorRestaurants'

export default function ClientsPage() {
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
      if (err.response?.status === 404) {
        setRestaurants(FALLBACK_CLIENTS)
      } else {
        setError(err.message || "Ma'lumotlarni yuklab bo'lmadi")
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

      {/* ─── Header ────────────────────────────────────────── */}
      <section className="py-12 text-center sm:py-16">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
          Restoranlarimiz
        </h1>
        <p className="mt-3 text-sm text-[#9a8080] sm:text-lg">
          RestoFlow ni ishlatayotgan restoranlar va ularning tajribalari
        </p>
      </section>

      {/* ─── Clients grid ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
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
              <ClientCard key={r._id || r.slug || i} restaurant={r} />
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

/** Client (restoran) kartochkasi — sharh va reyting bilan */
function ClientCard({ restaurant }) {
  const navigate = useNavigate()
  const { name, slug, address, cuisine, rating, image, quote, description } = restaurant

  // "Menyuni ko'rish" — restoran kontekstini saqlab mehmon menyusiga o'tish.
  function openGuestMenu() {
    try {
      sessionStorage.setItem(
        'guestRestaurant',
        JSON.stringify({ name, slug, address, cuisine }),
      )
    } catch {
      // sessionStorage band bo'lsa ham davom etamiz
    }
    navigate('/guest')
  }

  return (
    <div className="group overflow-hidden rounded-2xl border border-[#4a1616] bg-[#1c0a0b] transition-all hover:border-[#C89B5E]/40">
      {/* Image */}
      {image && (
        <div className="aspect-[16/9] overflow-hidden bg-[#2a1315]">
          <img
            src={image}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}

      <div className="p-5">
        {/* Quote */}
        {quote && (
          <p className="text-sm italic leading-relaxed text-[#9a8080]">"{quote}"</p>
        )}

        {description && !quote && (
          <p className="text-sm leading-relaxed text-[#9a8080]">{description}</p>
        )}

        {/* Info */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#C89B5E]/10 text-sm font-bold text-[#C89B5E]">
            {name?.charAt(0) || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#E6DCDC]">{name}</p>
            <p className="truncate text-xs text-[#8a7373]">
              {cuisine || address || 'Restoran'}
            </p>
          </div>
          {rating != null && (
            <div className="flex items-center gap-1 rounded-full bg-[#140708]/60 px-2 py-1">
              <FiStar className="h-3.5 w-3.5 fill-[#C89B5E] text-[#C89B5E]" />
              <span className="text-xs font-semibold text-[#E6DCDC]">
                {Number(rating).toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={openGuestMenu}
          className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#4a1616] py-2.5 text-sm font-medium text-[#cbbcbc] transition hover:border-[#C89B5E]/40 hover:bg-[#C89B5E]/5 hover:text-[#D9A968]"
        >
          Menyuni ko'rish <FiArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// API mavjud bo'lmagan taqdirda ko'rsatiladigan sharhlar
const FALLBACK_CLIENTS = [
  {
    _id: '1',
    name: 'Oshxona',
    slug: 'oshxona',
    address: 'Toshkent',
    quote: "Buyurtmalar 3 baravar tezlashdi. Oshxona bilan aloqa juda qulay.",
    rating: 4.8,
  },
  {
    _id: '2',
    name: 'La Piazza',
    slug: 'la-piazza',
    address: 'Samarqand',
    quote: "Stollar xaritasi juda qulay — ofitsiantlar yangi kelganlar ham tushunadi.",
    rating: 4.6,
  },
  {
    _id: '3',
    name: 'Sushi Master',
    slug: 'sushi-master',
    address: 'Buxoro',
    quote: "Kassa avtomatlashtirildi, xatoliklar deyarli yo'qoldi.",
    rating: 4.7,
  },
  {
    _id: '4',
    name: 'Choyxona Milliy',
    slug: 'choyxona-milliy',
    address: "Farg'ona",
    quote: "Dashboard orqali savdo tushunchasini hozir ko'raman.",
    rating: 4.5,
  },
  {
    _id: '5',
    name: 'BBQ House',
    slug: 'bbq-house',
    address: 'Qarshi',
    quote: "Mijozlar uchun QR menyu juda zamonaviy ko'rinadi.",
    rating: 4.9,
  },
  {
    _id: '6',
    name: 'Nonvoy Uy',
    slug: 'nonvoy-uy',
    address: 'Urgench',
    quote: "Bron tizimi bilan navbat muammosi hal bo'ldi.",
    rating: 4.4,
  },
]
