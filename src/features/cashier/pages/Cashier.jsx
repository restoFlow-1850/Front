// Kassa — GET /api/payments/unpaid-orders, POST /api/payments, Split Bill, ReceiptPrintModal & To'lovlar tarixi
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertOctagon,
  Banknote,
  CheckCircle,
  CreditCard,
  History,
  Lock,
  Printer,
  Receipt as ReceiptIcon,
  Smartphone,
  Users,
  Wallet,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { createPayment, getReceipt, getUnpaidOrders, getCurrentShift } from '../api'
import { updateOrderStatus } from '../../orders/api'
import ReceiptPrintModal from '../components/ReceiptPrintModal'
import PaymentsHistory from '../components/PaymentsHistory'
import ShiftPanel from '../components/ShiftPanel'
import { settingsApi } from '../../settings/api'
import { unwrap, unwrapList, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import {
  ORDER_STATUS,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_TONE,
  PAYMENT_METHODS,
  PAYMENT_METHOD_LABELS,
} from '../../../constants/roles'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  PageHeader,
  Skeleton,
} from '../../../components/ui'

const METHOD_ICONS = {
  [PAYMENT_METHODS.CASH]: Banknote,
  [PAYMENT_METHODS.CARD]: CreditCard,
  [PAYMENT_METHODS.CLICK]: Smartphone,
  [PAYMENT_METHODS.PAYME]: Smartphone,
}

