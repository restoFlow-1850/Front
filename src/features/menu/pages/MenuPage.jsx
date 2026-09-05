import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSearch,
  FiSliders,
  FiChevronDown,
  FiCalendar,
  FiBell,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiStar,
  FiBarChart2,
  FiMoreHorizontal,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import { GiMeal, GiSprout } from 'react-icons/gi'
import { getCategories, getProducts, resolveImageUrl } from '../api'
import CategoryModal, { ICONS } from '../components/CategoryModal'
import ProductModal from '../components/ProductModal'
import ProductPreviewModal from '../components/ProductPreviewModal'
import ConfirmDialog from '../components/ConfirmDialog'
import { Skeleton } from '../../../components/ui'
import './MenuPage.css'

const STORAGE_KEY_CATEGORIES = 'menu_test_categories'
const STORAGE_KEY_PRODUCTS = 'menu_test_products'
const STORAGE_KEY_DELETED_COUNT = 'menu_test_deleted_count'

// Если у блюда нет своей загруженной фотографии — подбираем подходящее фото
// еды по ключевым словам в названии блюда, а затем в названии категории.
const FALLBACK_PHOTOS = [
  { keywords: ['бургер', 'burger'], url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['пицц', 'pizza'], url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['паст', 'спагетти', 'карбонара', 'pasta'], url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['стейк', 'steak', 'мясо', 'гушт'], url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['салат', 'цезарь', 'salat', 'salad'], url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['суп', 'борщ', 'шурпа', 'лагман', 'sup', 'soup'], url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['торт', 'десерт', 'тирамису', 'чизкейк', 'пирож', 'cake', 'dessert'], url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['напит', 'сок', 'кофе', 'чай', 'лимонад', 'кола', 'choy', 'kola', 'ichimlik', 'drink'], url: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=70&auto=format&fit=crop' },
  { keywords: ['закуск', 'брускетта', 'снек', 'snack'], url: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=400&q=70&auto=format&fit=crop' },
]

const DEFAULT_DISH_PHOTO = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70&auto=format&fit=crop'

const fallbackPhotoFor = (productName, categoryName) => {
  const haystack = `${productName ?? ''} ${categoryName ?? ''}`.toLowerCase()
  const match = FALLBACK_PHOTOS.find(({ keywords }) => keywords.some((kw) => haystack.includes(kw)))
  return match?.url ?? DEFAULT_DISH_PHOTO
}

const fileToDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

// Читаем/пишем в localStorage бережно: битые данные или переполненная квота
// не должны приводить к тому, что категории/блюда "исчезают".
const safeLoadJSON = (key) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const safeSaveJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

// Блюда хранят фото как base64 и могут упереться в квоту localStorage.
// Если обычное сохранение не влезло — сохраняем блюда без фото, чтобы
// сами блюда не "пропадали" после перезагрузки (теряется только фото).
// Возвращает 'ok' | 'fallback' (фото пришлось убрать) | 'failed'.
const saveProductsWithFallback = (products) => {
  if (safeSaveJSON(STORAGE_KEY_PRODUCTS, products)) return 'ok'
  const stripped = products.map((p) => (p._localImage ? { ...p, image: null, _localImage: false } : p))
  return safeSaveJSON(STORAGE_KEY_PRODUCTS, stripped) ? 'fallback' : 'failed'
}

// Ровно 2 ряда карточек (4 колонки × 2) на страницу — секция не растёт дальше,
// следующие блюда открываются только кнопкой пагинации, без скролла страницы.
const PAGE_SIZE = 8

// Номера страниц с "..." для пропусков, как в референсе (1 2 3 ... 6)
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...')
    result.push(p)
  })
  return result
}

