import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FiX } from 'react-icons/fi'
import {
  GiHamburger,
  GiNoodles,
  GiCupcake,
  GiCoffeeCup,
  GiFruitBowl,
  GiChiliPepper,
  GiKnifeFork,
  GiCheeseWedge,
  GiPizzaSlice,
  GiSushis,
  GiSausage,
  GiSteak,
  GiWineGlass,
  GiCakeSlice,
  GiIceCreamCone,
  GiChocolateBar,
  GiFriedFish,
  GiBowlOfRice,
  GiTacos,
  GiDonut,
  GiBreadSlice,
  GiCookie,
  GiMeal,
} from 'react-icons/gi'

export const ICONS = [
  { key: 'hamburger', Icon: GiHamburger },
  { key: 'pizza', Icon: GiPizzaSlice },
  { key: 'noodles', Icon: GiNoodles },
  { key: 'sushi', Icon: GiSushis },
  { key: 'sausage', Icon: GiSausage },
  { key: 'steak', Icon: GiSteak },
  { key: 'fried-fish', Icon: GiFriedFish },
  { key: 'tacos', Icon: GiTacos },
  { key: 'rice', Icon: GiBowlOfRice },
  { key: 'bread', Icon: GiBreadSlice },
  { key: 'cheese', Icon: GiCheeseWedge },
  { key: 'fruit', Icon: GiFruitBowl },
  { key: 'chili', Icon: GiChiliPepper },
  { key: 'knife-fork', Icon: GiKnifeFork },
  { key: 'meal', Icon: GiMeal },
  { key: 'cupcake', Icon: GiCupcake },
  { key: 'cake', Icon: GiCakeSlice },
  { key: 'ice-cream', Icon: GiIceCreamCone },
  { key: 'donut', Icon: GiDonut },
  { key: 'cookie', Icon: GiCookie },
  { key: 'chocolate', Icon: GiChocolateBar },
  { key: 'coffee', Icon: GiCoffeeCup },
  { key: 'wine', Icon: GiWineGlass },
]

const COLORS = ['#7A1F2B', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280']

const schema = z.object({
  name: z.string().min(2, 'Название минимум 2 символа').max(50, 'Максимум 50 символов'),
  description: z.string().max(150, 'Максимум 150 символов').optional(),
  icon: z.string(),
  color: z.string(),
})

export default function CategoryModal({ isOpen, onClose, onSubmit, category }) {
  const isEdit = Boolean(category)
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', icon: ICONS[0].key, color: COLORS[0] },
  })

  const name = watch('name') ?? ''
  const description = watch('description') ?? ''
  const icon = watch('icon')
  const color = watch('color')

  useEffect(() => {
    if (isOpen) {
      reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        icon: category?.icon ?? ICONS[0].key,
        color: category?.color ?? COLORS[0],
      })
    }
  }, [isOpen, category, reset])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const submit = async (values) => {
    await onSubmit(values)
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="category-modal-overlay" onClick={handleOverlayClick}>
      <div className="category-modal">
        <div className="category-modal-header">
          <h2 className="category-modal-title">{isEdit ? 'Редактирование категории' : 'Добавление категории'}</h2>
          <button type="button" className="category-modal-close" onClick={onClose} aria-label="Закрыть">
            <FiX />
          </button>
        </div>

        <p className="category-modal-subtitle">Заполните информацию для создания новой категории блюд</p>

        <form className="category-modal-form" onSubmit={handleSubmit(submit)}>
          <div className="category-modal-field">
            <div className="category-modal-label-row">
              <label className="category-modal-label" htmlFor="category-name">Название категории *</label>
              <span className="category-modal-counter">{name.length} / 50</span>
            </div>
            <input
              id="category-name"
              type="text"
              placeholder="Введите название категории"
              maxLength={50}
              {...register('name')}
            />
            {errors.name && <span className="field-error">{errors.name.message}</span>}
          </div>

          <div className="category-modal-field">
            <label className="category-modal-label" htmlFor="category-description">Описание (необязательно)</label>
            <textarea
              id="category-description"
              placeholder="Краткое описание категории"
              maxLength={150}
              {...register('description')}
            />
            <span className="category-modal-counter category-modal-counter-textarea">{description.length} / 150</span>
          </div>

          <div className="category-modal-field">
            <label className="category-modal-label">Иконка категории</label>
            <p className="category-modal-hint">Выберите иконку, которая будет отображаться</p>
            <div className="category-modal-icon-grid">
              {ICONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  className={`category-modal-icon-btn ${icon === key ? 'active' : ''}`}
                  onClick={() => setValue('icon', key)}
                  aria-label={key}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          <div className="category-modal-field">
            <label className="category-modal-label">Цвет категории</label>
            <div className="category-modal-color-row">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`category-modal-color-dot ${color === c ? 'active' : ''}`}
                  style={{ background: c }}
                  onClick={() => setValue('color', c)}
                  aria-label={c}
                />
              ))}
            </div>
          </div>

          <div className="category-modal-footer">
            <button type="button" className="category-modal-cancel-btn" onClick={onClose}>
              Отмена
            </button>
            <button type="submit" className="category-modal-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : isEdit ? 'Сохранить' : 'Создать категорию'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
