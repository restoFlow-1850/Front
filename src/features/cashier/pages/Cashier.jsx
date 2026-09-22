// Kassa — GET /api/payments/unpaid-orders, POST /api/payments
// Minimallashtirilgan: stol → summa → to'lov usuli → TO'LASH. Split va tarix — ixtiyoriy.
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  Banknote,
  CheckCircle,
  CreditCard,
  History,
  Lock,
  Printer,
  Receipt as ReceiptIcon,
  Smartphone,
  Users,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { createPayment, getReceipt, getUnpaidOrders, getCurrentShift } from '../api'
import ReceiptPrintModal from '../components/ReceiptPrintModal'
import PaymentsHistory from '../components/PaymentsHistory'
import ShiftPanel from '../components/ShiftPanel'

import { unwrap, unwrapList, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import { PAYMENT_METHODS, PAYMENT_METHOD_LABELS } from '../../../constants/roles'
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Skeleton,
} from '../../../components/ui'
import { socket } from '../../../services/socket'
import { playNotificationSound } from '../../../utils/sound'

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

  const shift = shiftQuery.data
  const hasOpenShift = shift && shift.status === 'open'

  const [selectedId, setSelectedId] = useState(null)
  const [method, setMethod] = useState(PAYMENT_METHODS.CASH)
  const [splitCount, setSplitCount] = useState(1)
  const [customAmount, setCustomAmount] = useState('')
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [showPartialPayment, setShowPartialPayment] = useState(false)

  // To'lanmagan buyurtmalar
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

  // Socket real-time obunalar
  useEffect(() => {
    const handleOrderEvent = () => {
      playNotificationSound()
      queryClient.invalidateQueries({ queryKey: ['orders', 'unpaid'] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
    const handlePaymentEvent = () => {
      playNotificationSound()
      queryClient.invalidateQueries({ queryKey: ['orders', 'unpaid'] })
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    }

    socket.on('order:created', handleOrderEvent)
    socket.on('order:status_changed', handleOrderEvent)
    socket.on('table:status_updated', handleOrderEvent)
    socket.on('payment:created', handlePaymentEvent)

    return () => {
      socket.off('order:created', handleOrderEvent)
      socket.off('order:status_changed', handleOrderEvent)
      socket.off('table:status_updated', handleOrderEvent)
      socket.off('payment:created', handlePaymentEvent)
    }
  }, [queryClient])

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
      setShowPartialPayment(false)
      setIsReceiptModalOpen(true)
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

  const unpaid = unpaidQuery.data ?? []
  const receipt = receiptQuery.data
  const remaining = receipt?.remainingBalance ?? 0
  const splitAmount = splitCount > 1 && remaining > 0 ? Math.ceil(remaining / splitCount) : remaining
  const payAmount = customAmount ? Number(customAmount) : remaining

  const handlePay = () => {
    if (paymentMutation.isPending) return
    const parsed = customAmount ? Number(customAmount) : null
    if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error(t('cashier.invalidAmount', { defaultValue: "Summa 0 dan katta bo'lishi kerak" }))
      return
    }
    if (parsed !== null && parsed > remaining) {
      toast.error(
        `${t('cashier.amountExceeds', { defaultValue: "Summa qolgan balansdan katta bo'lishi mumkin emas" })} (${formatSom(remaining)})`
      )
      return
    }
    paymentMutation.mutate(parsed)
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t('cashier.title')}
        subtitle={t('cashier.subtitle')}
        actions={
          <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            {t('cashier.paymentsHistory')}
          </Button>
        }
      />

      <ShiftPanel onShiftChange={() => shiftQuery.refetch()} />

      {!hasOpenShift && shiftQuery.isSuccess && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
            <Lock className="h-5 w-5" />
            <p className="text-sm font-semibold">{t('cashier.shiftNotOpenDesc')}</p>
          </div>
        </div>
      )}

      {!hasOpenShift ? (
        <Card>
          <EmptyState icon={Lock} title={t('shift.shiftClosed')} description={t('shift.shiftNotOpenDesc')} />
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          {/* To'lanmagan buyurtmalar — faqat stol raqami va summa */}
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
                <EmptyState icon={CheckCircle} title={t('cashier.allPaid')} description={t('cashier.noUnpaidOrders')} />
              ) : (
                unpaid.map((order) => (
                  <button
                    key={order._id}
                    type="button"
                    onClick={() => {
                      setSelectedId(order._id)
                      setCustomAmount('')
                      setSplitCount(1)
                      setShowPartialPayment(false)
                    }}
                    className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 text-left transition last:border-0 dark:border-slate-800 ${
                      selectedId === order._id
                        ? 'bg-indigo-50 dark:bg-indigo-950/40'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                      {order.table?.number ?? '—'}
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {formatSom(order.totalAmount)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </Card>

          {/* Chek + to'lov usuli + TO'LASH */}
          {!selectedId ? (
            <Card>
              <EmptyState icon={ReceiptIcon} title={t('cashier.orderNotSelected')} description={t('cashier.selectOrderDesc')} />
            </Card>
          ) : receiptQuery.isLoading ? (
            <Card>
              <Skeleton className="h-72 w-full" />
            </Card>
          ) : receiptQuery.isError ? (
            <Card>
              <p className="text-sm text-rose-600">{apiErrorMessage(receiptQuery.error, t('kitchen.loadFailed'))}</p>
            </Card>
          ) : (
            <Card className="space-y-4">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t('cashier.tableNum')} {receipt?.order?.table?.number ?? '—'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('dashboard.waiter')}: {receipt?.order?.waiter?.name ?? '—'} · {formatTime(receipt?.order?.createdAt)}
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

              <div className="space-y-1.5 border-t border-slate-200 pt-4 text-sm dark:border-slate-800">
                <Row label={t('cashier.orderAmount')} value={formatSom(receipt?.order?.totalAmount)} />
                <Row label={t('cashier.paidAmount')} value={formatSom(receipt?.paidTotal)} />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
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

              {!showPartialPayment ? (
                <button
                  type="button"
                  onClick={() => setShowPartialPayment(true)}
                  className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {t('cashier.partialPaymentLink', { defaultValue: "Qisman to'lov" })}
                </button>
              ) : (
                <div className="space-y-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
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
                          {num}
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
                </div>
              )}

              <Button
                className="w-full text-base"
                disabled={remaining <= 0 || paymentMutation.isPending}
                isLoading={paymentMutation.isPending}
                onClick={handlePay}
              >
                {remaining <= 0 ? t('cashier.fullyPaid') : `${t('cashier.acceptPayment')} · ${formatSom(payAmount)}`}
              </Button>

              <Button variant="secondary" className="w-full" onClick={() => setIsReceiptModalOpen(true)}>
                <Printer className="mr-2 h-4 w-4" /> {t('cashier.viewPrintReceipt')}
              </Button>
            </Card>
          )}

          <ReceiptPrintModal
            isOpen={isReceiptModalOpen}
            onClose={() => setIsReceiptModalOpen(false)}
            receipt={receipt}
          />

          <Modal
            isOpen={isHistoryModalOpen}
            onClose={() => setIsHistoryModalOpen(false)}
            title={t('cashier.paymentsHistory')}
          >
            <PaymentsHistory />
          </Modal>
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