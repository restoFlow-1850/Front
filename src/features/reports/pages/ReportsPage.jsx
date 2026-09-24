import { lazy, Suspense, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Award,
  Calendar,
  Clock,
  CreditCard,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Flame,
  Package,
  PackageX,
  Receipt,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'

import {
  getAnalyticsOrders,
  getAnalyticsPayments,
  getAnalyticsProducts,
  getDashboardReport,
  getTopProductsReport,
  sendTelegramDailyReport,
} from '../api'
import { exportFullReportToExcel, exportFullReportToPDF } from '../utils/reportExport'
import { unwrap, unwrapList, apiErrorMessage, formatSom } from '../../../lib/api'
import { Button, Card, EmptyState, Input, PageHeader, Skeleton, StatCard } from '../../../components/ui'

const Chart = lazy(() => import('react-apexcharts'))

export default function ReportsPage() {
  const { t } = useTranslation()

  // ─── 1. Sana Oralig'i Filtr State ──────────────────────────────
  const [dateRange, setDateRange] = useState('today') // today | week | month | custom
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [dishTab, setDishTab] = useState('top') // 'top' | 'least'
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPDF, setIsExportingPDF] = useState(false)
  const [isSendingTelegram, setIsSendingTelegram] = useState(false)

  // Hisoblangan sana chegaralari
  const { startDate, endDate, dateRangeLabel } = useMemo(() => {
    const now = new Date()
    let start = new Date()
    let end = new Date()
    let label = 'Bugun'

    if (dateRange === 'today') {
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      label = `Bugun (${start.toLocaleDateString('ru-RU')})`
    } else if (dateRange === 'week') {
      start.setDate(now.getDate() - 7)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      label = `Oxirgi 7 kun (${start.toLocaleDateString('ru-RU')} — ${end.toLocaleDateString('ru-RU')})`
    } else if (dateRange === 'month') {
      start.setDate(now.getDate() - 30)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      label = `Oxirgi 30 kun (${start.toLocaleDateString('ru-RU')} — ${end.toLocaleDateString('ru-RU')})`
    } else if (dateRange === 'custom') {
      if (customFrom) {
        start = new Date(customFrom)
        start.setHours(0, 0, 0, 0)
      } else {
        start = new Date('2020-01-01')
      }
      if (customTo) {
        end = new Date(customTo)
        end.setHours(23, 59, 59, 999)
      } else {
        end.setHours(23, 59, 59, 999)
      }
      label = `${start.toLocaleDateString('ru-RU')} — ${end.toLocaleDateString('ru-RU')}`
    }

    return { startDate: start, endDate: end, dateRangeLabel: label }
  }, [dateRange, customFrom, customTo])

  // ─── 2. API Queries (Barcha raqamlar haqiqiy API'dan) ─────────
  const dashboardQuery = useQuery({
    queryKey: ['reports', 'dashboard'],
    queryFn: async () => unwrap(await getDashboardReport(), 'report'),
    staleTime: 60_000,
  })

  const topProductsQuery = useQuery({
    queryKey: ['reports', 'top-products', customFrom, customTo, dateRange],
    queryFn: async () => {
      const res = await getTopProductsReport({
        from: startDate.toISOString(),
        to: endDate.toISOString(),
        limit: 100,
      })
      return res.data?.data?.products ?? res.data?.products ?? res.data ?? []
    },
    staleTime: 30_000,
  })

  const ordersQuery = useQuery({
    queryKey: ['reports', 'orders', dateRange, customFrom, customTo],
    queryFn: async () => {
      const res = await getAnalyticsOrders({ limit: 500 })
      return unwrapList(res, 'orders')
    },
    staleTime: 30_000,
  })

  const paymentsQuery = useQuery({
    queryKey: ['reports', 'payments', dateRange, customFrom, customTo],
    queryFn: async () => {
      const res = await getAnalyticsPayments({ limit: 500 })
      return unwrapList(res, 'payments')
    },
    staleTime: 30_000,
  })

  const allProductsQuery = useQuery({
    queryKey: ['reports', 'all-products'],
    queryFn: async () => {
      const res = await getAnalyticsProducts({ limit: 200 })
      return unwrapList(res, 'products')
    },
    staleTime: 60_000,
  })

  const isLoading =
    dashboardQuery.isLoading ||
    topProductsQuery.isLoading ||
    ordersQuery.isLoading ||
    paymentsQuery.isLoading

  // ─── 3. Dinamik Hisob-kitoblar (Pure derived state) ────────────

  // A. Oraliq bo'yicha to'lovlar va to'lov usullari (naqd/karta/click/payme)
  const { filteredPayments, paymentsByMethod, totalRevenue } = useMemo(() => {
    const allPayments = paymentsQuery.data ?? []
    const startMs = startDate.getTime()
    const endMs = endDate.getTime()

    const inRange = allPayments.filter((p) => {
      if (!p.createdAt) return true
      const pTime = new Date(p.createdAt).getTime()
      return pTime >= startMs && pTime <= endMs
    })

    const byMethod = { naqd: 0, karta: 0, click: 0, payme: 0 }
    let rev = 0

    inRange.forEach((p) => {
      const amt = Number(p.amount || 0)
      rev += amt
      const m = String(p.method || 'naqd').toLowerCase()
      if (m in byMethod) {
        byMethod[m] += amt
      } else {
        byMethod.naqd += amt
      }
    })

    return { filteredPayments: inRange, paymentsByMethod: byMethod, totalRevenue: rev }
  }, [paymentsQuery.data, startDate, endDate])

  // B. Oraliq bo'yicha buyurtmalar va yuklama
  const { filteredOrders, cancelledOrders, cancelledRevenue, cancelledReasons, hourlyOrders, peakHourInfo } =
    useMemo(() => {
      const allOrders = ordersQuery.data ?? []
      const startMs = startDate.getTime()
      const endMs = endDate.getTime()

      const inRange = allOrders.filter((o) => {
        if (!o.createdAt) return true
        const oTime = new Date(o.createdAt).getTime()
        return oTime >= startMs && oTime <= endMs
      })

      // Bekor qilingan buyurtmalar tahlili
      const cancelled = inRange.filter((o) => o.status === 'bekor_qilingan')
      let cancelSum = 0
      const reasons = {}

      cancelled.forEach((o) => {
        cancelSum += Number(o.totalAmount || 0)
        const r = o.cancelReason?.trim() || "Sabab ko'rsatilmagan"
        reasons[r] = (reasons[r] || 0) + 1
      })

      // Soatlar bo'yicha yuklama (08:00 dan 23:00 gacha)
      const hoursMap = Array.from({ length: 16 }, (_, i) => ({
        hour: i + 8,
        label: `${String(i + 8).padStart(2, '0')}:00`,
        count: 0,
        revenue: 0,
      }))

      inRange.forEach((o) => {
        if (!o.createdAt) return
        const h = new Date(o.createdAt).getHours()
        const target = hoursMap.find((item) => item.hour === h)
        if (target) {
          target.count += 1
          target.revenue += Number(o.totalAmount || 0)
        }
      })

      let maxHour = { label: '—', count: 0 }
      hoursMap.forEach((item) => {
        if (item.count > maxHour.count) {
          maxHour = { label: `${item.label} — ${item.hour + 1}:00`, count: item.count }
        }
      })

      return {
        filteredOrders: inRange,
        cancelledOrders: cancelled,
        cancelledRevenue: cancelSum,
        cancelledReasons: Object.entries(reasons).map(([reason, count]) => ({ reason, count })),
        hourlyOrders: hoursMap,
        peakHourInfo: maxHour,
      }
    }, [ordersQuery.data, startDate, endDate])

  // C. Top 10 va Eng Kam Sotilgan 10 Taom
  const { top10Products, least10Products } = useMemo(() => {
    const rawTop = topProductsQuery.data ?? []
    const allProd = allProductsQuery.data ?? []

    const salesMap = new Map()
    rawTop.forEach((p) => {
      const pid = p.product?._id || p.product || p._id || p.name
      salesMap.set(String(pid), {
        name: p.name || '—',
        totalQuantity: p.totalQuantity || 0,
        totalRevenue: p.totalRevenue || 0,
      })
    })

    const top10 = rawTop.slice(0, 10).map((p) => ({
      name: p.name || '—',
      totalQuantity: p.totalQuantity || 0,
      totalRevenue: p.totalRevenue || 0,
    }))

    // Eng kam sotilgan taomlar (ombordagi barcha taomlar kesimida)
    const combined = allProd.map((prod) => {
      const pid = String(prod._id || prod.id)
      const sale = salesMap.get(pid)
      return {
        name: prod.name,
        categoryName: prod.category?.name || (typeof prod.category === 'string' ? prod.category : '—'),
        price: prod.price || 0,
        stock: prod.stock ?? 0,
        totalQuantity: sale?.totalQuantity || 0,
        totalRevenue: sale?.totalRevenue || 0,
      }
    })

    combined.sort((a, b) => a.totalQuantity - b.totalQuantity)
    const least10 = combined.slice(0, 10)

    return { top10Products: top10, least10Products: least10 }
  }, [topProductsQuery.data, allProductsQuery.data])

  // D. Ofitsiantlar kesimida samaradorlik
  const waitersAnalytics = useMemo(() => {
    const map = new Map()

    filteredOrders.forEach((o) => {
      const wId = o.waiter?._id || o.waiter?.id || o.waiter?.name || 'nomalum'
      const wName = o.waiter?.name || o.waiter?.username || "Ofitsiant (Ismsiz)"

      if (!map.has(wId)) {
        map.set(wId, { name: wName, ordersCount: 0, totalRevenue: 0 })
      }
      const record = map.get(wId)
      record.ordersCount += 1
      if (o.status !== 'bekor_qilingan') {
        record.totalRevenue += Number(o.totalAmount || 0)
      }
    })

    const list = Array.from(map.values()).map((w) => ({
      ...w,
      avgRevenue: w.ordersCount > 0 ? Math.round(w.totalRevenue / w.ordersCount) : 0,
    }))

    list.sort((a, b) => b.totalRevenue - a.totalRevenue)
    return list
  }, [filteredOrders])

  // E. Asosiy KPI Ko'rsatkichlar
  const totalOrdersCount = filteredOrders.length
  const completedOrdersCount = filteredOrders.filter((o) => o.status === 'yopilgan').length
  const avgCheck = completedOrdersCount > 0 ? Math.round(totalRevenue / completedOrdersCount) : 0

  // ─── 4. Diagrammalar (Charts Setup) ───────────────────────────

  // To'lov Usullari Donut Chart
  const paymentChartOptions = useMemo(
    () => ({
      chart: { type: 'donut', fontFamily: 'inherit' },
      labels: ['Naqd', 'Plastik Karta', 'Click', 'Payme'],
      colors: ['#10B981', '#0EA5E9', '#F59E0B', '#8B5CF6'],
      legend: { position: 'bottom', horizontalAlign: 'center', fontSize: '12px' },
      dataLabels: { enabled: true, formatter: (val) => `${val.toFixed(1)}%` },
      tooltip: {
        y: { formatter: (val) => formatSom(val) },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '65%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Jami Tushum',
                formatter: () => formatSom(totalRevenue),
              },
            },
          },
        },
      },
    }),
    [totalRevenue],
  )

  const paymentChartSeries = useMemo(
    () => [
      paymentsByMethod.naqd,
      paymentsByMethod.karta,
      paymentsByMethod.click,
      paymentsByMethod.payme,
    ],
    [paymentsByMethod],
  )

  // Soatlar Bo'yicha Yuklama Bar/Area Chart
  const hourlyChartOptions = useMemo(
    () => ({
      chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
      colors: ['#6366F1'],
      stroke: { curve: 'smooth', width: 3 },
      fill: {
        type: 'gradient',
        gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100] },
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: hourlyOrders.map((h) => h.label),
        labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
      },
      yaxis: {
        labels: {
          style: { colors: '#94a3b8' },
          formatter: (v) => `${Math.round(v)} ta`,
        },
      },
      grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
      tooltip: {
        y: { formatter: (val) => `${val} ta buyurtma` },
      },
    }),
    [hourlyOrders],
  )

  const hourlyChartSeries = useMemo(
    () => [{ name: "Buyurtmalar soni", data: hourlyOrders.map((h) => h.count) }],
    [hourlyOrders],
  )

  // ─── 5. Eksport Funksiyalari ──────────────────────────────────
  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    try {
      await exportFullReportToExcel({
        dateRangeLabel,
        stats: {
          totalRevenue,
          totalOrdersCount,
          paymentsCount: filteredPayments.length,
          avgCheck,
          cancelledCount: cancelledOrders.length,
          cancelledRevenue,
        },
        paymentsByMethod,
        topProducts: top10Products,
        leastProducts: least10Products,
        waiters: waitersAnalytics,
        cancelledOrders,
        filename: `RestoFlow_Hisobot_${dateRange}.xlsx`,
      })
      toast.success("Excel hisoboti muvaffaqiyatli yuklandi")
    } catch (err) {
      toast.error(apiErrorMessage(err, "Excel eksportda xatolik yuz berdi"))
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPDF = async () => {
    setIsExportingPDF(true)
    try {
      await exportFullReportToPDF({
        dateRangeLabel,
        stats: {
          totalRevenue,
          totalOrdersCount,
          avgCheck,
          cancelledCount: cancelledOrders.length,
          cancelledRevenue,
        },
        paymentsByMethod,
        topProducts: top10Products,
        waiters: waitersAnalytics,
        cancelledOrders,
        filename: `RestoFlow_Hisobot_${dateRange}.pdf`,
      })
      toast.success("PDF hisoboti muvaffaqiyatli yuklandi")
    } catch (err) {
      toast.error(apiErrorMessage(err, "PDF eksportda xatolik yuz berdi"))
    } finally {
      setIsExportingPDF(false)
    }
  }

  const handleSendTelegram = async () => {
    setIsSendingTelegram(true)
    try {
      await sendTelegramDailyReport()
      toast.success(t('dashboard.telegramSent', { defaultValue: 'Hisobot Telegram botga yuborildi' }))
    } catch (err) {
      toast.error(apiErrorMessage(err, t('kitchen.loadFailed', { defaultValue: "Xatolik yuz berdi" })))
    } finally {
      setIsSendingTelegram(false)
    }
  }

  const refetchAll = () => {
    dashboardQuery.refetch()
    topProductsQuery.refetch()
    ordersQuery.refetch()
    paymentsQuery.refetch()
    allProductsQuery.refetch()
  }

  return (
    <div className="space-y-6">
      {/* ─── Sarlavha va Eksport Tugmalari ──────────────────────── */}
      <PageHeader
        title={t('reports.title', { defaultValue: "Restoran Hisobotlari & Analitika" })}
        subtitle={`Restoran egasi va boshqaruv uchun to'liq tahliliy ko'rsatkichlar (${dateRangeLabel})`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="secondary"
              isLoading={isExportingExcel}
              onClick={handleExportExcel}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400"
            >
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-emerald-600" />
              Excel Eksport
            </Button>

            <Button
              variant="secondary"
              isLoading={isExportingPDF}
              onClick={handleExportPDF}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
            >
              <FileText className="mr-1.5 h-4 w-4 text-rose-600" />
              PDF Eksport
            </Button>

            <Button variant="secondary" isLoading={isSendingTelegram} onClick={handleSendTelegram}>
              <Send className="mr-1.5 h-4 w-4 text-sky-500" />
              Telegram
            </Button>

            <Button variant="secondary" onClick={refetchAll}>
              <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Yangilash
            </Button>
          </div>
        }
      />

      {/* ─── 1. Davr Tanlash Paneli (Kun / Hafta / Oy / Oraliq) ─── */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-indigo-500" />
            <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Hisobot davri:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Bugun' },
              { id: 'week', label: 'Shu hafta' },
              { id: 'month', label: 'Shu oy' },
              { id: 'custom', label: 'Ixtiyoriy oraliq' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setDateRange(item.id)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
                  dateRange === item.id
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="w-48">
              <Input
                type="date"
                label="Boshlang'ich sana"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Input
                type="date"
                label="Tugash sanasi"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
              />
            </div>
            <div className="mt-5 text-xs text-slate-500">
              Belgilangan oraliq bo'yicha ma'lumotlar avtomatik filtrlanadi
            </div>
          </div>
        )}
      </Card>

      {/* ─── 2. Asosiy KPI Kartochkalari ─────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              tone="emerald"
              label="Jami Daromad"
              value={formatSom(totalRevenue)}
              hint={`${filteredPayments.length} ta muvaffaqiyatli to'lov`}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label="O'rtacha Chek"
              value={formatSom(avgCheck)}
              hint={`${completedOrdersCount} ta yopilgan buyurtma asosida`}
            />
            <StatCard
              icon={TrendingUp}
              tone="sky"
              label="Jami Buyurtmalar"
              value={`${totalOrdersCount} ta`}
              hint={`Yopilgan: ${completedOrdersCount} ta`}
            />
            <StatCard
              icon={XCircle}
              tone="rose"
              label="Bekor Qilinganlar"
              value={`${cancelledOrders.length} ta`}
              hint={`Yo'qotilgan summa: ${formatSom(cancelledRevenue)}`}
            />
          </>
        )}
      </div>

      {/* ─── 3. Diagrammalar Qatori (Daromad usullari & Yuklama) ─── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* To'lov usullari kesimidagi daromad diagrammasi */}
        <Card className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Daromad Usullar Kesimida
                </h3>
              </div>
              <span className="text-xs text-slate-400">Naqd / Karta / Click / Payme</span>
            </div>

            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : totalRevenue === 0 ? (
              <EmptyState
                icon={Wallet}
                title="To'lovlar mavjud emas"
                description="Ushbu davrda hali to'lovlar amalga oshirilmagan."
              />
            ) : (
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <Chart options={paymentChartOptions} series={paymentChartSeries} type="donut" height={270} />
              </Suspense>
            )}
          </div>

          {/* Mini breakdown grid */}
          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
            <div className="rounded-lg bg-emerald-50/60 p-2 dark:bg-emerald-950/20">
              <span className="text-emerald-700 dark:text-emerald-400 font-medium">Naqd pul:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatSom(paymentsByMethod.naqd)}</p>
            </div>
            <div className="rounded-lg bg-sky-50/60 p-2 dark:bg-sky-950/20">
              <span className="text-sky-700 dark:text-sky-400 font-medium">Plastik karta:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatSom(paymentsByMethod.karta)}</p>
            </div>
            <div className="rounded-lg bg-amber-50/60 p-2 dark:bg-amber-950/20">
              <span className="text-amber-700 dark:text-amber-400 font-medium">Click:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatSom(paymentsByMethod.click)}</p>
            </div>
            <div className="rounded-lg bg-purple-50/60 p-2 dark:bg-purple-950/20">
              <span className="text-purple-700 dark:text-purple-400 font-medium">Payme:</span>
              <p className="font-bold text-slate-900 dark:text-white mt-0.5">{formatSom(paymentsByMethod.payme)}</p>
            </div>
          </div>
        </Card>

        {/* Soatlar bo'yicha yuklama (qachon gavjum) */}
        <Card className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Soatlar Bo'yicha Yuklama Dinamikasi
                </h3>
              </div>
              {peakHourInfo.count > 0 && (
                <div className="flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  Eng gavjum: {peakHourInfo.label} ({peakHourInfo.count} ta)
                </div>
              )}
            </div>

            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <Suspense fallback={<Skeleton className="h-64 w-full" />}>
                <Chart options={hourlyChartOptions} series={hourlyChartSeries} type="area" height={280} />
              </Suspense>
            )}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3 dark:border-slate-800">
            <span>Restoran ish soatlari (08:00 - 23:00)</span>
            <span>Buyurtmalar soni vaqt kesimida taqsimlangan</span>
          </div>
        </Card>
      </div>

      {/* ─── 4. Top 10 va Eng Kam Sotilgan 10 Taom ──────────────── */}
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {dishTab === 'top' ? (
              <Award className="h-4 w-4 text-amber-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-rose-500" />
            )}
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Taomlar Sotuv Tahlili (Top 10 & Kam Sotilganlar)
            </h3>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setDishTab('top')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                dishTab === 'top'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top 10 Eng Ko'p Sotilgan
            </button>
            <button
              type="button"
              onClick={() => setDishTab('least')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                dishTab === 'least'
                  ? 'bg-white text-rose-600 shadow-sm dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Eng Kam Sotilgan 10 Taom
            </button>
          </div>
        </div>

        {dishTab === 'top' ? (
          top10Products.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Taomlar sotuvi mavjud emas"
              description="Tanlangan davrda hali taomlar sotilmagan."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold dark:border-slate-700">
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Taom Nomi</th>
                    <th className="py-2.5 px-3 text-center">Sotilgan Miqdori</th>
                    <th className="py-2.5 px-3 text-right">Jami Tushum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {top10Products.map((p, idx) => (
                    <tr key={p.name + idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-bold text-slate-400">
                        {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                        {p.name}
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {p.totalQuantity} ta
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatSom(p.totalRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : least10Products.length === 0 ? (
          <EmptyState
            icon={PackageX}
            title="Ma'lumot topilmadi"
            description="Omborda taomlar ro'yxati topilmadi."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold dark:border-slate-700">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Taom Nomi</th>
                  <th className="py-2.5 px-3">Kategoriya</th>
                  <th className="py-2.5 px-3 text-right">Narxi</th>
                  <th className="py-2.5 px-3 text-center">Sotilgan Soni</th>
                  <th className="py-2.5 px-3 text-center">Ombor Zaxirasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {least10Products.map((p, idx) => (
                  <tr key={p.name + idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{p.categoryName}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                      {formatSom(p.price)}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-rose-600 dark:text-rose-400">
                      {p.totalQuantity} ta
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          p.stock <= 5
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {p.stock} ta
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── 5. Ofitsiantlar & Bekor Qilinganlar (2 Ustun) ────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ofitsiantlar samaradorligi */}
        <Card>
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Ofitsiantlar Kesimida Savdo Ko'rsatkichlari
              </h3>
            </div>
            <span className="text-xs text-slate-400">{waitersAnalytics.length} nafar xodim</span>
          </div>

          {waitersAnalytics.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Ofitsiantlar faoliyati topilmadi"
              description="Tanlangan davrda ofitsiantlar buyurtma olmagan."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-semibold dark:border-slate-700">
                    <th className="py-2 px-2">Ofitsiant</th>
                    <th className="py-2 px-2 text-center">Buyurtmalar</th>
                    <th className="py-2 px-2 text-right">Jami Savdo</th>
                    <th className="py-2 px-2 text-right">O'rtacha Chek</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {waitersAnalytics.map((w) => (
                    <tr key={w.name} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-2 font-semibold text-slate-800 dark:text-slate-200">
                        {w.name}
                      </td>
                      <td className="py-2 px-2 text-center font-bold text-indigo-600 dark:text-indigo-400">
                        {w.ordersCount} ta
                      </td>
                      <td className="py-2 px-2 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatSom(w.totalRevenue)}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-500 font-medium">
                        {formatSom(w.avgRevenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Bekor qilingan buyurtmalar & Sabablari */}
        <Card>
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Bekor Qilingan Buyurtmalar & Sabablari
              </h3>
            </div>
            <span className="text-xs font-semibold text-rose-600">
              {cancelledOrders.length} ta ({formatSom(cancelledRevenue)})
            </span>
          </div>

          {cancelledOrders.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-6 text-center dark:border-emerald-950 dark:bg-emerald-950/20">
              <span className="text-2xl">🎉</span>
              <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                Ushbu davrda birorta ham bekor qilingan buyurtma yo'q!
              </p>
              <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                Oshxona va xizmat sifati a'lo darajada.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Sabablar bo'yicha taqsimot */}
              {cancelledReasons.length > 0 && (
                <div className="space-y-1.5 border-b border-slate-100 pb-3 dark:border-slate-800">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Bekor qilish sabablari:
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {cancelledReasons.map(({ reason, count }) => (
                      <span
                        key={reason}
                        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
                      >
                        {reason}: <strong className="font-bold">{count} ta</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bekor qilinganlar ro'yxati */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {cancelledOrders.slice(0, 10).map((o, idx) => (
                  <div
                    key={o._id || idx}
                    className="flex items-center justify-between rounded-lg bg-slate-50 p-2.5 text-xs dark:bg-slate-800/60"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {o.table?.number ? `Stol #${o.table.number}` : 'Stol —'}
                        </span>
                        <span className="text-slate-400">
                          {o.createdAt ? new Date(o.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </span>
                      </div>
                      <p className="mt-0.5 text-rose-600 dark:text-rose-400 italic">
                        "{o.cancelReason || "Sabab ko'rsatilmagan"}"
                      </p>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatSom(o.totalAmount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
