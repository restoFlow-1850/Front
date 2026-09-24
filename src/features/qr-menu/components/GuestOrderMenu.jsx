// Menyu ko'rinishi (mehmon, QR-menyu): kategoriyalar, qidiruv, rasm, narx —
// telefonga moslashgan. Savat pastida float bar va yuqoriga ochiladigan savat
// paneli (miqdor +/- va har bir taomga izoh — masalan "piyozsiz").
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FiMinus, FiPlus, FiSearch, FiShoppingCart, FiTrash2 } from 'react-icons/fi'

import { createPublicOrder, resolveImageUrl, formatSum } from '../api'
import { GuestHeader } from './SnackHeader'

function loadMenuFor(restaurantId) {
  // Import qilish kechiktiriladi — faqat kerak bo'lganda yuklanadi.
  // Tugagan (stock=0 / isAvailable=false) taomlar ham ko'rinadi — "tugagan" deb
  // belgilab, bosish bloklanadi (3-hafta: sayqal).
  return Promise.resolve().then(async () => {
    const { getGuestRestaurantMenu, getPublicCategories } = await import('../api')
    const res = await getGuestRestaurantMenu(restaurantId)
    if (restaurantId) {
      const payload = res.data?.data ?? res.data
      return { categories: payload.categories ?? [], products: payload.products ?? [] }
    }
    const catRes = await getPublicCategories()
    const catPayload = catRes.data?.data ?? catRes.data
    const prodPayload = res.data?.data ?? res.data
    return {
      categories: Array.isArray(catPayload) ? catPayload : (catPayload.categories ?? []),
      products: Array.isArray(prodPayload) ? prodPayload : (prodPayload.products ?? []),
    }
  })
}

