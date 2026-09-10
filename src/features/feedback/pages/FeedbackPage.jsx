// Adminka — Mijozlar fikrlari va reytinglarini boshqarish paneli
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Download,
  Filter,
  MessageCircle,
  MessageSquareHeart,
  RefreshCw,
  Search,
  Send,
  Star,
  ThumbsUp,
  Trash2,
  UserCheck,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { deleteFeedback, getFeedbacks, getFeedbackStats, updateFeedbackStatus } from '../api'
import { exportToExcel, exportToPDF } from '../../../utils/exportUtils'
import { apiErrorMessage, formatTime } from '../../../lib/api'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
  StatCard,
} from '../../../components/ui'
import { socket } from '../../../services/socket'
import { playNotificationSound } from '../../../utils/sound'

export default function FeedbackPage() {
  const queryClient = useQueryClient()

  const [ratingFilter, setRatingFilter] = useState('all') // 'all' | '5' | '4' | '3' | '2' | '1'
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'new' | 'reviewed'
  const [searchQuery, setSearchQuery] = useState('')
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')

  // 🔔 Real-time socket eventlar obunasi (yangi fikr tushganda avtomatik yangilash)
  useEffect(() => {
    const handleNewFeedback = () => {
      playNotificationSound()
      toast.info("Yangi mijoz fikri qabul qilindi")
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
    }

    socket.on('feedback:new', handleNewFeedback)
    return () => {
      socket.off('feedback:new', handleNewFeedback)
    }
  }, [queryClient])

  // Fikrlar va Statistika querylari
  const feedbacksQuery = useQuery({
    queryKey: ['feedbacks', ratingFilter, statusFilter, searchQuery],
    queryFn: () =>
      getFeedbacks({
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery || undefined,
      }),
  })

  const statsQuery = useQuery({
    queryKey: ['feedback-stats'],
    queryFn: () => getFeedbackStats(),
  })

  // Statusni yangilash mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status, adminReply }) => updateFeedbackStatus(id, { status, adminReply }),
    onSuccess: () => {
      toast.success("Fikr holati yangilandi")
      setReplyingId(null)
      setReplyText('')
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, "Xatolik yuz berdi")),
  })

  // O'chirish mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteFeedback(id),
    onSuccess: () => {
      toast.info("Fikr o'chirildi")
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
      queryClient.invalidateQueries({ queryKey: ['feedback-stats'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, "O'chirishda xatolik yuz berdi")),
  })

  const feedbacks = useMemo(() => feedbacksQuery.data ?? [], [feedbacksQuery.data])
  const stats = statsQuery.data ?? {}

  // Excel eksport qilish
  const handleExportExcel = async () => {
    try {
      await exportToExcel({
        stats: {
          todayRevenue: 0,
          todayPaymentsCount: stats.total || 0,
          todayOrdersCount: stats.total || 0,
          activeOrdersCount: stats.newCount || 0,
          lowStockCount: stats.attentionCount || 0,
          totalProducts: stats.total || 0,
        },
        topProducts: feedbacks.map((f) => ({
          name: f.customerName,
          totalQuantity: f.rating,
          totalRevenue: f.comment,
        })),
        filename: 'RestoFlow_Mijozlar_Fikrlari.xlsx',
      })
      toast.success("Excel hisoboti yuklab olindi")
    } catch {
      toast.error("Eksport qilishda xatolik yuz berdi")
    }
  }

  // PDF eksport qilish
  const handleExportPDF = async () => {
    try {
      await exportToPDF({
        stats: {
          todayRevenue: 0,
          todayPaymentsCount: stats.total || 0,
          todayOrdersCount: stats.total || 0,
          activeOrdersCount: stats.newCount || 0,
          lowStockCount: stats.attentionCount || 0,
        },
        topProducts: feedbacks.map((f) => ({
          name: `${f.customerName} (${f.rating}★)`,
          totalQuantity: f.tableNumber !== '—' ? `Stol ${f.tableNumber}` : '—',
          totalRevenue: f.comment,
        })),
        filename: 'RestoFlow_Mijozlar_Fikrlari.pdf',
      })
      toast.success("PDF hisoboti yuklab olindi")
    } catch {
      toast.error("Eksport qilishda xatolik yuz berdi")
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mijozlar Fikrlari & Reytingi"
        subtitle="Mijozlarning taassurotlari, reytinglari va fikr-mulohazalarini tahlil qilish"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={handleExportExcel}>
              <Download className="mr-2 h-4 w-4 text-emerald-600" /> Excel
            </Button>
            <Button variant="secondary" onClick={handleExportPDF}>
              <Download className="mr-2 h-4 w-4 text-[#F97316]" /> PDF
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                feedbacksQuery.refetch()
                statsQuery.refetch()
              }}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${feedbacksQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Yangilash
            </Button>
          </div>
        }
      />

      {/* 📊 Statistika Kartalari */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={Star}
              tone="amber"
              label="O'rtacha reyting"
              value={`${stats.avgRating ?? 5.0} / 5.0`}
              hint={`Jami ${stats.total ?? 0} ta fikr asosida`}
            />
            <StatCard
              icon={ThumbsUp}
              tone="emerald"
              label="Ijobiy fikrlar"
              value={`${stats.positivePercent ?? 100}%`}
              hint="4 va 5 yulduzli baholar"
            />
            <StatCard
              icon={MessageSquareHeart}
              tone="indigo"
              label="Yangi fikrlar"
              value={stats.newCount ?? 0}
              hint="Ko'rib chiqilishi kutilmoqda"
            />
            <StatCard
              icon={AlertTriangle}
              tone="rose"
              label="E'tibor talab (1-2★)"
              value={stats.attentionCount ?? 0}
              hint="Salbiy taassurotlar soni"
            />
          </>
        )}
      </div>

      {/* 🔍 Qidiruv va Filtr Bar */}
      <Card className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Mijoz ismi, izoh yoki stol bo'yicha qidiruv..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-[#F97316] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-2">
              <Filter className="h-3.5 w-3.5" /> Filtr:
            </div>

            {/* Reyting bo'yicha filtr */}
            {[
              { id: 'all', label: 'Barcha reyting' },
              { id: '5', label: '5 ★' },
              { id: '4', label: '4 ★' },
              { id: '3', label: '3 ★' },
              { id: '2', label: '2 ★' },
              { id: '1', label: '1 ★' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRatingFilter(item.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                  ratingFilter === item.id
                    ? 'bg-[#F97316] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}

            {/* Holat bo'yicha filtr */}
            <div className="ml-2 flex items-center gap-1 border-l border-slate-200 pl-2 dark:border-slate-700">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'new', label: 'Yangi' },
                { id: 'reviewed', label: "Ko'rib chiqilgan" },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStatusFilter(item.id)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                    statusFilter === item.id
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 💬 Fikrlar Ro'yxati */}
      <div className="space-y-4">
        {feedbacksQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)
        ) : feedbacks.length === 0 ? (
          <Card>
            <EmptyState
              icon={MessageSquareHeart}
              title="Fikrlar topilmadi"
              description="Ushbu mezonlar bo'yicha hech qanday mijoz fikri topilmadi."
            />
          </Card>
        ) : (
          feedbacks.map((item) => (
            <Card
              key={item._id}
              className={`transition border-l-4 ${
                item.rating >= 4
                  ? 'border-l-emerald-500'
                  : item.rating === 3
                  ? 'border-l-amber-500'
                  : 'border-l-rose-500'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-lg font-bold text-white shadow-md">
                    {item.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {item.customerName}
                      </h3>
                      {item.tableNumber !== '—' && (
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          Stol № {item.tableNumber}
                        </span>
                      )}
                      <Badge
                        variant={
                          item.status === 'new'
                            ? 'warning'
                            : item.status === 'replied'
                            ? 'indigo'
                            : 'success'
                        }
                      >
                        {item.status === 'new'
                          ? 'Yangi'
                          : item.status === 'replied'
                          ? 'Javob berilgan'
                          : "Ko'rib chiqilgan"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.customerPhone} · {formatTime(item.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Yulduzchalar va kategoriya */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    <span>{item.rating}.0</span>
                  </div>
                </div>
              </div>

              {/* Fikr matni */}
              <div className="mt-3 rounded-2xl bg-slate-50 p-3.5 text-sm text-slate-800 dark:bg-slate-800/60 dark:text-slate-200">
                "{item.comment}"
              </div>

              {/* Admin Javobi bo'lsa */}
              {item.adminReply && (
                <div className="mt-3 ml-4 rounded-xl border-l-2 border-[#F97316] bg-orange-50/60 p-3 text-xs text-slate-700 dark:bg-orange-950/30 dark:text-slate-300">
                  <strong className="block text-[#F97316] mb-0.5">Admin javobi:</strong>
                  {item.adminReply}
                </div>
              )}

              {/* Boshqaruv tugmalari */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {item.status === 'new' && (
                    <Button
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() =>
                        updateStatusMutation.mutate({ id: item._id, status: 'reviewed' })
                      }
                    >
                      <UserCheck className="mr-1.5 h-3.5 w-3.5 text-emerald-600" />
                      Ko'rib chiqildi deb belgilash
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    className="h-8 text-xs"
                    onClick={() => {
                      setReplyingId(replyingId === item._id ? null : item._id)
                      setReplyText(item.adminReply || '')
                    }}
                  >
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5 text-indigo-500" />
                    {item.adminReply ? "Javobni tahrirlash" : "Javob yozish"}
                  </Button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(item._id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 transition"
                  title="Fikrni o'chirish"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {/* Admin javob yozish formasi */}
              {replyingId === item._id && (
                <div className="mt-3 space-y-2 rounded-2xl bg-slate-100 p-3 dark:bg-slate-800/80">
                  <Input
                    placeholder="Mijozga javob yozing..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      className="h-8 text-xs"
                      onClick={() => setReplyingId(null)}
                    >
                      Bekor qilish
                    </Button>
                    <Button
                      className="h-8 text-xs bg-[#F97316] text-white"
                      isLoading={updateStatusMutation.isPending}
                      onClick={() =>
                        updateStatusMutation.mutate({
                          id: item._id,
                          status: 'replied',
                          adminReply: replyText,
                        })
                      }
                    >
                      <Send className="mr-1 h-3 w-3" /> Javobni yuborish
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