export default function Cashier() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  // Joriy smena — smena ochilmagan bo'lsa to'lov qabul qilib bo'lmaydi
  const shiftQuery = useQuery({
    queryKey: ['shift', 'current'],
    queryFn: async () => {
      try {
        const res = await getCurrentShift()
        return unwrap(res, 'shift')
      } catch (err) {
        if (err?.response?.status === 404) return null
        throw err
      }
    },
    refetchInterval: 30_000,
  })

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
    staleTime: 5 * 60_000,
  })



  const shift = shiftQuery.data
  const hasOpenShift = shift && shift.status === 'open'

  const [activeTab, setActiveTab] = useState('cashier') // 'cashier' | 'history'
  const [selectedId, setSelectedId] = useState(null)
  const [method, setMethod] = useState(PAYMENT_METHODS.CASH)
  const [splitCount, setSplitCount] = useState(1)
  const [customAmount, setCustomAmount] = useState('')
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  // To'lanmagan buyurtmalar — GET /api/payments/unpaid-orders (fallback: /orders?paid=false)
  const unpaidQuery = useQuery({
    queryKey: ['orders', 'unpaid'],
    queryFn: async () => unwrapList(await getUnpaidOrders(), 'orders'),
    refetchInterval: 15_000,
  })

  // Tanlangan buyurtma cheki
  const receiptQuery = useQuery({
    queryKey: ['receipt', selectedId],
    queryFn: async () => unwrap(await getReceipt(selectedId), 'receipt'),
    enabled: Boolean(selectedId),
  })

  // To'lov mutation — POST /api/payments
  const paymentMutation = useMutation({
    mutationFn: (amount) =>
      createPayment({
        order: selectedId,
        method,
        ...(amount ? { amount } : {}),
      }),
    onMutate: async (amount) => {
      setCustomAmount('')
      setSplitCount(1)
      if (!amount || amount >= remaining) {
        queryClient.setQueryData(['orders', 'unpaid'], (old) => {
          if (!Array.isArray(old)) return old
          return old.filter((o) => o._id !== selectedId)
        })
      }
    },
    onSuccess: () => {
      toast.success(t('cashier.paymentSuccess'))
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['receipt', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('cashier.paymentFailed'))),
  })

  // Buyurtmani bekor qilish mutation
  const cancelMutation = useMutation({
    mutationFn: () => updateOrderStatus(selectedId, ORDER_STATUS.CANCELLED),
    onSuccess: () => {
      toast.info(t('cashier.orderCancelled'))
      setShowCancelConfirm(false)
      setSelectedId(null)
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    onError: (error) => toast.error(apiErrorMessage(error, t('cashier.cancelFailed'))),
  })

  const unpaid = useMemo(() => unpaidQuery.data ?? [], [unpaidQuery.data])
  const receipt = receiptQuery.data

  useEffect(() => {
    if (selectedId && unpaidQuery.isSuccess && !unpaid.some((o) => o._id === selectedId)) {
      if (!receipt || receipt.isPaid) {
        setSelectedId(null)
      }
    }
  }, [unpaid, selectedId, unpaidQuery.isSuccess, receipt])

  const remaining = receipt?.remainingBalance ?? 0

  const splitAmount = useMemo(() => {
    if (splitCount > 1 && remaining > 0) {
      return Math.ceil(remaining / splitCount)
    }
    return remaining
  }, [remaining, splitCount])

  const handlePay = () => {
    const parsed = customAmount ? Number(customAmount) : null
    if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error(t('cashier.invalidAmount', { defaultValue: "Summa 0 dan katta bo'lishi kerak" }))
      return
    }
    if (parsed !== null && parsed > remaining) {
      toast.error(`${t('cashier.amountExceeds', { defaultValue: 'Summa qolgan balansdan katta bo\'lishi mumkin emas' })} (${formatSom(remaining)})`)
      return
    }
    paymentMutation.mutate(parsed)
  }

  return (
    <div className="space-y-5">
      <PageHeader title={t('cashier.title')} subtitle={t('cashier.subtitle')} />

      {/* Smena paneli — smena ochilmagan bo'lsa to'lov bloklanadi */}
      <ShiftPanel onShiftChange={() => shiftQuery.refetch()} />

      {/* Smena bloki — to'lov paneli faqat smena ochiq bo'lganda ishlaydi */}
      {!hasOpenShift && shiftQuery.isSuccess && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-semibold">
              {t('cashier.shiftNotOpenDesc')}
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        <button
          type="button"
          onClick={() => setActiveTab('cashier')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'cashier'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <Wallet className="h-4 w-4" />
          {t('cashier.cashierAndPay')}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            activeTab === 'history'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <History className="h-4 w-4" />
          {t('cashier.paymentsHistory')}
        </button>
      </div>

      {activeTab === 'history' ? (
        <PaymentsHistory />
      ) : !hasOpenShift ? (
        <Card>
          <EmptyState
            icon={Lock}
            title={t('shift.shiftClosed')}
            description={t('shift.shiftNotOpenDesc')}
          />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
          {/* To'lanmagan buyurtmalar ro'yxati */}
          <Card padded={false} className="overflow-hidden">
            <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('cashier.unpaidOrders')}
                <span className="ml-2 rounded-full bg-slate-200 px-2 py-0.5 text-xs dark:bg-slate-800">
                  {unpaid.length}
                </span>
              </h2>
            </div>

            <div className="max-h-[70vh] overflow-y-auto">
              {unpaidQuery.isLoading ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16" />
                  ))}
                </div>
              ) : unpaid.length === 0 ? (
                <EmptyState
                  icon={CheckCircle}
                  title={t('cashier.allPaid')}
                  description={t('cashier.noUnpaidOrders')}
                />
              ) : (
                unpaid.map((order) => (
                  <button
                    key={order._id}
                    type="button"
                    onClick={() => {
                      setSelectedId(order._id)
                      setCustomAmount('')
                      setSplitCount(1)
                      setShowCancelConfirm(false)
                    }}
                    className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 dark:border-slate-800 ${
                      selectedId === order._id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {t('cashier.tableNum')} {order.table?.number ?? '—'}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {order.waiter?.name ?? '—'} · {formatTime(order.createdAt)}
                      </p>
                      <Badge variant={ORDER_STATUS_TONE[order.status]} className="mt-1">
                        {t(`orderStatus.${order.status}`, ORDER_STATUS_LABELS[order.status] ?? order.status)}
                      </Badge>
                    </div>
                    <span className="shrink-0 text-sm font-bold text-slate-900 dark:text-white">
                      {formatSom(order.totalAmount)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Chek ko'rish va to'lov paneli */}
          {!selectedId ? (
            <Card>
              <EmptyState
                icon={ReceiptIcon}
                title={t('cashier.orderNotSelected')}
                description={t('cashier.selectOrderDesc')}
              />
            </Card>
          ) : receiptQuery.isLoading ? (
            <Card>
              <Skeleton className="h-72 w-full" />
            </Card>
          ) : receiptQuery.isError ? (
            <Card>
              <p className="text-sm text-rose-600">
                {apiErrorMessage(receiptQuery.error, t('kitchen.loadFailed'))}
              </p>
            </Card>
          ) : (
            <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
              {/* Chek preview */}
              <Card>
                <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                      {t('cashier.tableNum')} {receipt?.order?.table?.number ?? '—'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {t('dashboard.waiter')}: {receipt?.order?.waiter?.name ?? '—'} ·{' '}
                      {formatTime(receipt?.order?.createdAt)}
                    </p>
                  </div>
                  <Badge variant={receipt?.isPaid ? 'success' : 'warning'}>
                    {receipt?.isPaid ? t('cashier.paid') : t('cashier.unpaid')}
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {receipt?.order?.items?.map((item, index) => (
                    <div key={`${item.product}-${index}`} className="flex justify-between py-2.5 text-sm">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          {item.quantity} × {formatSom(item.price)}
                        </p>
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {formatSom(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                  <Row label={t('cashier.orderAmount')} value={formatSom(receipt?.order?.totalAmount)} />
                  <Row label={t('cashier.paidAmount')} value={formatSom(receipt?.paidTotal)} />
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                    <span>{t('cashier.remainingBalance')}</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatSom(remaining)}</span>
                  </div>
                </div>

                {receipt?.payments?.length > 0 && (
                  <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                    <h3 className="mb-2 text-xs font-semibold text-slate-500">{t('cashier.paymentsHistory')}</h3>
                    <div className="space-y-1">
                      {receipt.payments.map((payment) => (
                        <div key={payment._id} className="flex justify-between text-xs text-slate-500">
                          <span>
                            {t(`paymentMethods.${payment.method}`, PAYMENT_METHOD_LABELS[payment.method] ?? payment.method)} ·{' '}
                            {payment.receivedBy?.name ?? '—'} · {formatTime(payment.createdAt)}
                          </span>
                          <span className="font-semibold">{formatSom(payment.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* To'lov paneli */}
              <Card className="h-fit space-y-4">
                <h3 className="border-b border-slate-200 pb-3 text-sm font-semibold text-slate-900 dark:border-slate-800 dark:text-white">
                  {t('cashier.paymentMethodAndSplit')}
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {Object.values(PAYMENT_METHODS).map((value) => {
                    const Icon = METHOD_ICONS[value]
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMethod(value)}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition ${
                          method === value
                            ? 'border-indigo-600 bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs">{t(`paymentMethods.${value}`, PAYMENT_METHOD_LABELS[value])}</span>
                      </button>
                    )
                  })}
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                    <Users className="h-3.5 w-3.5 text-indigo-500" /> {t('cashier.splitBill')}
                  </p>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setSplitCount(num)
                          setCustomAmount(num > 1 && remaining > 0 ? String(Math.ceil(remaining / num)) : '')
                        }}
                        className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                          splitCount === num
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                      >
                        {num === 1 ? '1' : `${num}`}
                      </button>
                    ))}
                  </div>
                  {splitCount > 1 && remaining > 0 && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {t('cashier.perPerson')} <strong>{formatSom(splitAmount)}</strong>
                    </p>
                  )}
                </div>

                <Input
                  label={t('cashier.paymentAmountLabel')}
                  type="number"
                  min={1}
                  max={remaining}
                  placeholder={`${t('cashier.emptyDefault')} ${formatSom(remaining)}`}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                />

                <Button
                  className="w-full"
                  disabled={remaining <= 0}
                  isLoading={paymentMutation.isPending}
                  onClick={handlePay}
                >
                  {remaining <= 0 ? t('cashier.fullyPaid') : t('cashier.acceptPayment')}
                </Button>

                <Button variant="secondary" className="w-full" onClick={() => setIsReceiptModalOpen(true)}>
                  <Printer className="mr-2 h-4 w-4" /> {t('cashier.viewPrintReceipt')}
                </Button>

                {/* Buyurtmani bekor qilish */}
                <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
                  {!showCancelConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowCancelConfirm(true)}
                      className="w-full text-center text-xs font-semibold text-rose-600 hover:underline dark:text-rose-400"
                    >
                      {t('cashier.cancelOrder')}
                    </button>
                  ) : (
                    <div className="space-y-2 rounded-xl bg-rose-50 p-3 dark:bg-rose-950/40">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-300">
                        <AlertOctagon className="h-4 w-4 shrink-0" />
                        {t('cashier.confirmCancel')}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          className="h-8 flex-1 text-xs"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          {t('cashier.noKeep')}
                        </Button>
                        <Button
                          className="h-8 flex-1 bg-rose-600 text-xs text-white hover:bg-rose-700"
                          isLoading={cancelMutation.isPending}
                          onClick={() => cancelMutation.mutate()}
                        >
                          {t('cashier.yesCancel')}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}

          <ReceiptPrintModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            receipt={receipt}
          />
        </div>
      )}
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-slate-500 dark:text-slate-400">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  )
}
