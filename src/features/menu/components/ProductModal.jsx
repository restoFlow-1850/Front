import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiImage, FiX, FiChevronDown, FiStar } from 'react-icons/fi'
import { GiChiliPepper, GiLeafSwirl, GiSprout, GiFlame } from 'react-icons/gi'
import { resolveImageUrl } from '../api'

const TAGS = [
  { key: 'spicy', label: 'Острое', Icon: GiChiliPepper },
  { key: 'vegetarian', label: 'Вегетарианское', Icon: GiLeafSwirl },
  { key: 'vegan', label: 'Веганское', Icon: GiSprout },
  { key: 'new', label: 'Новинка', Icon: FiStar },
  { key: 'hot', label: 'Хит', Icon: GiFlame },
]

const schema = z.object({
  name: z.string().min(2, 'Название минимум 2 символа'),
  description: z.string().max(300, 'Максимум 300 символов').optional(),
  price: z.coerce.number({ invalid_type_error: 'Укажите цену' }).positive('Цена должна быть больше 0'),
  category: z.string().min(1, 'Выберите категорию'),
  weight: z.string().optional(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export default function ProductModal({ isOpen, onClose, onSubmit, product, categories }) {
  const isEdit = Boolean(product)
  const fileInputRef = useRef(null)
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [tags, setTags] = useState([])

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', description: '', price: '', category: '', weight: '', isAvailable: true, isFeatured: false,
    },
  })

  const description = watch('description') ?? ''

  useEffect(() => {
    if (isOpen) {
      reset({
        name: product?.name ?? '',
        description: product?.description ?? '',
        price: product?.price ?? '',
        category: product?.category?._id ?? product?.category ?? '',
        weight: product?.weight ?? '',
        isAvailable: product?.isAvailable ?? true,
        isFeatured: product?.isFeatured ?? false,
      })
      setFile(null)
      setPreview(product?._localImage ? product.image : resolveImageUrl(product?.image) ?? null)
      setTags(product?.tags ?? [])
    }
  }, [isOpen, product, reset])

  if (!isOpen) return null

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (!selected) return
    setFile(selected)
    setPreview(URL.createObjectURL(selected))
  }

  const toggleTag = (key) => {
    setTags((prev) => (prev.includes(key) ? prev.filter((t) => t !== key) : [...prev, key]))
  }

  const submit = async (values) => {
    const formData = new FormData()
    formData.append('name', values.name)
    formData.append('description', values.description ?? '')
    formData.append('price', values.price)
    formData.append('category', values.category)
    formData.append('weight', values.weight ?? '')
    formData.append('isAvailable', values.isAvailable ? 'true' : 'false')
    formData.append('isFeatured', values.isFeatured ? 'true' : 'false')
    formData.append('tags', JSON.stringify(tags))
    if (file) formData.append('image', file)
    await onSubmit(formData)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="product-modal-overlay" onClick={handleOverlayClick}>
      <div className="product-modal">
        <div className="product-modal-header">
          <h2 className="product-modal-title">{isEdit ? 'Редактирование блюда' : 'Добавление блюда'}</h2>
          <button type="button" className="product-modal-close" onClick={onClose} aria-label="Закрыть">
            <FiX />
          </button>
        </div>

        <form className="product-modal-form" onSubmit={handleSubmit(submit)}>
          <div className="product-modal-section">
            <h3 className="product-modal-section-title">Основная информация</h3>

            <div className="product-modal-grid">
              <div className="product-modal-field">
                <label>Название блюда *</label>
                <input type="text" placeholder="Введите название блюда" {...register('name')} />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </div>

              <div className="product-modal-field">
                <label>Категория *</label>
                <div className="product-modal-select-wrap">
                  <select {...register('category')}>
                    <option value="">Выберите...</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="product-modal-select-icon" />
                </div>
                {errors.category && <span className="field-error">{errors.category.message}</span>}
              </div>

              <div className="product-modal-field">
                <label>Цена *</label>
                <input type="number" step="0.01" placeholder="₽ 0" {...register('price')} />
                {errors.price && <span className="field-error">{errors.price.message}</span>}
              </div>

              <div className="product-modal-field">
                <label>Вес / порция</label>
                <input type="text" placeholder="Например: 250 г" {...register('weight')} />
              </div>
            </div>
          </div>

          <div className="product-modal-section">
            <h3 className="product-modal-section-title">Описание</h3>
            <div className="product-modal-field">
              <textarea
                placeholder="Опишите состав, способ приготовления или особенности блюда..."
                maxLength={300}
                {...register('description')}
              />
              <span className="product-modal-counter">{description.length} / 300</span>
            </div>
          </div>

          <div className="product-modal-section">
            <h3 className="product-modal-section-title">Фото блюда</h3>
            <div className="product-modal-photos">
              <div className="product-modal-photo-main" onClick={() => fileInputRef.current?.click()}>
                {preview ? (
                  <img src={preview} alt="Превью блюда" />
                ) : (
                  <div className="product-modal-photo-placeholder">
                    <FiImage />
                    <span>Фото</span>
                    <em>до 5 MB</em>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
                {preview && (
                  <button
                    type="button"
                    className="product-photo-remove"
                    onClick={(e) => {
                      e.stopPropagation()
                      setFile(null)
                      setPreview(null)
                      if (fileInputRef.current) fileInputRef.current.value = ''
                    }}
                  >
                    <FiX />
                  </button>
                )}
              </div>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="product-modal-photo-slot" />
              ))}
            </div>
            <p className="product-modal-hint">Рекомендуемый размер: 800x600px</p>
          </div>

          <div className="product-modal-section">
            <h3 className="product-modal-section-title">Параметры блюда</h3>
            <div className="product-modal-chips">
              {TAGS.map(({ key, label, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`product-modal-chip ${tags.includes(key) ? 'active' : ''}`}
                  onClick={() => toggleTag(key)}
                >
                  <Icon /> {label}
                </button>
              ))}
            </div>
          </div>

          <div className="product-modal-section">
            <h3 className="product-modal-section-title">Дополнительно</h3>
            <div className="product-modal-checkboxes">
              <label className="product-modal-checkbox">
                <input type="checkbox" {...register('isAvailable')} />
                <span>
                  Отображать в меню
                  <em>Блюдо будет доступно для заказа</em>
                </span>
              </label>
              <label className="product-modal-checkbox">
                <input type="checkbox" {...register('isFeatured')} />
                <span>
                  Рекомендуемое блюдо
                  <em>Отображать в рекомендациях</em>
                </span>
              </label>
            </div>
          </div>

          <div className="product-modal-footer">
            <button type="button" className="product-modal-cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="product-modal-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать блюдо'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