export default function GuestOrderMenu({ tableId, tableNumber, restaurant, onOrderPlaced }) {
  const { t } = useTranslation()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryKey, setRetryKey] = useState(0)
  const [activeCategory, setActiveCategory] = useState(null)
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [placing, setPlacing] = useState(false)
  const loadedRestaurantId = useRef(null)

  const restaurantId = restaurant?.id ?? restaurant?._id

  const fetchMenu = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { categories: cats, products: prods } = await loadMenuFor(restaurantId)
      setCategories(cats.filter((cat) => cat.isActive !== false))
      setProducts(prods)
      loadedRestaurantId.current = restaurantId
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'load_failed')
    } finally {
      setLoading(false)
    }
  }, [restaurantId])

  useEffect(() => {
    fetchMenu()
  }, [fetchMenu, retryKey])

  const handleQtyChange = useCallback((product, delta) => {
    setCart((prev) => {
      const current = prev[product._id]?.quantity || 0
      const next = current + delta
      if (next <= 0) {
        const copy = { ...prev }
        delete copy[product._id]
        return copy
      }
      return {
        ...prev,
        [product._id]: {
          product,
          quantity: next,
          note: prev[product._id]?.note || '',
        },
      }
    })
  }, [])

  const handleNoteChange = useCallback((productId, note) => {
    setCart((prev) =>
      prev[productId]
        ? { ...prev, [productId]: { ...prev[productId], note } }
        : prev
    )
  }, [])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems])
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems]
  )

  const normalized = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = activeCategory
      ? products.filter((p) => String(p.category?._id ?? p.category) === activeCategory)
      : products
    if (!q) return base
    return base.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, activeCategory, search])

  const isSoldOut = useCallback((product) => {
    if (product?.isAvailable === false) return true
    const stock = Number(product?.stock ?? product?.inStock)
    return stock === 0
  }, [])

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0 || placing) return
    setPlacing(true)
    try {
      const res = await createPublicOrder({
        table: tableId,
        items: cartItems.map(({ product, quantity, note }) => ({
          product: product._id,
          quantity,
          note: note?.trim() || undefined,
        })),
      })
      // Javobning `data.order` yoki `data` konteyneridan buyurtmani ajratamiz.
      const data = res.data?.data ?? res.data
      const createdOrder = data?.order ?? data
      onOrderPlaced(createdOrder, createdOrder?._id ?? createdOrder?.id, createdOrder?.orderNumber ?? createdOrder?.number)
    } catch (err) {
      const message = err?.response?.data?.message || err?.message
      setPlacing(false)
      setCartOpen(false)
      // Xatoni status sahifasiga emas, menyuda ko'rsatamiz
      setError(message || 'place_failed')
    }
  }

  return (
    <GuestHeader restaurant={restaurant} tableNumber={tableNumber}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">
            {t('guestOrder.menuTitle')} {tableNumber && <span className="text-[#F97316]">· {t('guestOrder.table', { table: tableNumber })}</span>}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{t('guestOrder.menuSubtitle')}</p>
        </div>

        {/* Qidiruv */}
        <div className="relative">
          <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('guestOrder.searchPlaceholder')}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/70 py-3 pl-11 pr-4 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]"
          />
        </div>

        {/* Kategoriyalar */}
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              !activeCategory
                ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {t('guestOrder.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              type="button"
              onClick={() => setActiveCategory(cat._id)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeCategory === cat._id
                  ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menyu / yuklanmoqda / xatolik */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <div className="h-32 animate-pulse bg-slate-800" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-800" />
                  <div className="h-3.5 w-1/3 animate-pulse rounded bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            <p className="text-4xl">🍽️</p>
            <p className="max-w-sm text-sm text-slate-400">{error}</p>
            <button
              type="button"
              onClick={() => setRetryKey((n) => n + 1)}
              className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              {t('guestOrder.retry')}
            </button>
          </div>
        ) : normalized.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 px-6 py-14 text-center">
            <p className="text-4xl">{search ? '🔍' : '🍽️'}</p>
            <p className="text-sm font-semibold text-slate-300">
              {search ? t('guestOrder.noResults') : t('guestOrder.noProducts')}
            </p>
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-xs font-semibold text-[#F97316] hover:underline"
              >
                {t('guestOrder.clearSearch')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {normalized.map((product) => {
              const soldOut = isSoldOut(product)
              const inCart = cart[product._id]
              const img = resolveImageUrl(product.image)
              return (
                <div
                  key={product._id}
                  className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-slate-900/60 shadow-sm transition ${
                    soldOut ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="relative h-32 w-full bg-slate-800">
                    {img ? (
                      <img src={img} alt={product.name} className="h-full w-full object-cover" loading="lazy" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
                    )}
                    {soldOut && (
                      <div className="absolute inset-0 flex items-center justify-center bg-[#0B0F17]/70 backdrop-blur-[1px]">
                        <span className="rounded-full bg-red-500/90 px-3 py-1 text-xs font-bold text-white shadow">
                          {t('guestOrder.soldOut')}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className={`line-clamp-2 text-sm font-semibold ${soldOut ? 'text-slate-400' : 'text-slate-100'}`}>
                      {product.name}
                    </p>
                    <p className="mt-auto flex items-center justify-between text-sm font-bold text-[#F97316]">
                      {formatSum(product.price)}
                    </p>

                    {soldOut ? (
                      <button
                        type="button"
                        disabled
                        className="mt-2 w-full rounded-lg bg-slate-800 py-1.5 text-xs font-semibold text-slate-500"
                      >
                        {t('guestOrder.unavailable')}
                      </button>
                    ) : inCart ? (
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-slate-800 px-1.5 py-1">
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product, -1)}
                          className="flex size-6 items-center justify-center rounded-md bg-[#0B0F17] text-[#F97316] hover:bg-black"
                        >
                          <FiMinus size={13} />
                        </button>
                        <span className="text-sm font-bold text-slate-100">{inCart.quantity}</span>
                        <button
                          type="button"
                          onClick={() => handleQtyChange(product, 1)}
                          className="flex size-6 items-center justify-center rounded-md bg-[#0B0F17] text-[#F97316] hover:bg-black"
                        >
                          <FiPlus size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleQtyChange(product, 1)}
                        className="mt-2 w-full rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] py-1.5 text-xs font-bold text-white shadow-md shadow-orange-500/20 transition hover:brightness-110"
                      >
                        {t('guestOrder.add')}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Float savat paneli */}
      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="flex w-full items-center justify-between rounded-2xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 py-3.5 text-white shadow-2xl shadow-orange-500/30 transition hover:brightness-110"
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <span className="flex size-6 items-center justify-center rounded-full bg-white/20 text-xs">
                  <FiShoppingCart size={14} />
                </span>
                {t('guestOrder.viewCart')} · {cartCount}
              </span>
              <span className="text-sm font-black">{formatSum(cartTotal)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Savat modal paneli */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="relative mx-auto flex max-h-[85vh] w-full max-w-md flex-col rounded-t-3xl bg-[#0F172A] sm:rounded-3xl border border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-white">
                <FiShoppingCart className="text-[#F97316]" />
                {t('guestOrder.cart')}
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs font-bold text-slate-300">{cartCount}</span>
              </h3>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {cartItems.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">{t('guestOrder.cartEmpty')}</p>
              )}

              {cartItems.map((item) => (
                <div key={item.product._id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-100">{item.product.name}</p>
                      <p className="mt-0.5 text-xs font-bold text-[#F97316]">
                        {formatSum(item.product.price)} × {item.quantity} = {formatSum(item.product.price * item.quantity)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleQtyChange(item.product, -item.quantity)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-red-400"
                      aria-label={t('guestOrder.remove')}
                    >
                      <FiTrash2 size={15} />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1 rounded-lg bg-slate-800 px-1 py-1">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.product, -1)}
                        className="flex size-7 items-center justify-center rounded-md bg-[#0B0F17] text-[#F97316] hover:bg-black"
                      >
                        <FiMinus size={13} />
                      </button>
                      <span className="w-7 text-center text-sm font-bold text-slate-100">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(item.product, 1)}
                        className="flex size-7 items-center justify-center rounded-md bg-[#0B0F17] text-[#F97316] hover:bg-black"
                      >
                        <FiPlus size={13} />
                      </button>
                    </div>
                  </div>

                  <input
                    value={item.note}
                    onChange={(e) => handleNoteChange(item.product._id, e.target.value)}
                    placeholder={t('guestOrder.itemNote')}
                    className="mt-2 w-full rounded-lg border border-slate-800 bg-[#0B0F17] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-[#F97316]"
                  />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 px-5 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-slate-400">{t('guestOrder.totalAmount')}</span>
                <span className="text-lg font-black text-slate-100">{formatSum(cartTotal)}</span>
              </div>
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={placing || cartItems.length === 0}
                className="w-full rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {placing ? `${t('guestOrder.placing')}...` : t('guestOrder.placeOrder')}
              </button>
            </div>
          </div>
        </div>
      )}
    </GuestHeader>
  )
}