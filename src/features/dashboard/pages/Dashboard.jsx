// Boshqaruv paneli — React.lazy va Dynamic Importlar yordamida optimallashtirilgan.
// Initial bundle size < 500 kB bo'lishi uchun ApexCharts React.lazy bilan,
// html2canvas / Excel / PDF kutubxonalari esa dinamik import qilinadi.
import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Package,
  Receipt,
  RefreshCw,
  TrendingUp,
  Utensils,
  Send,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { getDailySales, getDashboardStats, getReports, getTopProducts } from '../../../services/dashboardService'
import { getOrders } from '../../orders/api'
import { getTables } from '../../tables/api'
import { unwrap, unwrapList, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONE, TABLE_STATUS } from '../../../constants/roles'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
} from '../../../components/ui'
import { exportToCSV, exportToExcel } from '../../../utils/exportToExcel'
import { exportToPDF as exportPDFUtil } from '../../../utils/exportUtils'
import api from '../../../services/axios'

// ⚡ Dynamic React.lazy chart loading to keep bundle size under 500 kB
const Chart = lazy(() => import('react-apexcharts'))

export default function Dashboard() {
  const { t } = useTranslation()
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingTelegram, setIsSendingTelegram] = useState(false)

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true)
    try {
      await api.post('/reports/telegram-daily-report')
      toast.success(t('dashboard.sendTelegramSuccess', { defaultValue: 'Hisobot Telegram botga muvaffaqiyatli yuborildi! 📲' }))
    } catch (err) {
      toast.error(apiErrorMessage(err, t('dashboard.sendTelegramError', { defaultValue: "Telegram'ga yuborishda xatolik yuz berdi" })))
    } finally {
      setIsSendingTelegram(false)
    }
  }

  // 1. Dashboard umumiy statistikasi — GET /reports yoki /reports/dashboard
  const statsQuery = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => {
      try {
        const res = await getReports()
        return unwrap(res, 'report') || unwrap(res)
      } catch {
        return unwrap(await getDashboardStats(), 'report')
      }
    },
    refetchInterval: 60_000,
  })

  // 2. Kunlik sotuvlar statistikasi
  const dailySalesQuery = useQuery({
    queryKey: ['reports', 'daily-sales'],
    queryFn: async () => unwrapList(await getDailySales(), 'sales'),
    refetchInterval: 60_000,
  })

  // 3. Top taomlar statistikasi
  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products'],
    queryFn: async () => unwrapList(await getTopProducts(), 'products'),
    refetchInterval: 60_000,
  })

  // 4. So'nggi buyurtmalar
  const ordersQuery = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => unwrapList(await getOrders({ limit: 8 }), 'orders'),
    refetchInterval: 30_000,
  })

  // 5. Stollar holati
  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
  })

  const stats = statsQuery.data ?? {}
  const orders = ordersQuery.data ?? []
  const tables = tablesQuery.data ?? []

  const topProducts = useMemo(() => {
    if (topProductsQuery.data && topProductsQuery.data.length > 0) {
      return topProductsQuery.data
    }
    return statsQuery.data?.topProducts ?? []
  }, [topProductsQuery.data, statsQuery.data])

  const dailySales = useMemo(() => dailySalesQuery.data ?? [], [dailySalesQuery.data])

  const occupied = tables.filter((tbl) => tbl.status === TABLE_STATUS.BUSY || tbl.status === TABLE_STATUS.OCCUPIED).length
  const avgCheck = stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0

  // ── ApexCharts: Kunlik sotuvlar grafigi (Area/Line) ──────────────────────
  const salesChart = useMemo(() => {
    const categories = dailySales.length > 0
      ? dailySales.map((s) => s.date || s._id || '—')
      : ['Bugun']

    const seriesData = dailySales.length > 0
      ? dailySales.map((s) => s.totalRevenue || s.revenue || 0)
      : [stats.todayRevenue || 0]

    return {
      options: {
        chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
        colors: ['#10b981'],
        fill: {
          type: 'gradient',
          gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [0, 90, 100] },
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 3 },
        xaxis: {
          categories,
          labels: { style: { colors: '#94a3b8' } },
        },
        yaxis: {
          labels: {
            style: { colors: '#94a3b8' },
            formatter: (v) => `${(v / 1000).toFixed(0)}k`,
          },
        },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        tooltip: {
          y: { formatter: (v) => `${v.toLocaleString('ru-RU')}` },
        },
      },
      series: [{ name: t('dashboard.todayRevenue'), data: seriesData }],
    }
  }, [dailySales, stats.todayRevenue, t])

  // ── ApexCharts: Top taomlar bar grafigi ─────────────────────────────────
  const topProductsChart = useMemo(() => {
    return {
      options: {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
        colors: ['#4f46e5'],
        plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%' } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: topProducts.map((p) => p.name || p.productName || '—'),
          labels: { style: { colors: '#94a3b8' } },
        },
        yaxis: { labels: { style: { colors: '#94a3b8' } } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        tooltip: { y: { formatter: (v) => `${v}` } },
      },
      series: [{ name: t('dashboard.soldCount'), data: topProducts.map((p) => p.totalQuantity || p.quantity || 0) }],
    }
  }, [topProducts, t])

  // ── Export handlers ──────────────────────────────────────────────────────
  const handleExportExcel = async () => {
    try {
      setIsExporting(true)
      await exportToExcel({
        stats,
        topProducts,
        dailySales,
        filename: `RestoFlow_Analitika_${new Date().toISOString().slice(0, 10)}.xlsx`,
      })
      toast.success(t('dashboard.excelSuccess', { defaultValue: "Excel hisobot yuklab olindi" }))
    } catch (err) {
      console.error(err)
      toast.error(t('dashboard.excelError', { defaultValue: "Excel hisobotni yuklashda xatolik yuz berdi" }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportCSV = () => {
    try {
      setIsExporting(true)
      exportToCSV({
        stats,
        topProducts,
        filename: `RestoFlow_Analitika_${new Date().toISOString().slice(0, 10)}.csv`,
      })
      toast.success(t('dashboard.csvSuccess', { defaultValue: "CSV hisobot yuklab olindi" }))
    } catch (err) {
      console.error(err)
      toast.error(t('dashboard.csvError', { defaultValue: "CSV hisobotni yuklashda xatolik yuz berdi" }))
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    try {
      setIsExporting(true)
      exportPDFUtil({
        stats,
        topProducts,
        dailySales,
        filename: `RestoFlow_Analitika_${new Date().toISOString().slice(0, 10)}.pdf`,
      })
      toast.success(t('dashboard.pdfSuccess', { defaultValue: "PDF hisobot yuklab olindi" }))
    } catch (err) {
      console.error(err)
      toast.error(t('dashboard.pdfError', { defaultValue: "PDF hisobotni yuklashda xatolik yuz berdi" }))
    } finally {
      setIsExporting(false)
    }
  }

  const isLoading = statsQuery.isLoading

  return (
    <div id="dashboard-container">
      <PageHeader
        title={t('dashboard.title')}
        subtitle={t('dashboard.subtitle')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              isLoading={isSendingTelegram}
              onClick={handleSendTelegram}
              className="text-xs sm:text-sm"
            >
              <Send className="mr-1.5 h-4 w-4 text-sky-500" />
              {t('dashboard.sendTelegram')}
            </Button>
            <Button
              variant="secondary"
              disabled={isExporting}
              onClick={handleExportExcel}
              className="text-xs sm:text-sm"
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {t('dashboard.excelExport')}
            </Button>
            <Button
              variant="secondary"
              disabled={isExporting}
              onClick={handleExportCSV}
              className="text-xs sm:text-sm"
            >
              <FileText className="mr-1.5 h-4 w-4 text-blue-600 dark:text-blue-400" />
              {t('dashboard.csvExport')}
            </Button>
            <Button
              variant="secondary"
              disabled={isExporting}
              onClick={handleExportPDF}
              className="text-xs sm:text-sm"
            >
              <FileText className="mr-1.5 h-4 w-4 text-rose-600 dark:text-rose-400" />
              {t('dashboard.pdfExport')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                statsQuery.refetch()
                dailySalesQuery.refetch()
                topProductsQuery.refetch()
                ordersQuery.refetch()
                tablesQuery.refetch()
              }}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${
                  statsQuery.isFetching || dailySalesQuery.isFetching ? 'animate-spin' : ''
                }`}
              />
              {t('dashboard.refresh')}
            </Button>
          </div>
        }
      />

      {statsQuery.isError && (
        <Card className="mb-5 border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
          <p className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {apiErrorMessage(statsQuery.error, t('kitchen.loadFailed'))}
          </p>
        </Card>
      )}

      {/* Ko'rsatkichlar kartalari */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              tone="emerald"
              label={t('dashboard.todayRevenue')}
              value={formatSom(stats.todayRevenue)}
              hint={`${stats.todayPaymentsCount ?? 0} ${t('dashboard.paymentsCount')}`}
            />
            <StatCard
              icon={ClipboardList}
              tone="indigo"
              label={t('dashboard.activeOrders')}
              value={stats.activeOrdersCount ?? 0}
              hint={`${t('dashboard.todayTotal')} ${stats.todayOrdersCount ?? 0}`}
            />
            <StatCard
              icon={Utensils}
              tone="amber"
              label={t('dashboard.occupiedTables')}
              value={`${occupied} / ${tables.length}`}
              hint={tables.length ? `${Math.round((occupied / tables.length) * 100)}% ${t('dashboard.occupiedPct')}` : '—'}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label={t('dashboard.avgCheck')}
              value={formatSom(avgCheck)}
              hint={t('dashboard.avgCheckHint')}
            />
          </>
        )}
      </div>

      {/* Ombor ogohlantirishi */}
      {!isLoading && stats.lowStockCount > 0 && (
        <Card className="mb-5 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <Package className="h-4 w-4 shrink-0" />
            <strong>{stats.lowStockCount}</strong> {t('dashboard.lowStockAlert')} {stats.totalProducts ?? 0} {t('dashboard.totalProducts')}
          </p>
        </Card>
      )}

      {/* ApexCharts Grafiklari (React.lazy + Suspense optimization) */}
      <div className="mb-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              {t('dashboard.salesDynamics')}
            </h2>
            <span className="text-xs text-slate-400">{t('dashboard.revenueSom')}</span>
          </div>
          {dailySalesQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <Chart options={salesChart.options} series={salesChart.series} type="area" height={280} />
            </Suspense>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t('dashboard.topProducts')}
            </h2>
            <span className="text-xs text-slate-400">{t('dashboard.soldCount')}</span>
          </div>
          {topProductsQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : topProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t('dashboard.noData')}
              description={t('dashboard.chartHint')}
            />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <Chart options={topProductsChart.options} series={topProductsChart.series} type="bar" height={280} />
            </Suspense>
          )}
        </Card>
      </div>

      {/* So'nggi buyurtmalar */}
      <Card>
        <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
          {t('dashboard.recentOrders')}
        </h2>

        {ordersQuery.isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <EmptyState icon={ClipboardList} title={t('dashboard.noOrders')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700">
                  <th className="pb-2 pr-3 font-semibold">{t('dashboard.table')}</th>
                  <th className="pb-2 pr-3 font-semibold">{t('dashboard.waiter')}</th>
                  <th className="pb-2 pr-3 font-semibold">{t('dashboard.sum')}</th>
                  <th className="pb-2 pr-3 font-semibold">{t('dashboard.status')}</th>
                  <th className="pb-2 font-semibold">{t('dashboard.time')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="py-2.5 pr-3 font-medium text-slate-900 dark:text-white">
                      {order.table?.number ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3 text-slate-600 dark:text-slate-300">
                      {order.waiter?.name ?? '—'}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-slate-900 dark:text-white">
                      {formatSom(order.totalAmount)}
                    </td>
                    <td className="py-2.5 pr-3">
                      <Badge variant={ORDER_STATUS_TONE[order.status]}>
                        {t(`orderStatus.${order.status}`, ORDER_STATUS_LABELS[order.status] ?? order.status)}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-xs text-slate-400">
                      {formatTime(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
