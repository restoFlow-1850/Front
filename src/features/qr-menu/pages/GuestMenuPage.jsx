import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { FiUser } from 'react-icons/fi'

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

const PHONE_RE = /^[+\d][\d\s-]{6,17}$/

function initialTimeFor(dateStr) {
  const slots = buildTimeSlots(dateStr)
  return slots[0] || ''
}

export default function GuestMenuPage() {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      toast.error("Zal plani yuklanmadi. Sahifani yangilab ko'ring.")
    } finally {
      setTablesLoading(false)
    }
  }, [isoDateTime])

  useEffect(() => {
    fetchAvailability()
  }, [fetchAvailability])

  useEffect(() => {
    // Faqat "Zal" bosqichida ishlaydi — stol boshqa mehmon tomonidan band
    // qilinsa, tanlovni tozalaydi. Bron allaqachon yuborilgandan keyin (menyu/
    // tasdiqlash/muvaffaqiyat bosqichlarida) tables yangilanishi tanlangan
    // stolni "yo'qotib qo'ymasligi" kerak — aks holda muvaffaqiyat ekranida
    // stol raqami yo'qolib qoladi.
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
      .catch(() => toast.error('Menyuni yuklab bo\'lmadi'))
      .finally(() => setMenuLoading(false))
  }, [])

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
    if (!customerName.trim()) next.customerName = 'Ismingizni kiriting'
    if (!customerPhone.trim() || !PHONE_RE.test(customerPhone.trim())) {
      next.customerPhone = "Telefon raqamni to'g'ri kiriting"
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
      // Bron qilingan stolni darhol "band" deb belgilaymiz (server bilan ham
      // fon rejimida qayta tekshiramiz) — aks holda foydalanuvchi "Yana bron
      // qilish"ni bosganda o'sha stol hali ham bo'sh ko'rinib qolar edi.
      setTables((prev) =>
        prev.map((t) => (t._id === selectedTable._id ? { ...t, isReserved: true } : t))
      )
      fetchAvailability()
      setStep('success')
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message
      if (status === 409) {
        toast.error(message || 'Bu stol tanlangan vaqtda band bo\'lib qoldi. Boshqa vaqt yoki stol tanlang.')
        setStep('hall')
        setSelectedTable(null)
      } else {
        toast.error(message || 'Bronni yuborib bo\'lmadi. Qayta urinib ko\'ring.')
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#2a0e10_0%,#140708_100%)]">
      <header className="border-b border-[#4a1616] bg-[#140708]/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-lg font-extrabold tracking-tight text-[#D9A968]">RestoFlow</p>
            <p className="text-xs text-[#9a8080]">Stol bron qilish</p>
          </div>
          <Link
            to="/login"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-[#cbbcbc] hover:bg-[#2a1315]"
          >
            <FiUser size={14} /> Xodim uchun kirish
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
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
