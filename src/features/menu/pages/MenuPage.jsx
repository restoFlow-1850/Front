import { useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Search,
  Plus,
  Filter,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  UtensilsCrossed,
  Sparkles,
  Flame,
  Star,
  Leaf,
  AlertTriangle,
  FolderPlus,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'react-toastify'

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  resolveImageUrl,
} from '../api'
import CategoryModal, { ICONS } from '../components/CategoryModal'
import ProductModal from '../components/ProductModal'
import ProductPreviewModal from '../components/ProductPreviewModal'
import { ROLES } from '../../../constants/roles'
import { unwrapList, apiErrorMessage, formatSom } from '../../../lib/api'
import { Modal, Button } from '../../../components/ui'

const TAG_CONFIG = {
  spicy: { label: 'Achchiq', icon: Flame, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40 dark:border-rose-900' },
  hot: { label: 'Xit', icon: Sparkles, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900' },
  new: { label: 'Yangi', icon: Star, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900' },
  vegetarian: { label: 'Vegetarian', icon: Leaf, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900' },
}

export default function MenuPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const role = useSelector((state) => state.auth.user?.role)
  const canManage = [ROLES.ADMIN, ROLES.MANAGER].includes(role)

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all') // 'all' | 'available' | 'unavailable'

  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState(null)

  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteProductTarget, setDeleteProductTarget] = useState(null)

  const [previewProduct, setPreviewProduct] = useState(null)

  // Fetch Categories
  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => unwrapList(await getCategories(), 'categories'),
  })

  // Fetch Products
  const productsQuery = useQuery({
    queryKey: ['products'],
    queryFn: async () => unwrapList(await getProducts(), 'products'),
  })

  const categories = categoriesQuery.data ?? []
  const products = productsQuery.data ?? []

  // Category Mutations
  const createCategoryMutation = useMutation({
    mutationFn: (data) => createCategory(data),
    onSuccess: () => {
      toast.success(t('menu.categoryAdded', { defaultValue: "Kategoriya muvaffaqiyatli qo'shildi" }))
      setIsCategoryModalOpen(false)
      setEditingCategory(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.loadFailed'))),
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, data }) => updateCategory(id, data),
    onSuccess: () => {
      toast.success(t('menu.categoryUpdated', { defaultValue: "Kategoriya yangilandi" }))
      setIsCategoryModalOpen(false)
      setEditingCategory(null)
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.loadFailed'))),
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => deleteCategory(id),
    onSuccess: () => {
      toast.success(t('menu.categoryDeleted', { defaultValue: "Kategoriya o'chirildi" }))
      setDeleteCategoryTarget(null)
      if (activeCategory === deleteCategoryTarget?._id) {
        setActiveCategory('all')
      }
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.loadFailed'))),
  })

  // Product Mutations
  const createProductMutation = useMutation({
    mutationFn: (formData) => createProduct(formData),
    onSuccess: () => {
      toast.success(t('menu.dishAdded', { defaultValue: "Taom muvaffaqiyatli qo'shildi" }))
      setIsProductModalOpen(false)
      setEditingProduct(null)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.loadFailed'))),
  })

  const updateProductMutation = useMutation({
    mutationFn: ({ id, formData }) => updateProduct(id, formData),
    onSuccess: () => {
      toast.success(t('menu.dishUpdated', { defaultValue: "Taom yangilandi" }))
      setIsProductModalOpen(false)
      setEditingProduct(null)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.loadFailed'))),
  })

  const toggleAvailabilityMutation = useMutation({
    mutationFn: ({ id, isAvailable }) => updateProduct(id, { isAvailable }),
    onSuccess: (_data, { isAvailable }) => {
      toast.success(isAvailable ? t('menu.available') : t('menu.outOfStock'))
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('kitchen.statusChangeFailed'))),
  })

  const deleteProductMutation = useMutation({
    mutationFn: (id) => deleteProduct(id),
    onSuccess: () => {
      toast.success(t('orders.deleted', { defaultValue: "Taom o'chirildi" }))
      setDeleteProductTarget(null)
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, t('orders.deleteFailed'))),
  })

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const pCatId = p.category?._id ?? p.category
      const matchesCat = activeCategory === 'all' || pCatId === activeCategory
      const matchesSearch =
        !search.trim() ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
      const matchesAvailability =
        availabilityFilter === 'all' ||
        (availabilityFilter === 'available' && p.isAvailable) ||
        (availabilityFilter === 'unavailable' && !p.isAvailable)

      return matchesCat && matchesSearch && matchesAvailability
    })
  }, [products, activeCategory, search, availabilityFilter])

  const iconMap = useMemo(() => {
    const map = {}
    ICONS.forEach(({ key, Icon }) => {
      map[key] = Icon
    })
    return map
  }, [])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t('menu.title')}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('menu.subtitle')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            onClick={() => {
              categoriesQuery.refetch()
              productsQuery.refetch()
            }}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${
                categoriesQuery.isFetching || productsQuery.isFetching ? 'animate-spin' : ''
              }`}
            />
            {t('refresh')}
          </Button>

          {canManage && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryModalOpen(true)
                }}
              >
                <FolderPlus className="mr-1.5 h-4 w-4 text-[#F97316]" />
                {t('menu.addCategory')}
              </Button>

              <Button
                onClick={() => {
                  setEditingProduct(null)
                  setIsProductModalOpen(true)
                }}
              >
                <Plus className="mr-1.5 h-4 w-4" />
                {t('menu.addDish')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#111827]">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('waiter.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-10 pr-4 text-xs sm:text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setAvailabilityFilter('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                availabilityFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t('all')}
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('available')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                availabilityFilter === 'available'
                  ? 'bg-emerald-500 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t('menu.available')}
            </button>
            <button
              type="button"
              onClick={() => setAvailabilityFilter('unavailable')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                availabilityFilter === 'unavailable'
                  ? 'bg-rose-500 text-white shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              {t('menu.outOfStock')}
            </button>
          </div>
        </div>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
            activeCategory === 'all'
              ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25 scale-102'
              : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800'
          }`}
        >
          <UtensilsCrossed size={16} />
          <span>{t('waiter.allCategories')} ({products.length})</span>
        </button>

        {categories.map((cat) => {
          const Icon = iconMap[cat.icon] || UtensilsCrossed
          const count = products.filter((p) => (p.category?._id ?? p.category) === cat._id).length
          const isActive = activeCategory === cat._id

          return (
            <div key={cat._id} className="relative group shrink-0">
              <button
                type="button"
                onClick={() => setActiveCategory(cat._id)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/25 scale-102'
                    : 'border border-slate-200/80 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-[#111827] dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={16} />
                <span>{cat.name}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[11px] ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>

              {/* Edit/Delete category actions for admin */}
              {canManage && (
                <div className="absolute right-1 top-1 hidden group-hover:flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 rounded-lg p-0.5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingCategory(cat)
                      setIsCategoryModalOpen(true)
                    }}
                    className="p-1 text-slate-600 hover:text-orange-500 dark:text-slate-300"
                    title={t('edit')}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setDeleteCategoryTarget(cat)
                    }}
                    className="p-1 text-rose-500 hover:text-rose-600"
                    title={t('delete')}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Products Grid */}
      {productsQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-72 animate-pulse rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50"
            />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#111827]">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-orange-500/10 text-[#F97316]">
            <UtensilsCrossed size={28} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{t('waiter.noDishesFound')}</h3>
          <p className="mt-1 max-w-sm text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {t('waiter.tryAnotherCat')}
          </p>
          {canManage && (
            <Button
              className="mt-4"
              onClick={() => {
                setEditingProduct(null)
                setIsProductModalOpen(true)
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" /> {t('menu.addDish')}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => {
            const catName =
              categories.find((c) => c._id === (product.category?._id ?? product.category))?.name ||
              product.category?.name ||
              ''
            const imageUrl = product.image ? resolveImageUrl(product.image) : null

            return (
              <div
                key={product._id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs transition-all hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 dark:border-slate-800 dark:bg-[#111827] dark:hover:shadow-none"
              >
                {/* Top Image */}
                <div
                  className="relative h-44 w-full overflow-hidden bg-slate-100 dark:bg-slate-800 cursor-pointer"
                  onClick={() => setPreviewProduct(product)}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <UtensilsCrossed size={36} className="opacity-40" />
                    </div>
                  )}

                  {/* Availability Badge */}
                  <div className="absolute left-3 top-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold backdrop-blur-md ${
                        product.isAvailable
                          ? 'bg-emerald-500/90 text-white'
                          : 'bg-rose-500/90 text-white'
                      }`}
                    >
                      {product.isAvailable ? t('menu.available') : t('menu.outOfStock')}
                    </span>
                  </div>

                  {/* Weight Badge */}
                  {product.weight && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                        {product.weight}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {catName}
                      </span>
                      <h3
                        onClick={() => setPreviewProduct(product)}
                        className="cursor-pointer font-bold text-slate-900 transition hover:text-[#F97316] dark:text-white text-base line-clamp-1"
                      >
                        {product.name}
                      </h3>
                    </div>
                  </div>

                  {product.description && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Tags */}
                  {product.tags?.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {product.tags.map((tagKey) => {
                        const conf = TAG_CONFIG[tagKey]
                        if (!conf) return null
                        const Icon = conf.icon
                        return (
                          <span
                            key={tagKey}
                            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold ${conf.color}`}
                          >
                            <Icon size={11} />
                            <span>{conf.label}</span>
                          </span>
                        )
                      })}
                    </div>
                  )}

                  {/* Bottom Price & Controls */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800/80">
                    <span className="text-base font-extrabold text-[#F97316]">
                      {formatSom(product.price)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewProduct(product)}
                        className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                        title={t('view')}
                      >
                        <Eye size={16} />
                      </button>

                      {canManage && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              toggleAvailabilityMutation.mutate({
                                id: product._id,
                                isAvailable: !product.isAvailable,
                              })
                            }
                            className={`rounded-xl p-1.5 transition ${
                              product.isAvailable
                                ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                                : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                            title={product.isAvailable ? t('menu.outOfStock') : t('menu.available')}
                          >
                            {product.isAvailable ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setEditingProduct(product)
                              setIsProductModalOpen(true)
                            }}
                            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                            title={t('edit')}
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteProductTarget(product)}
                            className="rounded-xl p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title={t('delete')}
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false)
          setEditingCategory(null)
        }}
        onSubmit={async (values) => {
          if (editingCategory) {
            await updateCategoryMutation.mutateAsync({ id: editingCategory._id, data: values })
          } else {
            await createCategoryMutation.mutateAsync(values)
          }
        }}
        category={editingCategory}
      />

      {/* Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false)
          setEditingProduct(null)
        }}
        onSubmit={async (formData) => {
          if (editingProduct) {
            await updateProductMutation.mutateAsync({ id: editingProduct._id, formData })
          } else {
            await createProductMutation.mutateAsync(formData)
          }
        }}
        product={editingProduct}
        categories={categories}
      />

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={Boolean(previewProduct)}
        onClose={() => setPreviewProduct(null)}
        onEdit={(p) => {
          setPreviewProduct(null)
          setEditingProduct(p)
          setIsProductModalOpen(true)
        }}
        product={previewProduct}
        imageUrl={previewProduct?.image ? resolveImageUrl(previewProduct.image) : null}
        categoryLabel={
          categories.find((c) => c._id === (previewProduct?.category?._id ?? previewProduct?.category))
            ?.name || ''
        }
        CategoryIcon={
          iconMap[
            categories.find((c) => c._id === (previewProduct?.category?._id ?? previewProduct?.category))
              ?.icon
          ]
        }
        canManage={canManage}
      />

      {/* Delete Category Modal */}
      <Modal
        isOpen={Boolean(deleteCategoryTarget)}
        onClose={() => setDeleteCategoryTarget(null)}
        title={t('confirm')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteCategoryTarget(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteCategoryMutation.isPending}
              onClick={() => deleteCategoryMutation.mutate(deleteCategoryTarget._id)}
            >
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            "{deleteCategoryTarget?.name}" {t('cashier.confirmCancel')}
          </p>
        </div>
      </Modal>

      {/* Delete Product Modal */}
      <Modal
        isOpen={Boolean(deleteProductTarget)}
        onClose={() => setDeleteProductTarget(null)}
        title={t('confirm')}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDeleteProductTarget(null)}>
              {t('cancel')}
            </Button>
            <Button
              variant="danger"
              isLoading={deleteProductMutation.isPending}
              onClick={() => deleteProductMutation.mutate(deleteProductTarget._id)}
            >
              {t('delete')}
            </Button>
          </>
        }
      >
        <div className="flex items-center gap-3 py-2">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
            "{deleteProductTarget?.name}" {t('cashier.confirmCancel')}
          </p>
        </div>
      </Modal>
    </div>
  )
}
