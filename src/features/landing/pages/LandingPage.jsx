import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  FiUser,
  FiArrowRight,
  FiGrid,
  FiClipboard,
  FiBarChart2,
  FiStar,
  FiBookOpen,
} from 'react-icons/fi'

import LanguageSwitcher from '../../../components/common/LanguageSwitcher'
import { getPublicRestaurants } from '../api'
import RestaurantCard from '../components/RestaurantCard'
import RestaurantCardSkeleton from '../components/RestaurantCardSkeleton'
import EmptyRestaurants from '../components/EmptyRestaurants'
import ErrorRestaurants from '../components/ErrorRestaurants'

// 6-8 ta namuna taomlar ro'yxati (i18n kalitlari va ma'lumotlari)
const SAMPLE_DISHES = [
  {
    id: '1',
    price: '45,000',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '2',
    price: '15,000',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '3',
    price: '35,000',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '4',
    price: '65,000',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '5',
    price: '28,000',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '6',
    price: '55,000',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '7',
    price: '40,000',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: '8',
    price: '42,000',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=600&auto=format&fit=crop&q=80',
  },
]

export default function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
        setError(err.message || t('landing.restaurants.errorDesc'))
      }
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    fetchRestaurants()
  }, [fetchRestaurants])

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#2a0e10_0%,#140708_100%)]">
      {/* ─── Navbar ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-[#4a1616] bg-[#140708]/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="text-lg font-extrabold tracking-tight text-[#D9A968]">
            Resto<span className="text-white">Flow</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher className="border border-[#4a1616] bg-[#1c0a0b] text-[#cbbcbc]" />

            <Link
              to="/clients"
              className="hidden rounded-lg px-3 py-1.5 text-xs font-medium text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white sm:block"
            >
              {t('landing.nav.clients')}
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white"
            >
              <FiUser size={14} /> {t('landing.nav.login')}
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-[#C89B5E] px-4 py-1.5 text-xs font-semibold text-[#2a0e10] transition hover:bg-[#D9A968]"
            >
              {t('landing.nav.start')}
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-5xl">
          {t('landing.hero.titlePart1')}
          <span className="text-[#D9A968]">{t('landing.hero.titleHighlight')}</span>
          {t('landing.hero.titlePart2')}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-[#9a8080] sm:mt-6 sm:text-lg">
          {t('landing.hero.subtitle')}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3 sm:mt-10 sm:gap-4">
          <Link
            to="/register"
            className="rounded-xl bg-[#D9A968] px-6 py-3 text-sm font-bold text-[#2a0e10] shadow-lg transition hover:bg-[#C89B5E] sm:px-8 sm:text-lg"
          >
            {t('landing.hero.startFree')}
          </Link>
          <a
            href="#restaurants"
            className="flex items-center gap-2 rounded-xl border-2 border-[#4a1616] px-6 py-3 text-sm font-semibold text-[#cbbcbc] transition hover:bg-[#2a1315] hover:text-white sm:px-8 sm:text-lg"
          >
            {t('landing.hero.restaurants')} <FiArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      {/* ─── Features ──────────────────────────────────────── */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 pb-16 sm:grid-cols-3 sm:px-6 sm:pb-24">
        {[
          {
            icon: <FiClipboard className="h-6 w-6" />,
            title: t('landing.features.ordersTitle'),
            desc: t('landing.features.ordersDesc'),
          },
          {
            icon: <FiGrid className="h-6 w-6" />,
            title: t('landing.features.tablesTitle'),
            desc: t('landing.features.tablesDesc'),
          },
          {
            icon: <FiBarChart2 className="h-6 w-6" />,
            title: t('landing.features.dashboardTitle'),
            desc: t('landing.features.dashboardDesc'),
          },
        ].map((f, i) => (
          <div
            key={i}
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

      {/* ─── Sample Dishes (Namuna taomlar) ────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {t('landing.dishes.title')}
          </h2>
          <p className="mt-2 text-sm text-[#9a8080]">
            {t('landing.dishes.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {SAMPLE_DISHES.map((dish) => (
            <div
              key={dish.id}
              className="group overflow-hidden rounded-2xl border border-[#4a1616] bg-[#1c0a0b] transition-all hover:border-[#C89B5E]/40 hover:shadow-lg hover:shadow-[#C89B5E]/5 flex flex-col"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[#2a1315]">
                <img
                  src={dish.image}
                  alt={t(`landing.dishes.items.${dish.id}.name`)}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute right-2.5 top-2.5 flex items-center gap-1 rounded-full bg-[#140708]/80 px-2 py-0.5 backdrop-blur">
                  <FiStar className="h-3 w-3 fill-[#C89B5E] text-[#C89B5E]" />
                  <span className="text-xs font-semibold text-[#E6DCDC]">{dish.rating}</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="inline-block rounded-full bg-[#C89B5E]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#C89B5E]">
                    {t(`landing.dishes.items.${dish.id}.category`)}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-[#E6DCDC] group-hover:text-[#D9A968] transition-colors">
                    {t(`landing.dishes.items.${dish.id}.name`)}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#8a7373]">
                    {t(`landing.dishes.items.${dish.id}.description`)}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-[#4a1616]/60 pt-3">
                  <div>
                    <span className="text-sm font-extrabold text-[#D9A968]">
                      {dish.price} {t('landing.dishes.currency')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/guest')}
                    className="flex items-center gap-1 text-xs font-semibold text-[#cbbcbc] transition hover:text-[#D9A968]"
                  >
                    <FiBookOpen className="h-3.5 w-3.5" />
                    {t('landing.dishes.viewMenu')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Restaurants ───────────────────────────────────── */}
      <section
        id="restaurants"
        className="mx-auto max-w-6xl scroll-mt-16 px-4 pb-16 sm:px-6 sm:pb-24"
      >
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {t('landing.restaurants.title')}
          </h2>
          <p className="mt-2 text-sm text-[#9a8080]">
            {t('landing.restaurants.subtitle')}
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
          {t('landing.cta.title')}
        </h2>
        <p className="mt-2 text-sm text-[#9a8080]">
          {t('landing.cta.subtitle')}
        </p>
        <Link
          to="/register"
          className="mt-6 inline-block rounded-xl bg-[#D9A968] px-8 py-3 font-bold text-[#2a0e10] shadow-lg transition hover:bg-[#C89B5E]"
        >
          {t('landing.cta.startFree')}
        </Link>
      </section>

      {/* ─── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#4a1616] py-6 text-center text-xs text-[#5a4a4a]">
        © {new Date().getFullYear()} RestoFlow. {t('landing.footer.rights')}
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
    address: "Toshkent, Amir Temur ko'chasi 15",
    cuisine: 'Milliy',
    rating: 4.8,
    description: "O'zbek milliy taomlari — somsa, shashlik, manti.",
  },
  {
    _id: '2',
    name: 'La Piazza',
    slug: 'la-piazza',
    address: "Samarqand, Registon ko'chasi 8",
    cuisine: 'Italiya',
    rating: 4.6,
    description: 'Haqiqiy italiya pitssasi va pastasi — oilaviy restoran.',
  },
  {
    _id: '3',
    name: 'Sushi Master',
    slug: 'sushi-master',
    address: "Buxoro, Al-Buxoriy ko'chasi 22",
    cuisine: 'Yaponiya',
    rating: 4.7,
    description: "Yangi dengiz mahsulotlari va an'anaviy yapon taomlari.",
  },
  {
    _id: '4',
    name: 'Choyxona Milliy',
    slug: 'choyxona-milliy',
    address: "Farg'ona, Mustaqillik ko'chasi 5",
    cuisine: 'Choyxona',
    rating: 4.5,
    description: "Milliy choyxona — issiq non, somsa va mazzali choy.",
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
    address: 'Urgench, Split Boulevard 30',
    cuisine: 'Nonvoy',
    rating: 4.4,
    description: 'Non, patir va pyuri — uy-nonvoyxona.',
  },
]
