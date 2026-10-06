/**
 * QuickSetupPage — «10 daqiqada yangi restoran» sehrgari.
 *
 * PR1: Asosiy yo'naltirish va localStorage state saqlash.
 * PR2: wizardParsers + testlar (Step3, Step5 parserlari).
 * PR3: QR PDF generatori (Step4).
 * PR4: To'liq Wizard UI (Step1-Step6 komponentlar).
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { readToken } from '../../auth/session'

const STORAGE_KEY_STEP = 'restoflow_onboarding_step'
const STORAGE_KEY_DATA = 'restoflow_onboarding_data'

export default function QuickSetupPage() {
  const navigate = useNavigate()
  const savedStep = localStorage.getItem(STORAGE_KEY_STEP)
  const savedData = (() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_DATA) || '{}')
    } catch {
      return {}
    }
  })()

  // Agar session yo'q bo'lsa — /start ga qaytaramiz
  useEffect(() => {
    if (!readToken('accessToken')) {
      navigate('/start', { replace: true })
    }
  }, [navigate])

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY_STEP)
    localStorage.removeItem(STORAGE_KEY_DATA)
    navigate('/start', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#140a0b] text-gray-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#1e1112] border border-[#C89B5E]/30 rounded-2xl p-8 text-center shadow-2xl">
        <div className="text-4xl mb-4">🚀</div>
        <h1 className="text-2xl font-extrabold text-white mb-2">
          10 Daqiqada Yangi Restoran
        </h1>
        <p className="text-sm text-gray-400 mb-6">
          Sehrgar yuklanmoqda...{' '}
          {savedStep && (
            <span className="text-[#C89B5E] font-semibold">
              {savedStep}-qadamdan davom etamiz
            </span>
          )}
        </p>
        {savedData.name && (
          <div className="bg-[#C89B5E]/10 border border-[#C89B5E]/30 rounded-xl p-3 mb-6 text-xs text-[#C89B5E] font-semibold">
            Restoran: {savedData.name}
          </div>
        )}
        <p className="text-xs text-gray-500 mb-4">
          To&apos;liq sehrgar tez orada qo&apos;shiladi (PR2–PR4).
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-gray-400 hover:text-red-400 underline"
        >
          Qayta boshlash
        </button>
      </div>
    </div>
  )
}
