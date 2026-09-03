// Smena boshqaruv paneli — ochish, yopish, Z-Report ko'rish.
// Backend: GET /api/shifts/current, POST /api/shifts/open, POST /api/shifts/close
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import {
  AlertTriangle,
  Banknote,
  CheckCircle,
  Clock,
  Lock,
  Unlock,
  Wallet,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { getCurrentShift, openShift, closeShift } from '../api'
import { unwrap, apiErrorMessage, formatSom, formatDateTime } from '../../../lib/api'
import { Button, Card, Input, Skeleton } from '../../../components/ui'
import ZReportModal from './ZReportModal'

export default function ShiftPanel({ onShiftChange }) {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [showOpenForm, setShowOpenForm] = useState(false)
  const [showCloseForm, setShowCloseForm] = useState(false)
  const [showZReport, setShowZReport] = useState(false)
  const [openingBalance, setOpeningBalance] = useState('')
  const [closingBalance, setClosingBalance] = useState('')

  // Joriy smena — GET /api/shifts/current
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

  // Smena ochish — POST /api/shifts/open
  const openMutation = useMutation({
    mutationFn: (payload) => openShift(payload),
    onMutate: async () => {
      setShowOpenForm(false)
      setOpeningBalance('')
    },
    onSuccess: (res) => {
      toast.success(t('shift.shiftOpenSuccess'))
      queryClient.setQueryData(['shift', 'current'], unwrap(res, 'shift'))
      queryClient.invalidateQueries({ queryKey: ['shift'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      onShiftChange?.(unwrap(res, 'shift'))
    },
    onError: (err) => {
      setShowOpenForm(true)
      toast.error(apiErrorMessage(err, t('shift.shiftOpenFailed')))
    },
  })

  // Smena yopish — POST /api/shifts/close
  const closeMutation = useMutation({
    mutationFn: (payload) => closeShift(payload),
    onMutate: async () => {
      setShowCloseForm(false)
      setClosingBalance('')
    },
    onSuccess: () => {
      toast.success(t('shift.shiftCloseSuccess'))
      queryClient.setQueryData(['shift', 'current'], null)
      queryClient.invalidateQueries({ queryKey: ['shift'] })
      queryClient.invalidateQueries({ queryKey: ['reports'] })
      onShiftChange?.(null)
      setShowZReport(true)
    },
    onError: (err) => {
      setShowCloseForm(true)
      toast.error(apiErrorMessage(err, t('shift.shiftCloseFailed')))
    },
  })

  const shift = shiftQuery.data
  const isOpen = shift && shift.status === 'open'

  const handleOpen = () => {
    const balance = openingBalance.trim() !== '' ? Number(openingBalance) : 0
    if (!Number.isFinite(balance) || balance < 0) {
      toast.error(t('shift.invalidBalance', { defaultValue: "Boshlang'ich balans manfiy bo'lishi mumkin emas" }))
      return
    }
    openMutation.mutate({ startCash: balance, openingBalance: balance })
  }

  const handleClose = () => {
    const balance = closingBalance.trim() !== '' ? Number(closingBalance) : 0
    if (!Number.isFinite(balance) || balance < 0) {
      toast.error(t('shift.invalidBalance', { defaultValue: "Yakuniy balans manfiy bo'lishi mumkin emas" }))
      return
    }
    closeMutation.mutate({ actualCash: balance, closingBalance: balance })
  }

  // Yuklanmoqda
  if (shiftQuery.isLoading) {
    return (
      <Card className="space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-32" />
      </Card>
    )
  }

  // Xatolik
  if (shiftQuery.isError) {
    return (
      <Card className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/40">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          <div>
            <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
              {t('kitchen.loadFailed')}
            </p>
            <p className="text-xs text-rose-600 dark:text-rose-400">
              {apiErrorMessage(shiftQuery.error)}
            </p>
          </div>
          <Button
            variant="secondary"
            className="ml-auto"
            onClick={() => shiftQuery.refetch()}
          >
            {t('refresh')}
          </Button>
        </div>
      </Card>
    )
  }

  // Smena ochilmagan — ochish formasi
  if (!isOpen) {
    return (
      <>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400">
              <Lock className="h-6 w-6" />
            </span>
            <div className="flex-1">
              <h3 className="text-base font-bold text-amber-800 dark:text-amber-200">
                {t('shift.shiftClosed')}
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                {t('shift.shiftNotOpenDesc')}
              </p>

              {showOpenForm ? (
                <div className="mt-4 space-y-3">
                  <Input
                    label={t('shift.startBalanceLabel')}
                    type="number"
                    min={0}
                    placeholder="0"
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setShowOpenForm(false)
                        setOpeningBalance('')
                      }}
                    >
                      {t('cancel')}
                    </Button>
                    <Button
                      isLoading={openMutation.isPending}
                      onClick={handleOpen}
                    >
                      <Unlock className="mr-2 h-4 w-4" /> {t('shift.openShift')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  className="mt-3"
                  onClick={() => setShowOpenForm(true)}
                >
                  <Unlock className="mr-2 h-4 w-4" /> {t('shift.openShift')}
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Yopilgan smena Z-Reportini ko'rish uchun */}
        <ZReportModal
          isOpen={showZReport}
          onClose={() => setShowZReport(false)}
          shiftId={shift?._id}
        />
      </>
    )
  }

  // Smena ochiq — holat ko'rsatish + yopish
  const shiftDuration = shift.openedAt
    ? formatDuration(new Date(shift.openedAt))
    : '—'

  return (
    <>
      <Card className="border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40">
        <div className="flex items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400">
            <Unlock className="h-6 w-6" />
          </span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-emerald-800 dark:text-emerald-200">
                {t('shift.shiftOpen')}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-200 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-800 dark:text-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {t('shift.active')}
              </span>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <ShiftStat
                icon={Clock}
                label={t('shift.openedAt')}
                value={formatDateTime(shift.openedAt)}
              />
              <ShiftStat
                icon={Wallet}
                label={t('shift.initialBalance')}
                value={formatSom(shift.openingBalance ?? shift.startCash ?? 0)}
              />
              <ShiftStat
                icon={Banknote}
                label={t('shift.totalRevenue')}
                value={formatSom(shift.totalIncome ?? shift.totalRevenue ?? 0)}
              />
              <ShiftStat
                icon={Clock}
                label={t('shift.duration')}
                value={shiftDuration}
              />
            </div>

            {(shift.user || shift.cashier) && (
              <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                {t('shift.cashier')}: {(shift.user || shift.cashier)?.name ?? (shift.user || shift.cashier)?.username ?? '—'}
              </p>
            )}

            {showCloseForm ? (
              <div className="mt-4 space-y-3 border-t border-emerald-200 pt-4 dark:border-emerald-800">
                <Input
                  label={t('shift.endBalanceLabel')}
                  type="number"
                  min={0}
                  placeholder="0"
                  value={closingBalance}
                  onChange={(e) => setClosingBalance(e.target.value)}
                />
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {t('shift.endBalanceHint')}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowCloseForm(false)
                      setClosingBalance('')
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    variant="danger"
                    isLoading={closeMutation.isPending}
                    onClick={handleClose}
                  >
                    <Lock className="mr-2 h-4 w-4" /> {t('shift.closeShift')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  onClick={() => setShowCloseForm(true)}
                >
                  <Lock className="mr-2 h-4 w-4" /> {t('shift.closeShift')}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setShowZReport(true)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> {t('shift.zReport')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <ZReportModal
        isOpen={showZReport}
        onClose={() => setShowZReport(false)}
        shiftId={shift?._id}
      />
    </>
  )
}

function ShiftStat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      <div>
        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70">{label}</p>
        <p className="font-semibold text-emerald-800 dark:text-emerald-200">{value}</p>
      </div>
    </div>
  )
}

/** Millisekundlarni soat:dakika ko'rinishiga aylantiradi */
function formatDuration(ms) {
  if (!ms) return '—'
  const diff = Date.now() - new Date(ms).getTime()
  if (diff < 0) return '—'
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  if (hours > 0) return `${hours} soat ${minutes} daqiqa`
  return `${minutes} daqiqa`
}
