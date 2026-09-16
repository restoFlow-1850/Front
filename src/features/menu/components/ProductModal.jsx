import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Image as ImageIcon, Sparkles, Flame, Star, Leaf } from 'lucide-react'
import { resolveImageUrl } from '../api'

const TAGS = [
  { key: 'spicy', label: 'Achchiq', icon: Flame, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200' },
  { key: 'hot', label: 'Xit', icon: Sparkles, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200' },
  { key: 'new', label: 'Yangi', icon: Star, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200' },
  { key: 'vegetarian', label: 'Vegetarian', icon: Leaf, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200' },
]

const schema = z.object({
  name: z.string().min(2, "Taom nomi kamida 2 ta belgi bo'lishi kerak"),
  description: z.string().max(300, 'Maksimal 300 belgi').optional(),
  price: z.coerce.number({ invalid_type_error: 'Narxni kiriting' }).positive("Narx 0 dan katta bo'lishi kerak"),
  category: z.string().min(1, 'Kategoriyani tanlang'),
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

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      category: '',
      weight: '',
      isAvailable: true,
      isFeatured: false,
    },
  })

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
      setPreview(product?.image ? resolveImageUrl(product.image) : null)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative my-8 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827] transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10 text-[#F97316]">
              <Sparkles size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Taomni tahrirlash' : 'Yangi taom qo‘shish'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="mt-4 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Taom nomi *
              </label>
              <input
                type="text"
                placeholder="Masalan: Tandir go'shti"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs font-medium text-rose-500">{errors.name.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Kategoriya *
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register('category')}
              >
                <option value="">Kategoriyani tanlang...</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <p className="mt-1 text-xs font-medium text-rose-500">{errors.category.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Narxi (so'm) *
              </label>
              <input
                type="number"
                step="100"
                placeholder="Masalan: 45000"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register('price')}
              />
              {errors.price && <p className="mt-1 text-xs font-medium text-rose-500">{errors.price.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Og'irligi / Porsiya
              </label>
              <input
                type="text"
                placeholder="Masalan: 300 gr"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                {...register('weight')}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Tarkibi / Tavsif
            </label>
            <textarea
              rows={2}
              placeholder="Taom tarkibi va tayyorlanishi haqida..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register('description')}
            />
          </div>

          {/* Image upload */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Rasm yuklash
            </label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex h-24 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/80 hover:border-orange-400 dark:border-slate-700 dark:bg-slate-900/50"
              >
                {preview ? (
                  <img src={preview} alt="Taom" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-slate-400">
                    <ImageIcon size={20} />
                    <span className="text-[10px] font-bold">Rasm tanlang</span>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
              </div>

              {preview && (
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-400"
                >
                  Rasmni o'chirish
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Teglar / Xususiyatlar
            </label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(({ key, label, icon: Icon, color: tagColor }) => {
                const active = tags.includes(key)
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleTag(key)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
                      active
                        ? 'bg-[#F97316] text-white border-orange-500 shadow-sm'
                        : `border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300`
                    }`}
                  >
                    <Icon size={14} className={active ? 'text-white' : ''} />
                    <span>{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Availability */}
          <div className="flex flex-wrap gap-6 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-[#F97316] accent-[#F97316]"
                {...register('isAvailable')}
              />
              <span>Menyuda mavjud (Faol)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded text-[#F97316] accent-[#F97316]"
                {...register('isFeatured')}
              />
              <span>Tavsiya etilgan (Xit)</span>
            </label>
          </div>

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:from-[#EA580C] hover:to-[#C2410C] disabled:opacity-50"
            >
              {isSubmitting ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Taom qo‘shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
