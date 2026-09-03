import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AlertTriangle,
  Banknote,
  Calendar,
  CreditCard,
  DollarSign,
  Printer,
  RefreshCw,
  Search,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react'

import { toast } from 'react-toastify'

import { getPayments, getReceipt, clearAllPayments } from '../api'
import ReceiptPrintModal from './ReceiptPrintModal'
import { unwrapList, apiErrorMessage, formatDateTime, formatSom } from '../../../lib/api'
import {
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from '../../../constants/roles'
import {
  Button,
  Card,
  EmptyState,
  Input,
  Skeleton,
  StatCard,
} from '../../../components/ui'

const METHOD_ICONS = {
  [PAYMENT_METHODS.CASH]: Banknote,
  [PAYMENT_METHODS.CARD]: CreditCard,
  [PAYMENT_METHODS.CLICK]: Smartphone,
  [PAYMENT_METHODS.PAYME]: Smartphone,
}

export default function PaymentsHistory() {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')
  const [activeReceipt, setActiveReceipt] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isLoadingReceipt, setIsLoadingReceipt] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  const clearMutation = useMutation({
    mutationFn: () => clearAllPayments(),
    onSuccess: () => {
      toast.success("Barcha to'lovlar o'chirildi")
      setConfirmClear(false)
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err, "To'lovlarni o'chirib bo'lmadi")),
  })

  // Payments API query
  const paymentsQuery = useQuery({
    queryKey: ['payments', 'history'],
    queryFn: async () => unwrapList(await getPayments({ limit: 100 }), 'payments'),
    refetchInterval: 30_000,
  })

  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data])

  // Filtered payments list
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchMethod = !selectedMethod || p.method === selectedMethod
      const searchLower = searchQuery.toLowerCase().trim()
      const matchSearch =
        !searchLower ||
        String(p.order?.table?.number ?? '').includes(searchLower) ||
        String(p.receivedBy?.name ?? '').toLowerCase().includes(searchLower) ||
        String(p.amount ?? '').includes(searchLower)

      return matchMethod && matchSearch
    })
  }, [payments, selectedMethod, searchQuery])

  // Total Statistics Calculations
  const stats = useMemo(() => {
    let total = 0
    let cash = 0
    let card = 0
    let online = 0

    payments.forEach((p) => {
      const amt = Number(p.amount || 0)
      total += amt
      if (p.method === PAYMENT_METHODS.CASH) cash += amt
      else if (p.method === PAYMENT_METHODS.CARD) card += amt
      else online += amt
    })

    return { total, cash, card, online }
  }, [payments])

  const handleOpenReceipt = async (payment) => {
    try {
      setIsLoadingReceipt(true)
      const orderId = payment.order?._id || payment.order
      if (!orderId) return

      const res = await getReceipt(orderId)
      const receiptData = res?.data?.data?.receipt ?? res?.data?.data ?? res?.data
      setActiveReceipt(receiptData)
      setIsModalOpen(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoadingReceipt(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Dynamic Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {paymentsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : (
          <>
            <StatCard
              icon={Wallet}
              tone="indigo"
              label="Jami to'lovlar summasi"
              value={formatSom(stats.total)}
              hint={`${payments.length} ta to'lov amaliyoti`}
            />
            <StatCard
              icon={Banknote}
              tone="emerald"
              label="Naqd to'lovlar"
              value={formatSom(stats.cash)}
              hint="Kassa tushumi"
            />
            <StatCard
              icon={CreditCard}
              tone="sky"
              label="Karta to'lovlari"
              value={formatSom(stats.card)}
              hint="Terminal orqali"
            />
            <StatCard
              icon={Smartphone}
              tone="amber"
              label="Click / Payme"
              value={formatSom(stats.online)}
              hint="Onlayn to'lovlar"
            />
          </>
        )}
      </div>

      {/* Filter and Search Toolbar */}
      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Stol № yoki xodim bo'yicha..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Barcha usullar</option>
              {Object.values(PAYMENT_METHODS).map((m) => (
                <option key={m} value={m}>
                  {PAYMENT_METHOD_LABELS[m]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <Button variant="danger" onClick={() => setConfirmClear(true)} disabled={clearMutation.isPending}>
              <Trash2 className="mr-2 h-4 w-4" /> Tozalash
            </Button>
            <Button variant="secondary" onClick={() => paymentsQuery.refetch()}>
              <RefreshCw
                className={`mr-2 h-4 w-4 ${paymentsQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Yangilash
            </Button>
          </div>
        </div>
      </Card>

      {/* Tozalash tasdiqlash modali */}
      {confirmClear && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 dark:bg-rose-950">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">To'lovlarni o'chirish</p>
                <p className="text-sm text-slate-500">Barcha to'lov yozuvlari o'chiriladi</p>
              </div>
            </div>
            <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
              Barcha to'lovlarni rostdan ham o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setConfirmClear(false)}>
                Bekor qilish
              </Button>
              <Button variant="danger" className="flex-1" onClick={() => clearMutation.mutate()} isLoading={clearMutation.isPending}>
                O'chirish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Payments History Table */}
      <Card padded={false}>
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Amalga oshirilgan to'lovlar ro'yxati
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              {filteredPayments.length} ta
            </span>
          </h3>
        </div>

        {paymentsQuery.isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : paymentsQuery.isError ? (
          <div className="p-4 text-sm text-rose-600">
            {apiErrorMessage(paymentsQuery.error, "To'lovlar tarixini yuklab bo'lmadi")}
          </div>
        ) : filteredPayments.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="To'lovlar topilmadi"
            description="Tanlangan filtrlar bo'yicha to'lov yozuvlari yo'q."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800">
                  <th className="py-3 pl-4 pr-3 font-semibold">Sana va vaqt</th>
                  <th className="py-3 pr-3 font-semibold">Stol</th>
                  <th className="py-3 pr-3 font-semibold">Kassir / Xodim</th>
                  <th className="py-3 pr-3 font-semibold">To'lov usuli</th>
                  <th className="py-3 pr-3 font-semibold">Summa</th>
                  <th className="py-3 pr-4 text-right font-semibold">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayments.map((p) => {
                  const Icon = METHOD_ICONS[p.method] || DollarSign
                  return (
                    <tr
                      key={p._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition"
                    >
                      <td className="py-3 pl-4 pr-3 text-xs text-slate-600 dark:text-slate-300">
                        {formatDateTime(p.createdAt)}
                      </td>
                      <td className="py-3 pr-3 font-semibold text-slate-900 dark:text-white">
                        Stol № {p.order?.table?.number ?? '—'}
                      </td>
                      <td className="py-3 pr-3 text-slate-600 dark:text-slate-300">
                        {p.receivedBy?.name ?? 'Kassir'}
                      </td>
                      <td className="py-3 pr-3">
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:text-slate-300">
                          <Icon className="h-3.5 w-3.5 text-indigo-500" />
                          <span>{PAYMENT_METHOD_LABELS[p.method] || p.method}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 font-bold text-slate-900 dark:text-white">
                        {formatSom(p.amount)}
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <Button
                          variant="secondary"
                          className="h-8 text-xs"
                          disabled={isLoadingReceipt}
                          onClick={() => handleOpenReceipt(p)}
                        >
                          <Printer className="mr-1.5 h-3.5 w-3.5" />
                          Chekni ko'rish
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Chek modal */}
      <ReceiptPrintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        receipt={activeReceipt}
      />
    </div>
  )
}
