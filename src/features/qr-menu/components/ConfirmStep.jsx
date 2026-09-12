import { FiCalendar, FiClock, FiMapPin, FiUsers } from 'react-icons/fi'
import { formatSum } from '../api'

export default function ConfirmStep({
  table,
  date,
  time,
  guests,
  cartItems,
  cartTotal,
  customerName,
  customerPhone,
  notes,
  onNameChange,
  onPhoneChange,
  onNotesChange,
  onBack,
  onSubmit,
  isSubmitting,
  errors,
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-bold text-[#E6DCDC]">Bronni tasdiqlang</h2>
        <p className="text-sm text-[#9a8080]">
          Ma'lumotlaringizni kiriting — administrator qisqa vaqt ichida bronni tasdiqlaydi.
        </p>
      </div>

      <div className="rounded-2xl border border-[#4a1616] bg-[#1c0a0b] p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div className="flex items-center gap-2 text-[#cbbcbc]">
            <FiMapPin className="text-[#D9A968]" /> Stol {table?.number}
          </div>
          <div className="flex items-center gap-2 text-[#cbbcbc]">
            <FiCalendar className="text-[#D9A968]" /> {date}
          </div>
          <div className="flex items-center gap-2 text-[#cbbcbc]">
            <FiClock className="text-[#D9A968]" /> {time}
          </div>
          <div className="flex items-center gap-2 text-[#cbbcbc]">
            <FiUsers className="text-[#D9A968]" /> {guests} kishi
          </div>
        </div>

        {cartItems.length > 0 && (
          <div className="mt-4 border-t border-[#3a1a1c] pt-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#8a7373]">
              Oldindan buyurtma
            </p>
            <ul className="flex flex-col gap-1.5">
              {cartItems.map(({ product, quantity }) => (
                <li
                  key={product._id}
                  className="flex items-center justify-between text-sm text-[#cbbcbc]"
                >
                  <span>
                    {product.name} <span className="text-[#8a7373]">× {quantity}</span>
                  </span>
                  <span className="font-medium text-[#E6DCDC]">
                    {formatSum(product.price * quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex items-center justify-between border-t border-dashed border-[#3a1a1c] pt-2 text-sm font-bold text-[#E6DCDC]">
              <span>Jami</span>
              <span className="text-[#D9A968]">{formatSum(cartTotal)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[#4a1616] bg-[#1c0a0b] p-4 shadow-sm">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#cbbcbc]">Ismingiz</span>
          <input
            value={customerName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Ism Familiya"
            className={`rounded-lg border bg-[#150708] px-3 py-2 text-sm text-[#E6DCDC] placeholder:text-[#6b5757] outline-none focus:border-[#C89B5E] focus:ring-1 focus:ring-[#C89B5E] ${
              errors.customerName ? 'border-red-500' : 'border-[#4a1616]'
            }`}
          />
          {errors.customerName && <span className="text-xs text-red-400">{errors.customerName}</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#cbbcbc]">Telefon raqam</span>
          <input
            value={customerPhone}
            onChange={(e) => onPhoneChange(e.target.value)}
            placeholder="+998 90 123 45 67"
            className={`rounded-lg border bg-[#150708] px-3 py-2 text-sm text-[#E6DCDC] placeholder:text-[#6b5757] outline-none focus:border-[#C89B5E] focus:ring-1 focus:ring-[#C89B5E] ${
              errors.customerPhone ? 'border-red-500' : 'border-[#4a1616]'
            }`}
          />
          {errors.customerPhone && (
            <span className="text-xs text-red-400">{errors.customerPhone}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#cbbcbc]">
            Izoh <span className="text-[#8a7373]">(ixtiyoriy)</span>
          </span>
          <textarea
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={2}
            placeholder="Masalan: derazaga yaqin joy, tug'ilgan kun tortasi kerak..."
            className="resize-none rounded-lg border border-[#4a1616] bg-[#150708] px-3 py-2 text-sm text-[#E6DCDC] placeholder:text-[#6b5757] outline-none focus:border-[#C89B5E] focus:ring-1 focus:ring-[#C89B5E]"
          />
        </label>
      </div>

      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-[#cbbcbc] hover:bg-[#2a1315]"
        >
          Orqaga
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="rounded-lg bg-[#C89B5E] px-6 py-2.5 text-sm font-semibold text-[#2a0e10] shadow-sm transition hover:bg-[#D9A968] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Yuborilmoqda...' : 'Bronni tasdiqlash'}
        </button>
      </div>
    </div>
  )
}
