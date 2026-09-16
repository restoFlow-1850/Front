import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  Download,
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
  const { t } = useTranslation()
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
        categories: topProducts.map((p) => p.name || p.productName || '—'),
        labels: { style: { colors: '#94a3b8' } },
      },
      yaxis: { labels: { style: { colors: '#94a3b8' } } },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: { y: { formatter: (v) => `${v} ta` } },
    }),
    [topProducts],
  )

  const chartSeries = useMemo(
    () => [{ name: t('reports.sold', { defaultValue: 'Sotilgan miqdor' }), data: topProducts.map((p) => p.totalQuantity || p.quantity || 0) }],
    [topProducts, t],
  )

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true)
    try {
      await api.post('/reports/telegram-daily-report')
      toast.success(t('dashboard.telegramSent', { defaultValue: 'Hisobot Telegram botga yuborildi' }))
    } catch (err) {
      toast.error(apiErrorMessage(err, t('kitchen.loadFailed', { defaultValue: "Xatolik yuz berdi" })))
    } finally {
      setIsSendingTelegram(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Mahsulot nomi', 'Sotilgan miqdor', 'Jami tushum (so\'m)']
    const rows = topProducts.map((p) => [
      `"${p.name || p.productName || '—'}"`,
      p.totalQuantity || p.quantity || 0,
      p.totalRevenue || 0,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `restoflow-hisobot-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(t('dashboard.csvExported', { defaultValue: 'CSV yuklab olindi' }))
  }

  const isLoading = statsQuery.isLoading
  const avgCheck = stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('reports.title', { defaultValue: "Hisobotlar & Analitika" })}
        subtitle={t('reports.subtitle', { defaultValue: "Restoranning moliyaviy va savdo ko'rsatkichlari" })}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              isLoading={isSendingTelegram}
              onClick={handleSendTelegram}
            >
              <Send className="mr-2 h-4 w-4 text-sky-500" />
              {t('dashboard.telegramExport', { defaultValue: "Telegram'ga yuborish" })}
            </Button>

            <Button variant="secondary" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4 text-emerald-500" />
              {t('dashboard.csvExport', { defaultValue: "CSV Eksport" })}
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                statsQuery.refetch()
                topProductsQuery.refetch()
              }}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
              {t('refresh', { defaultValue: "Yangilash" })}
            </Button>
          </div>
        }
      />

      {/* Date Filter Bar */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {t('reports.dateRange', { defaultValue: "Davr" })}:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: t('reports.today', { defaultValue: "Bugun" }) },
              { id: 'week', label: t('reports.thisWeek', { defaultValue: "Shu hafta" }) },
              { id: 'month', label: t('reports.thisMonth', { defaultValue: "Shu oy" }) },
              { id: 'custom', label: t('reports.custom', { defaultValue: "Tanlangan sana" }) },
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
            {apiErrorMessage(statsQuery.error, t('kitchen.loadFailed', { defaultValue: "Analitika ma'lumotlarini yuklab bo'lmadi" }))}
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
              label={t('reports.revenue', { defaultValue: "Tushum" })}
              value={formatSom(stats.todayRevenue)}
              hint={`${stats.todayPaymentsCount ?? 0} ta to'lov yozuvi`}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label={t('dashboard.avgCheck', { defaultValue: "O'rtacha chek" })}
              value={formatSom(avgCheck)}
              hint="O'rtacha bir chek summasi"
            />
            <StatCard
              icon={TrendingUp}
              tone="amber"
              label={t('dashboard.activeOrders', { defaultValue: "Faol buyurtmalar" })}
              value={stats.activeOrdersCount ?? 0}
              hint={`Jami bugun: ${stats.todayOrdersCount ?? 0} ta`}
            />
            <StatCard
              icon={Package}
              tone="indigo"
              label={t('reports.totalOrders', { defaultValue: "Ombor zaxirasi" })}
              value={`${stats.totalProducts ?? 0} ta`}
              hint={stats.lowStockCount > 0 ? `${stats.lowStockCount} ta kam qolgan` : "Zaxira etarli"}
            />
          </>
        )}
      </div>

      {/* Top Selling Products Chart */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          {t('dashboard.topProducts', { defaultValue: "Eng Ko'p Sotilgan Taomlar Analitikasi (Top 10)" })}
        </h2>

        {topProductsQuery.isLoading ? (
          <Skeleton className="h-72 w-full" />
        ) : topProducts.length === 0 ? (
          <EmptyState
            icon={Package}
            title={t('dashboard.noData', { defaultValue: "Ma'lumot yo'q" })}
            description={t('waiter.tryAnotherCat', { defaultValue: "Tanlangan davr bo'yicha sotuv ma'lumotlari mavjud emas." })}
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
