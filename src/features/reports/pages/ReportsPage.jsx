import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Package,
  Receipt,
  RefreshCw,
  Send,
  TrendingUp,
} from 'lucide-react'
import { toast } from 'react-toastify'

import api from '../../../services/axios'
import { getDashboardStats } from '../../../services/dashboardService'
import { unwrap, apiErrorMessage, formatSom } from '../../../lib/api'
import { Button, Card, EmptyState, Input, PageHeader, Skeleton, StatCard } from '../../../components/ui'

const Chart = lazy(() => import('react-apexcharts'))

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('today') // today | week | month | custom
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [isSendingTelegram, setIsSendingTelegram] = useState(false)

  const statsQuery = useQuery({
    queryKey: ['reports', 'analytics', dateRange, customFrom, customTo],
    queryFn: async () => unwrap(await getDashboardStats(), 'report'),
    refetchInterval: 60_000,
  })

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products', customFrom, customTo],
    queryFn: async () => {
      const res = await api.get('/reports/top-products', {
        params: { from: customFrom || undefined, to: customTo || undefined, limit: 10 },
      })
      return res.data?.data?.products ?? []
    },
  })

  const stats = statsQuery.data ?? {}
  const topProducts = useMemo(
    () => topProductsQuery.data ?? stats.topProducts ?? [],
    [topProductsQuery.data, stats.topProducts],
  )

  const chartOptions = useMemo(
    () => ({
      chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
      colors: ['#6366f1'],
      plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%' } },
      dataLabels: { enabled: true, formatter: (v) => `${v} ta` },
      xaxis: {
        categories: topProducts.map((p) => p.name),
        labels: { style: { colors: '#94a3b8' } },
      },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => `${v} ta sotildi` } },
    }),
    [topProducts],
  )

  const chartSeries = useMemo(
    () => [{ name: 'Sotildi', data: topProducts.map((p) => p.totalQuantity) }],
    [topProducts],
  )

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true)
    try {
      await api.post('/reports/telegram-daily-report')
      toast.success('Hisobot Telegram botga muvaffaqiyatli yuborildi! 📲')
    } catch (err) {
      toast.error(apiErrorMessage(err, "Telegram'ga yuborishda xatolik yuz berdi"))
    } finally {
      setIsSendingTelegram(false)
    }
  }

  const isLoading = statsQuery.isLoading
  const avgCheck = stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analitika va Hisobotlar"
        subtitle="Restoranning umumiy moliyaviy va sotuv ko'rsatkichlari"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              isLoading={isSendingTelegram}
              onClick={handleSendTelegram}
            >
              <Send className="mr-2 h-4 w-4 text-sky-500" />
              Telegram Botga hisobot yuborish
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                statsQuery.refetch()
                topProductsQuery.refetch()
              }}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${statsQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Yangilash
            </Button>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Sana oralig'i:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Bugun' },
              { id: 'week', label: 'Shu hafta' },
              { id: 'month', label: 'Shu oy' },
              { id: 'custom', label: 'Tanlangan sana' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateRange(item.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateRange === item.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="w-40">
              <Input
                type="date"
                label="Boshlanishi"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-40">
              <Input
                type="date"
                label="Tugashi"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
          </div>
        )}
      </Card>

      {statsQuery.isError && (
        <Card className="border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
          <p className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {apiErrorMessage(statsQuery.error, "Analitika ma'lumotlarini yuklab bo'lmadi")}
          </p>
        </Card>
      )}

      {/* Primary Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              tone="emerald"
              label="Jami tushum"
              value={formatSom(stats.todayRevenue)}
              hint={`${stats.todayPaymentsCount ?? 0} ta to'lov yozuvi`}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label="O'rtacha chek"
              value={formatSom(avgCheck)}
              hint="To'lovlar summasidan"
            />
            <StatCard
              icon={TrendingUp}
              tone="sky"
              label="Jami buyurtmalar"
              value={stats.todayOrdersCount ?? 0}
              hint={`${stats.activeOrdersCount ?? 0} ta faol buyurtma`}
            />
            <StatCard
              icon={Package}
              tone="amber"
              label="Jami mahsulotlar"
              value={stats.totalProducts ?? 0}
              hint={`${stats.lowStockCount ?? 0} ta kam qolgan`}
            />
          </>
        )}
      </div>

      {/* Top Selling Products Chart */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          Eng ko'p sotilgan taomlar va ichimliklar (Top 10)
        </h2>

        {topProductsQuery.isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : topProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Sotuvlar topilmadi"
            description="Ushbu sana oralig'ida yopilgan buyurtmalar yo'q."
          />
        ) : (
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
          </Suspense>
        )}
      </Card>
    </div>
  )
}
