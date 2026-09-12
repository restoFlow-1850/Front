import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

export default function ErrorRestaurants({ message, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/20">
        <FiAlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-bold text-[#E6DCDC]">Xatolik yuz berdi</h3>
      <p className="mt-2 max-w-sm text-sm text-[#9a8080]">
        {message || "Restoranlarni yuklab bo'lmadi. Internet aloqasini tekshiring."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 flex items-center gap-2 rounded-lg bg-[#C89B5E] px-5 py-2.5 text-sm font-semibold text-[#2a0e10] transition hover:bg-[#D9A968]"
        >
          <FiRefreshCw className="h-4 w-4" />
          Qayta urinish
        </button>
      )}
    </div>
  )
}
