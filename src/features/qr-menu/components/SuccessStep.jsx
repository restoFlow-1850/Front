import { FiCalendar, FiCheck, FiClock, FiMapPin } from 'react-icons/fi'

export default function SuccessStep({ reservation, table, date, time, onReset }) {
  return (
    <div className="flex flex-col items-center gap-5 py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#16a34a]/15 text-[#4ade80]">
        <FiCheck size={32} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-[#E6DCDC]">Bron qabul qilindi!</h2>
        <p className="mt-1 max-w-sm text-sm text-[#9a8080]">
          Tez orada administrator siz bilan bog'lanib, bronni tasdiqlaydi. Hozircha holati:{' '}
          <span className="font-semibold text-[#f59e0b]">kutilmoqda</span>
        </p>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-2 rounded-2xl border border-[#4a1616] bg-[#1c0a0b] p-4 text-left shadow-sm">
        <div className="flex items-center gap-2 text-sm text-[#cbbcbc]">
          <FiMapPin className="text-[#D9A968]" /> Stol {table?.number} · {table?.capacity} kishilik
        </div>
        <div className="flex items-center gap-2 text-sm text-[#cbbcbc]">
          <FiCalendar className="text-[#D9A968]" /> {date}
        </div>
        <div className="flex items-center gap-2 text-sm text-[#cbbcbc]">
          <FiClock className="text-[#D9A968]" /> {time}
        </div>
        {reservation?._id && (
          <div className="mt-1 border-t border-dashed border-[#3a1a1c] pt-2 text-xs text-[#8a7373]">
            Bron raqami: {reservation._id.slice(-8).toUpperCase()}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onReset}
        className="rounded-lg bg-[#C89B5E] px-6 py-2.5 text-sm font-semibold text-[#2a0e10] shadow-sm transition hover:bg-[#D9A968]"
      >
        Yana bron qilish
      </button>
    </div>
  )
}