export default function MenuPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')

  const [categoryModal, setCategoryModal] = useState({ open: false, category: null })
  const [productModal, setProductModal] = useState({ open: false, product: null })
  const [previewModal, setPreviewModal] = useState({ open: false, product: null })
  const [confirmDelete, setConfirmDelete] = useState({ open: false, type: null, item: null })
  const [deletedCount, setDeletedCount] = useState(() => safeLoadJSON(STORAGE_KEY_DELETED_COUNT) ?? 0)
  const [currentPage, setCurrentPage] = useState(1)
  const [openCardMenu, setOpenCardMenu] = useState(null)

  useEffect(() => {
    if (!openCardMenu) return
    const closeMenu = () => setOpenCardMenu(null)
    const t = setTimeout(() => document.addEventListener('click', closeMenu), 0)
    return () => {
      clearTimeout(t)
      document.removeEventListener('click', closeMenu)
    }
  }, [openCardMenu])

  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const dateInputRef = useRef(null)

  const openDatePicker = () => {
    const el = dateInputRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') el.showPicker()
    else el.click()
  }

  const handleDateChange = (e) => {
    if (!e.target.value) return
    setSelectedDate(new Date(`${e.target.value}T00:00:00`))
  }

  const dateInputValue = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
  const formattedDate = selectedDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  const loadCategories = async () => {
    const res = await getCategories()
    const payload = res.data?.data ?? res.data
    return payload?.categories ?? payload ?? []
  }

  const loadProducts = async () => {
    const res = await getProducts()
    const payload = res.data?.data ?? res.data
    return payload?.products ?? payload ?? []
  }

  // Тест-режим сохраняет категории/блюда в localStorage, чтобы они не пропадали
  // при перезагрузке страницы (реального сохранения на сервере пока нет — см. комментарий ниже).
  const loadAll = async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const savedCategories = safeLoadJSON(STORAGE_KEY_CATEGORIES)
      const savedProducts = safeLoadJSON(STORAGE_KEY_PRODUCTS)

      const cats = savedCategories ?? (await loadCategories())
      const prods = savedProducts ?? (await loadProducts())
      setCategories(cats)
      setProducts(prods)
      if (!savedCategories) safeSaveJSON(STORAGE_KEY_CATEGORIES, cats)
      if (!savedProducts) saveProductsWithFallback(prods)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const productCategoryId = p.category?._id ?? p.category
      const matchesCategory = activeCategory === 'all' || productCategoryId === activeCategory
      const matchesSearch = p.name?.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [products, activeCategory, search])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategory, search])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const rangeStart = filteredProducts.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredProducts.length)

  const categoryName = (id) => categories.find((c) => c._id === id)?.name
  const categoryIconFor = (key) => ICONS.find((i) => i.key === key)?.Icon
  const categoryColorFor = (id) => categories.find((c) => c._id === id)?.color || '#999'

  const previewProduct = previewModal.product
  const previewCategoryId = previewProduct?.category?._id ?? previewProduct?.category
  const previewCategoryLabel = previewProduct ? categoryName(previewCategoryId) : ''
  const previewImageUrl = previewProduct
    ? (previewProduct._localImage ? previewProduct.image : resolveImageUrl(previewProduct.image)) ?? fallbackPhotoFor(previewProduct.name, previewCategoryLabel)
    : null
  const PreviewCategoryIcon = previewProduct ? categoryIconFor(categories.find((c) => c._id === previewCategoryId)?.icon) : null

  const availableCount = products.filter((p) => p.isAvailable).length
  const unavailableCount = products.length - availableCount
  const newCount = products.filter((p) => p._id?.startsWith('local-')).length
  const totalEver = products.length + deletedCount
  const percentOf = (n) => (totalEver ? Math.round((n / totalEver) * 100) : 0)

  const stats = [
    {
      label: 'Всего блюд',
      value: products.length,
      detail: `+${newCount} новых`,
      icon: GiMeal,
      bg: '#EAEAF8',
      fg: '#3B3F72',
    },
    {
      label: 'Активных',
      value: availableCount,
      detail: `${percentOf(availableCount)}% от всех`,
      icon: GiSprout,
      bg: '#E3F5E9',
      fg: '#3FA65C',
    },
    {
      label: 'Скрытых',
      value: unavailableCount,
      detail: `${percentOf(unavailableCount)}% от всех`,
      icon: FiEye,
      bg: '#FDECDA',
      fg: '#E29A3E',
    },
    {
      label: 'Удалённых',
      value: deletedCount,
      detail: `${percentOf(deletedCount)}% от всех`,
      icon: FiTrash2,
      bg: '#FBE3E3',
      fg: '#DC4C4C',
    },
  ]

  // Категории — ВРЕМЕННО (тест-режим): бэкенд требует роль admin/manager,
  // которой пока нет у тестового аккаунта, поэтому сохраняем локально (localStorage), без реального API-запроса.
  const handleCategorySubmit = async (values) => {
    let next
    if (categoryModal.category) {
      const id = categoryModal.category._id
      next = categories.map((c) => (c._id === id ? { ...c, ...values } : c))
      toast.success('Категория обновлена (тест-режим, без сохранения на сервере)')
    } else {
      const newCategory = { _id: `local-${Date.now()}`, isActive: true, ...values }
      next = [...categories, newCategory]
      toast.success('Категория добавлена (тест-режим, без сохранения на сервере)')
    }
    setCategories(next)
    if (!safeSaveJSON(STORAGE_KEY_CATEGORIES, next)) {
      toast.error('Не удалось сохранить категорию в хранилище браузера (превышен лимит)')
    }
    setCategoryModal({ open: false, category: null })
  }

  // Блюда — тот же временный локальный режим, что и для категорий
  const handleProductSubmit = async (formData) => {
    const file = formData.get('image')
    const hasNewImage = file && file.size > 0
    const imageDataUrl = hasNewImage ? await fileToDataUrl(file) : null
    const values = {
      name: formData.get('name'),
      description: formData.get('description'),
      price: Number(formData.get('price')),
      category: formData.get('category'),
      weight: formData.get('weight'),
      isAvailable: formData.get('isAvailable') === 'true',
      isFeatured: formData.get('isFeatured') === 'true',
      tags: JSON.parse(formData.get('tags') || '[]'),
    }

    let next
    if (productModal.product) {
      const id = productModal.product._id
      next = products.map((p) => {
        if (p._id !== id) return p
        return {
          ...p,
          ...values,
          image: hasNewImage ? imageDataUrl : p.image,
          _localImage: hasNewImage ? true : p._localImage,
        }
      })
      toast.success('Блюдо обновлено (тест-режим, без сохранения на сервере)')
    } else {
      const newProduct = {
        _id: `local-${Date.now()}`,
        ...values,
        image: hasNewImage ? imageDataUrl : null,
        _localImage: hasNewImage,
      }
      next = [...products, newProduct]
      toast.success('Блюдо добавлено (тест-режим, без сохранения на сервере)')
    }
    setProducts(next)
    const saveResult = saveProductsWithFallback(next)
    if (saveResult === 'failed') {
      toast.error('Не удалось сохранить блюдо в хранилище браузера (превышен лимит)')
    } else if (saveResult === 'fallback') {
      toast.warning('Блюдо сохранено, но фото не поместилось в хранилище браузера')
    }
    setProductModal({ open: false, product: null })
  }

  const persistProducts = (next) => {
    setProducts(next)
    const saveResult = saveProductsWithFallback(next)
    if (saveResult === 'failed') {
      toast.error('Не удалось сохранить изменения в хранилище браузера (превышен лимит)')
    }
  }

  const handleDuplicateProduct = (product) => {
    const copy = { ...product, _id: `local-${Date.now()}`, name: `${product.name} (копия)` }
    persistProducts([...products, copy])
    toast.success('Блюдо продублировано (тест-режим, без сохранения на сервере)')
  }

  const handleToggleAvailability = (product) => {
    const next = products.map((p) => (p._id === product._id ? { ...p, isAvailable: !p.isAvailable } : p))
    persistProducts(next)
    toast.success(product.isAvailable ? 'Блюдо скрыто из меню' : 'Блюдо снова отображается в меню')
  }

  const handleToggleFeatured = (product) => {
    const next = products.map((p) => (p._id === product._id ? { ...p, isFeatured: !p.isFeatured } : p))
    persistProducts(next)
    toast.success(product.isFeatured ? 'Убрано из рекомендуемых' : 'Блюдо теперь рекомендуемое')
  }

  const handleViewProduct = (product) => {
    setPreviewModal({ open: true, product })
  }

  const handleShowStats = (product) => {
    toast.info(`Статистика по «${product.name}» пока недоступна`)
  }

  // Удаление — локально, без реального API-запроса (см. комментарий выше)
  const handleConfirmDelete = async () => {
    if (confirmDelete.type === 'category') {
      const next = categories.filter((c) => c._id !== confirmDelete.item._id)
      setCategories(next)
      safeSaveJSON(STORAGE_KEY_CATEGORIES, next)
      if (activeCategory === confirmDelete.item._id) setActiveCategory('all')
      toast.success('Категория удалена (тест-режим)')
    } else {
      const next = products.filter((p) => p._id !== confirmDelete.item._id)
      setProducts(next)
      saveProductsWithFallback(next)
      const nextDeletedCount = deletedCount + 1
      setDeletedCount(nextDeletedCount)
      safeSaveJSON(STORAGE_KEY_DELETED_COUNT, nextDeletedCount)
      toast.success('Блюдо удалено (тест-режим)')
    }
    setConfirmDelete({ open: false, type: null, item: null })
  }

  return (
    <div className="menu-page">
      <header className="menu-page-header">
        <div className="menu-header-left">
          <h1 className="menu-header-title">Меню</h1>
          <p className="menu-header-crumb">Главная • Меню</p>
        </div>

        <div className="menu-header-right">
          <label className="menu-header-search">
            <input
              type="search"
              placeholder="Поиск блюд..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <FiSearch className="menu-header-search-icon" />
          </label>

          <button type="button" className="menu-header-filter-btn">
            <FiSliders className="menu-header-filter-icon" />
            Фильтры
            <FiChevronDown className="menu-header-filter-chevron" />
          </button>

          <button type="button" className="menu-header-notif" aria-label="Уведомления">
            <FiBell className="menu-header-notif-icon" />
            <span className="menu-header-notif-dot">3</span>
          </button>

          <div
            className="menu-header-date"
            role="button"
            tabIndex={0}
            onClick={openDatePicker}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openDatePicker()}
          >
            <FiCalendar className="menu-header-date-icon" />
            {formattedDate}
            <FiChevronDown className="menu-header-date-chevron" />
            <input
              ref={dateInputRef}
              type="date"
              className="menu-header-date-input"
              value={dateInputValue}
              onChange={handleDateChange}
              aria-label="Выбрать дату"
            />
          </div>
        </div>
      </header>

      <div className="menu-stats-grid">
        {stats.map(({ label, value, detail, icon: Icon, bg, fg }) => (
          <div key={label} className="menu-stat-card">
            <span className="menu-stat-icon" style={{ background: bg, color: fg }}>
              <Icon />
            </span>
            <div className="menu-stat-text">
              <span className="menu-stat-label">{label}</span>
              <strong>{value}</strong>
              <span className="menu-stat-detail">{detail}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="menu-tabs-row">
        <div className="menu-tabs-left">
          <button
            type="button"
            className={`menu-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            Все блюда
          </button>
          {categories.map((cat) => {
            const CatIcon = categoryIconFor(cat.icon)
            return (
              <div key={cat._id} className="menu-tab-wrap">
                <button
                  type="button"
                  className={`menu-tab ${activeCategory === cat._id ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat._id)}
                >
                  {CatIcon && <CatIcon className="menu-tab-icon" />}
                  {cat.name}
                </button>
                <button
                  type="button"
                  className="menu-tab-delete"
                  aria-label="Удалить категорию"
                  onClick={() => setConfirmDelete({ open: true, type: 'category', item: cat })}
                >
                  <FiX />
                </button>
              </div>
            )
          })}
          <button
            type="button"
            className="menu-tab menu-tab-action"
            onClick={() => setCategoryModal({ open: true, category: null })}
          >
            <FiPlus /> Категория
          </button>
        </div>

        <button type="button" className="menu-tab menu-tab-action" onClick={() => setProductModal({ open: true, product: null })}>
          <FiPlus /> Добавить блюдо
        </button>
      </div>

      {isLoading && (
        <div className="dish-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full" />
          ))}
        </div>
      )}

      {!isLoading && isError && <p className="menu-empty-hint">Не удалось загрузить меню</p>}

      {!isLoading && !isError && filteredProducts.length === 0 && (
        <p className="menu-empty-hint">Блюда не найдены</p>
      )}

      {!isLoading && !isError && filteredProducts.length > 0 && (
        <>
          <div className="dish-grid">
            {pagedProducts.map((product) => {
              const productCategoryId = product.category?._id ?? product.category
              const categoryLabel = categoryName(productCategoryId)
              const imageUrl = (product._localImage ? product.image : resolveImageUrl(product.image))
                ?? fallbackPhotoFor(product.name, categoryLabel)
              const CatIcon = categoryIconFor(categories.find((c) => c._id === productCategoryId)?.icon)
              const catColor = categoryColorFor(productCategoryId)
              const menuOpen = openCardMenu === product._id
              return (
                <div
                  key={product._id}
                  className={`dish-card ${menuOpen ? 'dish-card-menu-active' : ''}`}
                  onClick={() => handleViewProduct(product)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleViewProduct(product) } }}
                  role="button"
                  tabIndex={0}
                >
                  <div className="dish-card-image">
                    <img src={imageUrl} alt={product.name} loading="lazy" />
                    <button
                      type="button"
                      className="dish-card-dots"
                      aria-label="Меню блюда"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenCardMenu(menuOpen ? null : product._id)
                      }}
                    >
                      <FiMoreHorizontal />
                    </button>
                  </div>

                  <div className="dish-card-content">
                    <h3 className="dish-card-title">{product.name}</h3>
                    {product.description && <p className="dish-card-desc">{product.description}</p>}

                    <div className="dish-card-category">
                      {CatIcon && <CatIcon style={{ color: catColor }} />}
                      <span>{categoryLabel || 'Без категории'}</span>
                    </div>

                    <div className="dish-card-bottom">
                      <div className="dish-card-bottom-left">
                        <span className="dish-card-price">{product.price} ₽</span>
                        <span className={`dish-card-badge ${product.isAvailable ? 'active' : 'inactive'}`}>
                          {product.isAvailable ? 'Активно' : 'Неактивно'}
                        </span>
                      </div>
                      <div className="dish-card-bottom-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          className="dish-card-action-btn dish-card-edit-btn"
                          aria-label="Редактировать"
                          onClick={() => setProductModal({ open: true, product })}
                        >
                          <FiEdit2 />
                        </button>
                        <div className="dish-card-menu-wrap">
                          <button
                            type="button"
                            className="dish-card-action-btn"
                            aria-label="Меню"
                            onClick={() => setOpenCardMenu(menuOpen ? null : product._id)}
                          >
                            <FiMoreHorizontal />
                          </button>
                          {menuOpen && (
                            <div className="dish-card-dropdown">
                              <button
                                type="button"
                                onClick={() => {
                                  handleViewProduct(product)
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiEye /> Просмотреть
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setProductModal({ open: true, product })
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiEdit2 /> Редактировать
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDuplicateProduct(product)
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiCopy /> Дублировать
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleToggleAvailability(product)
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiEyeOff /> {product.isAvailable ? 'Скрыть из меню' : 'Показать в меню'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleToggleFeatured(product)
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiStar /> {product.isFeatured ? 'Убрать из рекомендуемых' : 'Сделать рекомендуемым'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleShowStats(product)
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiBarChart2 /> Статистика
                              </button>
                              <div className="dish-card-dropdown-divider" />
                              <button
                                type="button"
                                className="danger"
                                onClick={() => {
                                  setConfirmDelete({ open: true, type: 'product', item: product })
                                  setOpenCardMenu(null)
                                }}
                              >
                                <FiTrash2 /> Удалить
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="dish-pagination">
            <button
              type="button"
              className="dish-page-btn"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Предыдущая страница"
            >
              <FiChevronLeft />
            </button>
            {getPageNumbers(safePage, totalPages).map((p, i) => (
              p === '...' ? (
                <span key={`dots-${i}`} className="dish-page-dots">…</span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`dish-page-btn ${p === safePage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(p)}
                >
                  {p}
                </button>
              )
            ))}
            <button
              type="button"
              className="dish-page-btn"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Следующая страница"
            >
              <FiChevronRight />
            </button>
          </div>

          <p className="dish-pagination-caption">
            Показано {rangeStart}–{rangeEnd} из {filteredProducts.length}
          </p>
        </>
      )}

      <CategoryModal
        isOpen={categoryModal.open}
        category={categoryModal.category}
        onClose={() => setCategoryModal({ open: false, category: null })}
        onSubmit={handleCategorySubmit}
      />

      <ProductModal
        isOpen={productModal.open}
        product={productModal.product}
        categories={categories}
        onClose={() => setProductModal({ open: false, product: null })}
        onSubmit={handleProductSubmit}
      />

      <ProductPreviewModal
        isOpen={previewModal.open}
        product={previewProduct}
        imageUrl={previewImageUrl}
        categoryLabel={previewCategoryLabel}
        CategoryIcon={PreviewCategoryIcon}
        onClose={() => setPreviewModal({ open: false, product: null })}
        onEdit={(product) => {
          setPreviewModal({ open: false, product: null })
          setProductModal({ open: true, product })
        }}
      />

      <ConfirmDialog
        isOpen={confirmDelete.open}
        isLoading={false}
        title={confirmDelete.type === 'category' ? 'Удалить категорию?' : 'Удалить блюдо?'}
        message={
          confirmDelete.type === 'category'
            ? `Категория «${confirmDelete.item?.name}» будет удалена.`
            : `Блюдо «${confirmDelete.item?.name}» будет удалено.`
        }
        onClose={() => setConfirmDelete({ open: false, type: null, item: null })}
        onConfirm={handleConfirmDelete}
      />
    </div>
  )
}
