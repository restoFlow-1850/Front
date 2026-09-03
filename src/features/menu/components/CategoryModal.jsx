import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Sparkles } from 'lucide-react'
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
  GiCookie,
  GiMeal,
} from 'react-icons/gi'

export const ICONS = [
  { key: 'hamburger', Icon: GiHamburger },
  { key: 'steak', Icon: GiSteak },
  { key: 'meal', Icon: GiMeal },
  { key: 'noodles', Icon: GiNoodles },
  { key: 'pizza', Icon: GiPizzaSlice },
  { key: 'sushi', Icon: GiSushis },
  { key: 'sausage', Icon: GiSausage },
  { key: 'fried-fish', Icon: GiFriedFish },
  { key: 'tacos', Icon: GiTacos },
  { key: 'rice', Icon: GiBowlOfRice },
  { key: 'cheese', Icon: GiCheeseWedge },
  { key: 'fruit', Icon: GiFruitBowl },
  { key: 'chili', Icon: GiChiliPepper },
  { key: 'knife-fork', Icon: GiKnifeFork },
  { key: 'cupcake', Icon: GiCupcake },
  { key: 'cake', Icon: GiCakeSlice },
  { key: 'ice-cream', Icon: GiIceCreamCone },
  { key: 'donut', Icon: GiDonut },
  { key: 'cookie', Icon: GiCookie },
  { key: 'chocolate', Icon: GiChocolateBar },
  { key: 'coffee', Icon: GiCoffeeCup },
  { key: 'wine', Icon: GiWineGlass },
]

const COLORS = ['#F97316', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#64748B']

const schema = z.object({
  name: z.string().min(2, "Nom kamida 2 ta belgi bo'lishi kerak").max(50, 'Maksimal 50 belgi'),
  description: z.string().max(150, 'Maksimal 150 belgi').optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
})

export default function CategoryModal({ isOpen, onClose, onSubmit, category }) {
  const isEdit = Boolean(category)
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', icon: ICONS[0].key, color: COLORS[0] },
  })

  const icon = watch('icon') || ICONS[0].key
  const color = watch('color') || COLORS[0]

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-[#111827] transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-orange-500/10 text-[#F97316]">
              <Sparkles size={16} />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEdit ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya qo‘shish'}
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Kategoriya nomi *
            </label>
            <input
              type="text"
              placeholder="Masalan: Issiq taomlar"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs font-medium text-rose-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Tavsif (ixtiyoriy)
            </label>
            <textarea
              rows={2}
              placeholder="Kategoriya haqida qisqacha ma'lumot..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none transition focus:border-[#F97316] focus:bg-white focus:ring-4 focus:ring-orange-500/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              {...register('description')}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Belgi (Icon)
            </label>
            <div className="grid grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-2xl border border-slate-200/80 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900/50">
              {ICONS.map(({ key, Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setValue('icon', key)}
                  className={`flex size-9 items-center justify-center rounded-xl transition text-base ${
                    icon === key
                      ? 'bg-[#F97316] text-white shadow-md shadow-orange-500/25 scale-105'
                      : 'text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Rang
            </label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setValue('color', c)}
                  style={{ backgroundColor: c }}
                  className={`size-7 rounded-full transition-transform ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-offset-[#111827] scale-110' : 'hover:scale-105 opacity-85'
                  }`}
                />
              ))}
            </div>
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
              {isSubmitting ? 'Saqlanmoqda...' : isEdit ? 'Saqlash' : 'Kategoriya qo‘shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
