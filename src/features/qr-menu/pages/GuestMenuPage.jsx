import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { User, UtensilsCrossed, Sparkles } from 'lucide-react'

import {
  createGuestReservation,
  getPublicCategories,
  getPublicProducts,
  getTableAvailability,
} from '../api'
import StepHeader from '../components/StepHeader'
import HallStep from '../components/HallStep'
import { buildTimeSlots, toDateInputValue } from '../lib/time'
import MenuStep from '../components/MenuStep'
import ConfirmStep from '../components/ConfirmStep'
import SuccessStep from '../components/SuccessStep'
import LanguageSwitcher from '../../../components/common/LanguageSwitcher'

const PHONE_RE = /^[+\d][\d\s-]{6,17}$/

function initialTimeFor(dateStr) {
  const slots = buildTimeSlots(dateStr)
  return slots[0] || ''
}

export default function GuestMenuPage() {
  const { t } = useTranslation()
  const [step, setStep] = useState('hall')

  // Zal — sana/vaqt/mehmonlar va stollar
  const [date, setDate] = useState(() => toDateInputValue(new Date()))
  const [time, setTime] = useState(() => initialTimeFor(toDateInputValue(new Date())))
  const [guests, setGuests] = useState(2)
  const [tables, setTables] = useState([])
  const [tablesLoading, setTablesLoading] = useState(true)
  const [selectedTable, setSelectedTable] = useState(null)

  // Menyu
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [cart, setCart] = useState({})

  // Tasdiqlash
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reservation, setReservation] = useState(null)

  useEffect(() => {
    const slots = buildTimeSlots(date)
    if (!slots.includes(time)) {
      setTime(slots[0] || '')
    }
  }, [date])

  const isoDateTime = useMemo(() => {
    if (!date || !time) return null
    return new Date(`${date}T${time}:00`).toISOString()
  }, [date, time])

  const fetchAvailability = useCallback(async () => {
    if (!isoDateTime) return
    setTablesLoading(true)
    try {
      const res = await getTableAvailability(isoDateTime)
      const payload = res.data?.data ?? res.data
      setTables(payload.tables ?? [])
    } catch {
      toast.error(t('kitchen.loadFailed'))
    } finally {
      setTablesLoading(false)
    }
  }, [isoDateTime, t])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  useEffect(() => {
    if (step !== 'hall') return
    setSelectedTable((prev) => {
      if (!prev) return prev
      const fresh = tables.find((t) => t._id === prev._id)
      return fresh && !fresh.isReserved ? fresh : null
    })
  }, [tables, step])

  useEffect(() => {
    setMenuLoading(true)
    Promise.all([getPublicCategories(), getPublicProducts()])
      .then(([catRes, prodRes]) => {
        const catPayload = catRes.data?.data ?? catRes.data
        const prodPayload = prodRes.data?.data ?? prodRes.data
        setCategories((catPayload.categories ?? []).filter((c) => c.isActive !== false))
        setProducts(prodPayload.products ?? [])
      })
      .catch(() => toast.error(t('kitchen.loadFailed')))
      .finally(() => setMenuLoading(false))
  }, [t])

  const handleQtyChange = useCallback((product, qty) => {
    setCart((prev) => {
      const next = { ...prev }
      if (qty <= 0) {
        delete next[product._id]
      } else {
        next[product._id] = { product, quantity: qty }
      }
      return next
    })
  }, [])

  const cartItems = useMemo(() => Object.values(cart), [cart])
  const cartCount = useMemo(() => cartItems.reduce((sum, i) => sum + i.quantity, 0), [cartItems])
  const cartTotal = useMemo(
    () => cartItems.reduce((sum, i) => sum + i.quantity * i.product.price, 0),
    [cartItems]
  )

  function validateConfirm() {
    const next = {}
    if (!customerName.trim()) next.customerName = t('reservations.customerName')
    if (!customerPhone.trim() || !PHONE_RE.test(customerPhone.trim())) {
      next.customerPhone = t('reservations.phone')
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit() {
    if (!validateConfirm() || !selectedTable || !isoDateTime) return

    setIsSubmitting(true)
    try {
      const res = await createGuestReservation({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        table: selectedTable._id,
        date: isoDateTime,
        guests,
        notes: notes.trim() || undefined,
        items: cartItems.map(({ product, quantity }) => ({ product: product._id, quantity })),
      })
      const payload = res.data?.data ?? res.data
      setReservation(payload.reservation)
      setTables((prev) =>
        prev.map((tbl) => (tbl._id === selectedTable._id ? { ...tbl, isReserved: true } : tbl))
      )
      fetchAvailability()
      setStep('success')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message
      if (status === 409) {
        toast.error(message || t('kitchen.loadFailed'))
        setStep('hall')
        setSelectedTable(null)
      } else {
        toast.error(message || t('kitchen.loadFailed'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetAll() {
    setStep('hall')
    setSelectedTable(null)
    setCart({})
    setCustomerName('')
    setCustomerPhone('')
    setNotes('')
    setErrors({})
    setReservation(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B0F17] via-[#0F172A] to-[#1E293B] text-slate-100">
      <header className="border-b border-slate-800/80 bg-[#0B0F17]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F97316] to-[#EA580C] text-white shadow-md shadow-orange-500/30">
              <UtensilsCrossed size={18} />
            </div>
            <div>
              <p className="text-lg font-black tracking-tight text-white">
                Resto<span className="text-[#F97316]">Flow</span>
              </p>
              <p className="text-[11px] font-bold text-slate-400">{t('qrMenu.reserveTable')}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-300 hover:border-orange-500/50 hover:text-white transition-colors"
            >
              <User size={14} className="text-[#F97316]" />
              <span>{t('auth.loginTitle')}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        {step !== 'success' && (
          <div className="mb-6">
            <StepHeader current={step} />
          </div>
        )}

        {step === 'hall' && (
          <HallStep
            date={date}
            time={time}
            guests={guests}
            onDateChange={setDate}
            onTimeChange={setTime}
            onGuestsChange={setGuests}
            tables={tables}
            isLoading={tablesLoading}
            selectedTable={selectedTable}
            onSelectTable={setSelectedTable}
            onNext={() => setStep('menu')}
          />
        )}

        {step === 'menu' && (
          <MenuStep
            categories={categories}
            products={products}
            isLoading={menuLoading}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            cart={cart}
            onQtyChange={handleQtyChange}
            cartCount={cartCount}
            cartTotal={cartTotal}
            onBack={() => setStep('hall')}
            onNext={() => setStep('confirm')}
          />
        )}

        {step === 'confirm' && (
          <ConfirmStep
            table={selectedTable}
            date={date}
            time={time}
            guests={guests}
            cartItems={cartItems}
            cartTotal={cartTotal}
            customerName={customerName}
            customerPhone={customerPhone}
            notes={notes}
            onNameChange={setCustomerName}
            onPhoneChange={setCustomerPhone}
            onNotesChange={setNotes}
            onBack={() => setStep('menu')}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            errors={errors}
          />
        )}

        {step === 'success' && (
          <SuccessStep
            reservation={reservation}
            table={selectedTable}
            date={date}
            time={time}
            onReset={resetAll}
          />
        )}
      </main>
    </div>
  )
}
