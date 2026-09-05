import { useEffect } from 'react'
import { FiX } from 'react-icons/fi'

const TAG_LABELS = {
  spicy: 'Острое',
  vegetarian: 'Вегетарианское',
  vegan: 'Веганское',
  new: 'Новинка',
  hot: 'Хит',
}

export default function ProductPreviewModal({ isOpen, onClose, onEdit, product, imageUrl, categoryLabel, CategoryIcon }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div className="preview-modal-overlay" onClick={handleOverlayClick}>
      <div className="preview-modal">
        <div className="preview-modal-image">
          <img src={imageUrl} alt={product.name} />
          <button type="button" className="preview-modal-close" onClick={onClose} aria-label="Закрыть">
            <FiX />
          </button>
          <span className={`preview-modal-badge ${product.isAvailable ? 'active' : 'inactive'}`}>
            {product.isAvailable ? 'Активно' : 'Неактивно'}
          </span>
        </div>

        <div className="preview-modal-content">
          <h2 className="preview-modal-title">{product.name}</h2>

          <div className="preview-modal-category">
            {CategoryIcon && <CategoryIcon />}
            <span>{categoryLabel || 'Без категории'}</span>
          </div>

          {product.description && <p className="preview-modal-desc">{product.description}</p>}

          <div className="preview-modal-specs">
            <span className="preview-modal-spec">{product.price} ₽</span>
            {product.weight && <span className="preview-modal-spec">{product.weight} г</span>}
          </div>

          {product.tags?.length > 0 && (
            <div className="preview-modal-chips">
              {product.tags.map((key) => (
                <span key={key} className="preview-modal-chip">
                  {TAG_LABELS[key] ?? key}
                </span>
              ))}
            </div>
          )}

          <div className="preview-modal-actions">
            <button type="button" className="preview-modal-edit-btn" onClick={() => onEdit(product)}>
              Редактировать
            </button>
            <button type="button" className="preview-modal-close-btn" onClick={onClose}>
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
