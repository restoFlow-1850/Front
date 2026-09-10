// Mijozlar uchun fikr-mulohaza va reyting qoldirish modali (Professional UI)
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, HeartHandshake, MessageSquareHeart, Star, X } from 'lucide-react'
import { toast } from 'react-toastify'

import { createFeedback } from '../api'
import { Button, Input } from '../../../components/ui'
import { playNotificationSound } from '../../../utils/sound'
import { socket } from '../../../services/socket'

const CATEGORY_TAGS = [
  "Taom ta'mi",
  "Xizmat ko'rsatish",
  "Kassa va to'lov",
  "Tozalik",
  "Atmosfera",
  "Xizmat tezligi",
]

const RATING_LABELS = {
  1: "Juda yomon",
  2: "Qoniqarsiz",
  3: "O'rtacha",
  4: "Yaxshi",
  5: "A'lo darajada",
}

export default function FeedbackModal({ isOpen, onClose, defaultTable = '' }) {
  const queryClient = useQueryClient()

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [category, setCategory] = useState("Taom ta'mi")
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [tableNumber, setTableNumber] = useState(defaultTable)
  const [comment, setComment] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const mutation = useMutation({
    mutationFn: () =>
      createFeedback({
        rating,
        category,
        customerName: customerName.trim() || 'Mehmon',
        customerPhone: customerPhone.trim() || '—',
        tableNumber: tableNumber.trim() || '—',
        comment: comment.trim(),
      }),
    onSuccess: (newFeedback) => {
      playNotificationSound()
      setIsSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
      socket.emit('feedback:new', newFeedback)
    },
    onError: () => toast.error("Fikr saqlashda xatolik yuz berdi"),
  })

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!comment.trim()) {
      toast.warn("Iltimos, fikringizni yozib qoldiring")
      return
    }
    mutation.mutate()
  }

  const handleReset = () => {
    setIsSuccess(false)
    setRating(5)
    setComment('')
    onClose()
  }

  const activeRating = hoverRating || rating

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 dark:border dark:border-slate-800">
        <button
          type="button"
          onClick={handleReset}
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="my-8 text-center space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Tashakkur!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
              Sizning fikr-mulohazangiz qabul qilindi. RestoFlow jamoasi xizmat sifatini oshirish ustida ishlaydi.
            </p>
            <div className="pt-2">
              <Button onClick={handleReset} className="w-full sm:w-auto px-8">
                Yopish
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-[#F97316]">
                <MessageSquareHeart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Fikr-mulohaza qoldirish
                </h3>
                <p className="text-xs text-slate-500">
                  Xizmat va taomlar haqidagi taassurotingizni yozib qoldiring
                </p>
              </div>
            </div>

            {/* 1-5 Yulduzli Reyting */}
            <div className="text-center space-y-2 bg-slate-50 p-4 rounded-2xl dark:bg-slate-800/50">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Xizmat ko'rsatish bahosi
              </span>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform transform hover:scale-125 focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        star <= activeRating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm font-bold text-orange-600 dark:text-orange-400 min-h-[20px]">
                {RATING_LABELS[activeRating]}
              </p>
            </div>

            {/* Kategoriya teglari */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
                Yo'nalish bo'yicha ajratish
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORY_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCategory(tag)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition ${
                      category === tag
                        ? 'bg-[#F97316] text-white shadow-sm font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Qo'shimcha ma'lumotlar */}
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="Ism"
                placeholder="Ismingiz"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
              <Input
                label="Telefon"
                placeholder="Raqamingiz"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
              <Input
                label="Stol №"
                placeholder="Stol"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>

            {/* Izoh matni */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Izohingiz <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                placeholder="Fikr va takliflaringizni yozib qoldiring..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 p-3 text-sm text-slate-900 focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-bold bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-orange-500/25"
              isLoading={mutation.isPending}
            >
              <HeartHandshake className="mr-2 h-4 w-4" /> Yuborish
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
