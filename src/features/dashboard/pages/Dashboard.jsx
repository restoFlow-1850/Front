// Boshqaruv paneli — /reports/dashboard va /orders dan HAQIQIY ma'lumot.
//
// Eslatma: ilgari bu sahifa mock ma'lumot ko'rsatardi va `revenueChange`,
// `occupiedTables`, `avgCheck` kabi backendda umuman mavjud bo'lmagan maydonlarni
// kutardi. Endi faqat /reports/dashboard qaytaradigan maydonlar ishlatiladi:
//   todayRevenue, todayPaymentsCount, todayOrdersCount, activeOrdersCount,
//   totalProducts, lowStockCount, topProducts[]
// O'rtacha chek va band stollar shu ma'lumotlardan hisoblab chiqariladi.
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Chart from 'react-apexcharts'
import {
  AlertTriangle,
  ClipboardList,
  DollarSign,
  Package,
  Receipt,
  RefreshCw,
  Utensils,
} from 'lucide-react'

import { getDashboardStats } from '../../../services/dashboardService'
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

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ['reports', 'dashboard'],
    // Backend hisobotlarni `data.report` ichida qaytaradi (boshqa endpointlardek
    // `data`ning o'zida emas) — kalitni ko'rsatmasak barcha maydon undefined bo'ladi.
    queryFn: async () => unwrap(await getDashboardStats(), 'report'),
    refetchInterval: 60_000,
  })

  const ordersQuery = useQuery({
    queryKey: ['orders', 'recent'],
    queryFn: async () => unwrapList(await getOrders({ limit: 8 }), 'orders'),
    refetchInterval: 30_000,
  })

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables(), 'tables'),
  })

  const stats = statsQuery.data ?? {}
  const orders = ordersQuery.data ?? []
  const tables = tablesQuery.data ?? []

  const occupied = tables.filter((t) => t.status === TABLE_STATUS.BUSY).length
  // O'rtacha chek — bugungi tushumni to'lovlar soniga bo'lamiz (0 ga bo'linishdan himoya).
  const avgCheck = stats.todayPaymentsCount ? stats.todayRevenue / stats.todayPaymentsCount : 0

  // `stats.topProducts ?? []` har renderda yangi massiv yaratardi va quyidagi
  // useMemo hech qachon keshdan foydalana olmasdi.
  const topProducts = useMemo(() => statsQuery.data?.topProducts ?? [], [statsQuery.data])

  const chart = useMemo(
    () => ({
      options: {
        chart: { type: 'bar', toolbar: { show: false }, fontFamily: 'inherit' },
        colors: ['#4f46e5'],
        plotOptions: { bar: { borderRadius: 6, horizontal: true, barHeight: '60%' } },
        dataLabels: { enabled: false },
        xaxis: {
          categories: topProducts.map((p) => p.name),
          labels: { style: { colors: '#94a3b8' } },
        },
        yaxis: { labels: { style: { colors: '#94a3b8' } } },
        grid: { borderColor: '#e2e8f0', strokeDashArray: 4 },
        tooltip: { y: { formatter: (v) => `${v} ta` } },
      },
      series: [{ name: 'Sotildi', data: topProducts.map((p) => p.totalQuantity) }],
    }),
    [topProducts],
  )

  const isLoading = statsQuery.isLoading

  return (
    <div>
      <PageHeader
        title="Boshqaruv paneli"
        subtitle="Restoranning bugungi ko'rsatkichlari"
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              statsQuery.refetch()
              ordersQuery.refetch()
              tablesQuery.refetch()
            }}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${statsQuery.isFetching ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        }
      />

      {statsQuery.isError && (
        <Card className="mb-5 border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/40">
          <p className="flex items-center gap-2 text-sm text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {apiErrorMessage(statsQuery.error, "Hisobot ma'lumotlarini yuklab bo'lmadi")}
          </p>
        </Card>
      )}

      {/* Ko'rsatkichlar */}
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={DollarSign}
              tone="emerald"
              label="Bugungi tushum"
              value={formatSom(stats.todayRevenue)}
              hint={`${stats.todayPaymentsCount ?? 0} ta to'lov`}
            />
            <StatCard
              icon={ClipboardList}
              tone="indigo"
              label="Faol buyurtmalar"
              value={stats.activeOrdersCount ?? 0}
              hint={`Bugun jami ${stats.todayOrdersCount ?? 0} ta`}
            />
            <StatCard
              icon={Utensils}
              tone="amber"
              label="Band stollar"
              value={`${occupied} / ${tables.length}`}
              hint={tables.length ? `${Math.round((occupied / tables.length) * 100)}% band` : '—'}
            />
            <StatCard
              icon={Receipt}
              tone="indigo"
              label="O'rtacha chek"
              value={formatSom(avgCheck)}
              hint="Bugungi to'lovlar bo'yicha"
            />
          </>
        )}
      </div>

      {/* Ombor ogohlantirishi */}
      {!isLoading && stats.lowStockCount > 0 && (
        <Card className="mb-5 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40">
          <p className="flex items-center gap-2 text-sm text-amber-800 dark:text-amber-300">
            <Package className="h-4 w-4 shrink-0" />
            <strong>{stats.lowStockCount}</strong> ta mahsulot omborda tugab qolmoqda (5 tadan kam).
            Jami {stats.totalProducts ?? 0} ta mahsulot.
          </p>
        </Card>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Eng ko'p sotilgan taomlar */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            Eng ko'p sotilgan taomlar
          </h2>
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : topProducts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Ma'lumot yo'q"
              description="Yopilgan buyurtmalar bo'lgach statistika shu yerda ko'rinadi."
            />
          ) : (
            <Chart options={chart.options} series={chart.series} type="bar" height={280} />
          )}
        </Card>

        {/* So'nggi buyurtmalar */}
        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-white">
            So'nggi buyurtmalar
          </h2>

          {ordersQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <EmptyState icon={ClipboardList} title="Buyurtma yo'q" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-700">
                    <th className="pb-2 pr-3 font-semibold">Stol</th>
                    <th className="pb-2 pr-3 font-semibold">Ofitsiant</th>
                    <th className="pb-2 pr-3 font-semibold">Summa</th>
                    <th className="pb-2 pr-3 font-semibold">Holat</th>
                    <th className="pb-2 font-semibold">Vaqt</th>
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
                          {ORDER_STATUS_LABELS[order.status] ?? order.status}
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
    </div>
  )
}
