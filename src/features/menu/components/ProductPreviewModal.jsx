import { useEffect } from 'react'
import { X, Sparkles, Flame, Star, Leaf, Pencil, CheckCircle2, XCircle } from 'lucide-react'
import { formatSom } from '../../../lib/api'

const TAG_CONFIG = {
  spicy: { label: 'Achchiq', icon: Flame, color: 'text-rose-500 bg-rose-50 border-rose-200 dark:bg-rose-950/40' },
  hot: { label: 'Xit', icon: Sparkles, color: 'text-amber-500 bg-amber-50 border-amber-200 dark:bg-amber-950/40' },
  new: { label: 'Yangi', icon: Star, color: 'text-blue-500 bg-blue-50 border-blue-200 dark:bg-blue-950/40' },
  vegetarian: { label: 'Vegetarian', icon: Leaf, color: 'text-emerald-500 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40' },
}

export default function ProductPreviewModal({ isOpen, onClose, onEdit, product, imageUrl, categoryLabel, CategoryIcon, canManage }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !product) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#111827] transition-all">
        {/* Image / Header */}
        <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400">
              <span className="text-sm font-bold">Rasm yo'q</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/70 transition"
          >
            <X size={16} />
          </button>

          <div className="absolute left-3 bottom-3 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold backdrop-blur-md ${
                product.isAvailable
                  ? 'bg-emerald-500/90 text-white'
                  : 'bg-rose-500/90 text-white'
              }`}
            >
              {product.isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
              <span>{product.isAvailable ? 'Mavjud' : 'Tugagan'}</span>
            </span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{product.name}</h2>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                {CategoryIcon && <CategoryIcon size={14} />}
                <span>{categoryLabel || 'Kategoriyasiz'}</span>
                {product.weight && <span>· {product.weight}</span>}
              </div>
            </div>

            <span className="shrink-0 text-lg font-black text-[#F97316]">
              {formatSom(product.price)}
            </span>
          </div>

          {product.description && (
            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {product.description}
            </p>
          )}

          {product.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {product.tags.map((key) => {
                const conf = TAG_CONFIG[key]
                if (!conf) return null
                const Icon = conf.icon
                return (
                  <span
                    key={key}
                    className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs font-bold ${conf.color}`}
                  >
                    <Icon size={12} />
                    <span>{conf.label}</span>
                  </span>
                )
              })}
            </div>
          )}

          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            {canManage && (
              <button
                type="button"
                onClick={() => onEdit(product)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              >
                <Pencil size={14} />
                <span>Tahrirlash</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
