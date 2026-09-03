import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Chart from 'react-apexcharts'
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
  const topProducts = topProductsQuery.data ?? stats.topProducts ?? []

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
      tooltip: { y: { formatter: (v) => `${v} ta` } },
    }),
    [topProducts],
  )

  const chartSeries = useMemo(
    () => [{ name: t('reports.sold'), data: topProducts.map((p) => p.totalQuantity) }],
    [topProducts, t],
  )

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true)
    try {
      await api.post('/reports/telegram-daily-report')
      toast.success(t('dashboard.telegramSent'))
    } catch (err) {
      toast.error(apiErrorMessage(err, t('kitchen.loadFailed')))
    } finally {
      setIsSendingTelegram(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Mahsulot nomi', 'Sotilgan miqdor', 'Jami tushum (so\'m)']
    const rows = topProducts.map((p) => [
      `"${p.name}"`,
      p.totalQuantity,
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
    toast.success(t('dashboard.csvExported'))
  }

  const isLoading = statsQuery.isLoading

  return (
    <div>
      <PageHeader
        title={t('reports.title', { defaultValue: "Hisobotlar & Analitika" })}
        subtitle={t('reports.subtitle', { defaultValue: "Restoranning moliyaviy va savdo ko'rsatkichlari" })}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" isLoading={isSendingTelegram} onClick={handleSendTelegram}>
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

      {/* Davr tanlash filteri */}
      <Card className="mb-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{t('reports.dateRange', { defaultValue: "Davr" })}:</span>
            {['today', 'week', 'month', 'custom'].map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setDateRange(mode)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  dateRange === mode
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {mode === 'today' && t('reports.today', { defaultValue: "Bugun" })}
                {mode === 'week' && t('reports.thisWeek', { defaultValue: "Shu hafta" })}
                {mode === 'month' && t('reports.thisMonth', { defaultValue: "Shu oy" })}
                {mode === 'custom' && t('reports.custom', { defaultValue: "Tanlangan sana" })}
              </button>
            ))}
          </div>

          {dateRange === 'custom' && (
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                placeholder="Dan"
              />
              <span className="text-xs text-slate-400">—</span>
              <Input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                placeholder="Gacha"
              />
            </div>
          )}
        </div>
      </Card>

      {/* Xatolik ogohlantirish */}
      {statsQuery.isError && (
        <Card className="mb-5 border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
          <p className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {apiErrorMessage(statsQuery.error, t('kitchen.loadFailed', { defaultValue: "Analitika ma'lumotlarini yuklab bo'lmadi" }))}
          </p>
        </Card>
      )}

      {/* Asosiy ko'rsatkichlar */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              tone="emerald"
              label={t('reports.revenue', { defaultValue: "Tushum" })}
              value={formatSom(stats.todayRevenue)}
              hint={`${stats.todayPaymentsCount ?? 0} ta to'lov`}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label={t('dashboard.avgCheck', { defaultValue: "O'rtacha chek" })}
              value={formatSom(
                stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0,
              )}
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

      {/* Grafik va Top Taomlar */}
      <Card className="mb-5">
        <h2 className="mb-4 text-base font-semibold text-slate-900 dark:text-white">
          {t('dashboard.topProducts', { defaultValue: "Eng Ko'p Sotilgan Taomlar Analitikasi" })}
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
          <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
        )}
      </Card>
    </div>
  )
}
