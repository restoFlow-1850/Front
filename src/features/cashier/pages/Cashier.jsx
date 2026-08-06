// Kassa — to'lanmagan buyurtmani tanlash, chekni ko'rish va to'lovni qabul qilish.
//
// Eslatma: bu sahifa ilgari qattiq yozilgan "ORD-1042" ID'si va mock buyurtma
// ustida ishlardi; to'lov usullari ham backend enum'iga mos emas edi
// (card/cash o'rniga karta/naqd). Bundan tashqari server xatosi yuz berganda ham
// ekranda "To'lov amalga oshirildi" chiqardi — kassa ekranida bu qabul qilib
// bo'lmaydigan xatti-harakat. Endi hammasi haqiqiy API ustida ishlaydi.
import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Banknote,
  CheckCircle,
  CreditCard,
  Printer,
  Receipt as ReceiptIcon,
  Smartphone,
  Users,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { createPayment, getReceipt } from '../api'
import { getOrders } from '../../orders/api'
import { unwrap, unwrapList, apiErrorMessage, formatSom, formatTime } from '../../../lib/api'
import {
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
  const queryClient = useQueryClient()

  const [selectedId, setSelectedId] = useState(null)
  const [method, setMethod] = useState(PAYMENT_METHODS.CASH)
  const [splitCount, setSplitCount] = useState(1)
  const [customAmount, setCustomAmount] = useState('')

  // To'lanmagan buyurtmalar — backend `paid=false` filtrini qo'llab-quvvatlaydi.
  const unpaidQuery = useQuery({
    queryKey: ['orders', 'unpaid'],
    queryFn: async () => unwrapList(await getOrders({ paid: 'false', limit: 50 }), 'orders'),
    refetchInterval: 20_000,
  })

  const receiptQuery = useQuery({
    queryKey: ['receipt', selectedId],
    queryFn: async () => unwrap(await getReceipt(selectedId), 'receipt'),
    enabled: Boolean(selectedId),
  })

  const paymentMutation = useMutation({
    mutationFn: (amount) =>
      createPayment({
        order: selectedId,
        method,
        // Summa berilmasa backend qolgan balansni to'liq yopadi.
        ...(amount ? { amount } : {}),
      }),
    onSuccess: () => {
      toast.success("To'lov qabul qilindi")
      setCustomAmount('')
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['receipt', selectedId] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
    },
    // Muhim: xato bo'lsa muvaffaqiyat ko'rsatilmaydi.
    onError: (error) => toast.error(apiErrorMessage(error, "To'lov amalga oshmadi")),
  })

  const unpaid = useMemo(() => unpaidQuery.data ?? [], [unpaidQuery.data])
  const receipt = receiptQuery.data

  // Ro'yxat yangilanganda tanlangan buyurtma yo'qolgan bo'lsa (to'liq to'landi),
  // tanlovni tozalaymiz — aks holda ekranda "o'lik" chek qolib ketadi.
  useEffect(() => {
    if (selectedId && unpaidQuery.isSuccess && !unpaid.some((o) => o._id === selectedId)) {
      setSelectedId(null)
    }
  }, [unpaid, selectedId, unpaidQuery.isSuccess])

  const remaining = receipt?.remainingBalance ?? 0
  const splitAmount = useMemo(
    () => (splitCount > 1 ? Math.floor(remaining / splitCount) : remaining),
    [remaining, splitCount],
  )

  const handlePay = () => {
    const parsed = customAmount ? Number(customAmount) : null
    if (parsed !== null && (!Number.isFinite(parsed) || parsed <= 0)) {
      toast.error("Summa 0 dan katta bo'lishi kerak")
      return
    }
    if (parsed !== null && parsed > remaining) {
      toast.error(`Summa qolgan balansdan (${formatSom(remaining)}) katta bo'lishi mumkin emas`)
      return
    }
    paymentMutation.mutate(parsed)
  }

  return (
    <div>
      <PageHeader title="Kassa" subtitle="To'lanmagan buyurtmalarni yakunlash" />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* To'lanmagan buyurtmalar ro'yxati */}
        <Card padded={false} className="overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              To'lanmagan buyurtmalar
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
                title="Hammasi to'langan"
                description="Hozircha to'lanmagan buyurtma yo'q."
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
                  }}
                  className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 dark:border-slate-800 ${
                    selectedId === order._id
                      ? 'bg-indigo-50 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white">
                      Stol {order.table?.number ?? '—'}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {order.waiter?.name ?? '—'} · {formatTime(order.createdAt)}
                    </p>
                    <Badge variant={ORDER_STATUS_TONE[order.status]} className="mt-1">
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
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

        {/* Chek va to'lov */}
        {!selectedId ? (
          <Card>
            <EmptyState
              icon={ReceiptIcon}
              title="Buyurtma tanlanmagan"
              description="Chapdagi ro'yxatdan buyurtmani tanlang."
            />
          </Card>
        ) : receiptQuery.isLoading ? (
          <Card>
            <Skeleton className="h-72 w-full" />
          </Card>
        ) : receiptQuery.isError ? (
          <Card>
            <p className="text-sm text-rose-600">
              {apiErrorMessage(receiptQuery.error, "Chekni yuklab bo'lmadi")}
            </p>
          </Card>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
            {/* Chek */}
            <Card id="receipt-print-area">
              <div className="mb-4 flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Stol {receipt?.order?.table?.number ?? '—'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Ofitsiant: {receipt?.order?.waiter?.name ?? '—'} ·{' '}
                    {formatTime(receipt?.order?.createdAt)}
                  </p>
                </div>
                <Badge variant={receipt?.isPaid ? 'success' : 'warning'}>
                  {receipt?.isPaid ? "To'langan" : "To'lanmagan"}
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
                <Row label="Buyurtma summasi" value={formatSom(receipt?.order?.totalAmount)} />
                <Row label="To'langan" value={formatSom(receipt?.paidTotal)} />
                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900 dark:border-slate-800 dark:text-white">
                  <span>Qolgan</span>
                  <span>{formatSom(remaining)}</span>
                </div>
              </div>

              {receipt?.payments?.length > 0 && (
                <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                  <h3 className="mb-2 text-xs font-semibold text-slate-500">To'lovlar tarixi</h3>
                  <div className="space-y-1">
                    {receipt.payments.map((payment) => (
                      <div key={payment._id} className="flex justify-between text-xs text-slate-500">
                        <span>
                          {PAYMENT_METHOD_LABELS[payment.method] ?? payment.method} ·{' '}
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
                To'lov usuli
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
                      <span className="text-xs">{PAYMENT_METHOD_LABELS[value]}</span>
                    </button>
                  )
                })}
              </div>

              {/* Hisobni bo'lish — backend bir buyurtmaga bir nechta to'lovni
                  qo'llab-quvvatlaydi, shuning uchun har bir ulush alohida yoziladi. */}
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <Users className="h-3.5 w-3.5" /> Hisobni bo'lish
                </p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setSplitCount(num)
                        setCustomAmount(num > 1 ? String(Math.floor(remaining / num)) : '')
                      }}
                      className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-bold transition ${
                        splitCount === num
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                          : 'border border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                {splitCount > 1 && (
                  <p className="mt-2 text-xs text-slate-500">
                    Har biriga: <strong>{formatSom(splitAmount)}</strong> — har ulush alohida
                    to'lov sifatida yoziladi.
                  </p>
                )}
              </div>

              <Input
                label="To'lov summasi"
                type="number"
                min={1}
                max={remaining}
                placeholder={`Bo'sh qoldirilsa: ${formatSom(remaining)}`}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />

              <Button
                className="w-full"
                disabled={remaining <= 0}
                isLoading={paymentMutation.isPending}
                onClick={handlePay}
              >
                {remaining <= 0 ? "To'liq to'langan" : "To'lovni qabul qilish"}
              </Button>

              <Button variant="secondary" className="w-full" onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Chekni chop etish
              </Button>
            </Card>
          </div>
        )}
      </div>
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
