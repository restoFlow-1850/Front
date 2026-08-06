// Ofitsiant paneli — stol tanlash, menyudan savat yig'ish va buyurtma yaratish.
// O'ng ustunda ofitsiantning faol buyurtmalari real vaqtda ko'rinadi.
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react'
import { toast } from 'react-toastify'

import { createOrder, getOrders, updateOrderStatus } from '../api'
import { getTables } from '../../tables/api'
import { getCategories, getProducts } from '../../menu/api'
import { unwrapList, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  NEXT_ORDER_STATUS,
  TABLE_STATUS,
  TABLE_STATUS_LABELS,
} from '../../../constants/roles'
import { Badge, Button, Card, EmptyState, Input, PageHeader, Skeleton } from '../../../components/ui'

export default function WaiterPage() {
  const queryClient = useQueryClient()

  const [tableId, setTableId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([]) // [{ product, name, price, quantity }]
  const [notes, setNotes] = useState('')

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
  })

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrapList(await getCategories(), 'categories'),
  })

  const productsQuery = useQuery({
    queryKey: ['products', { categoryId, search }],
    queryFn: async () => {
      const params = { limit: 100 }
      if (categoryId) params.category = categoryId
      if (search) params.search = search
      return unwrapList(await getProducts(params), 'products')
    },
  })

  // Faol buyurtmalar — yopilganlari bu ro'yxatda kerak emas.
  const activeOrdersQuery = useQuery({
    queryKey: ['orders', 'waiter-active'],
    queryFn: async () => unwrapList(await getOrders({ limit: 50 }), 'orders'),
    refetchInterval: 15_000,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      createOrder({
        table: tableId,
        items: cart.map(({ product, quantity }) => ({ product, quantity })),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      toast.success('Buyurtma yaratildi')
      setCart([])
      setNotes('')
      setTableId('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Buyurtma yaratilmadi')),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }) => updateOrderStatus(id, nextStatus),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    onError: (error) => toast.error(apiErrorMessage(error, "Holat o'zgarmadi")),
  })

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart],
  )

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product === product._id)
      if (existing) {
        return prev.map((i) =>
          i.product === product._id ? { ...i, quantity: i.quantity + 1 } : i,
        )
      }
      return [...prev, { product: product._id, name: product.name, price: product.price, quantity: 1 }]
    })
  }

  const changeQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.product === productId ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0),
    )
  }

  const activeOrders = (activeOrdersQuery.data ?? []).filter(
    (o) => o.status !== ORDER_STATUS.CLOSED,
  )

  return (
    <div>
      <PageHeader title="Ofitsiant paneli" subtitle="Stol tanlang va buyurtma rasmiylashtiring" />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {/* 1-qadam: stol */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              1. Stolni tanlang
            </h2>
            {tablesQuery.isLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6">
                {(tablesQuery.data ?? []).map((table) => {
                  const selected = tableId === table._id
                  const busy = table.status === TABLE_STATUS.BUSY
                  return (
                    <button
                      key={table._id}
                      type="button"
                      onClick={() => setTableId(table._id)}
                      className={`rounded-lg border-2 p-2 text-center transition ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                          : busy
                            ? 'border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40'
                            : 'border-slate-200 hover:border-indigo-400 dark:border-slate-700'
                      }`}
                    >
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">
                        {table.number}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400">
                        {TABLE_STATUS_LABELS[table.status]}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>

          {/* 2-qadam: menyu */}
          <Card>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                2. Taomlarni qo'shing
              </h2>
              <div className="w-48">
                <Input
                  placeholder="Qidirish..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              <CategoryChip active={!categoryId} onClick={() => setCategoryId('')}>
                Barchasi
              </CategoryChip>
              {(categoriesQuery.data ?? []).map((cat) => (
                <CategoryChip
                  key={cat._id}
                  active={categoryId === cat._id}
                  onClick={() => setCategoryId(cat._id)}
                >
                  {cat.name}
                </CategoryChip>
              ))}
            </div>

            {productsQuery.isLoading ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : (productsQuery.data ?? []).length === 0 ? (
              <EmptyState
                icon={UtensilsCrossed}
                title="Taom topilmadi"
                description="Boshqa kategoriya yoki qidiruv so'zini sinab ko'ring."
              />
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {(productsQuery.data ?? []).map((product) => (
                  <button
                    key={product._id}
                    type="button"
                    disabled={!product.isAvailable}
                    onClick={() => addToCart(product)}
                    className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-3 text-left transition hover:border-indigo-400 hover:bg-indigo-50/50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                        {product.name}
                      </span>
                      <span className="block text-xs text-slate-500">
                        {formatSom(product.price)}
                      </span>
                    </span>
                    <Plus className="h-4 w-4 shrink-0 text-indigo-600" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Faol buyurtmalar */}
          <Card>
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">
              Mening faol buyurtmalarim
            </h2>
            {activeOrders.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-400">Faol buyurtma yo'q</p>
            ) : (
              <div className="space-y-2">
                {activeOrders.map((order) => {
                  const next = NEXT_ORDER_STATUS[order.status]
                  return (
                    <div
                      key={order._id}
                      className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">
                        Stol {order.table?.number ?? '—'}
                      </span>
                      <Badge variant={ORDER_STATUS_TONE[order.status]}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </Badge>
                      <span className="text-xs text-slate-400">{formatTime(order.createdAt)}</span>
                      <span className="ml-auto text-sm font-semibold text-slate-900 dark:text-white">
                        {formatSom(order.totalAmount)}
                      </span>
                      {next && (
                        <Button
                          variant="secondary"
                          onClick={() => statusMutation.mutate({ id: order._id, nextStatus: next })}
                          disabled={statusMutation.isPending}
                        >
                          {ORDER_STATUS_LABELS[next]}
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Savat */}
        <Card className="lg:sticky lg:top-20 lg:self-start">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <ShoppingCart className="h-4 w-4" /> Savat
          </h2>

          {cart.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">
              Taom tanlang — bu yerda ko'rinadi
            </p>
          ) : (
            <div className="space-y-2">
              {cart.map((item) => (
                <div key={item.product} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-slate-900 dark:text-white">
                      {item.name}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {formatSom(item.price * item.quantity)}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.product, -1)}
                    className="grid h-7 w-7 place-items-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
                    aria-label="Kamaytirish"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => changeQuantity(item.product, 1)}
                    className="grid h-7 w-7 place-items-center rounded border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300"
                    aria-label="Ko'paytirish"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              ))}

              <div className="pt-2">
                <Input
                  label="Izoh (ixtiyoriy)"
                  placeholder="Masalan: achchiq qilmang"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                <span className="text-sm text-slate-500">Jami</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white">
                  {formatSom(total)}
                </span>
              </div>

              <Button
                className="w-full"
                disabled={!tableId || cart.length === 0}
                isLoading={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {tableId ? 'Buyurtmani yuborish' : 'Avval stolni tanlang'}
              </Button>

              <Button variant="ghost" className="w-full" onClick={() => setCart([])}>
                <Trash2 className="mr-2 h-4 w-4" /> Savatni tozalash
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

function CategoryChip({ active, children, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
        active
          ? 'bg-indigo-600 text-white'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
      }`}
      {...props}
    >
      {children}
    </button>
  )
}
