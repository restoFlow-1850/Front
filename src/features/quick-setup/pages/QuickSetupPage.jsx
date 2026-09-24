import { useState } from 'react'
import { Sparkles, Building2, FileSpreadsheet, Grid3X3, QrCode, Users, CheckCircle2 } from 'lucide-react'
import Step1RestaurantInfo from '../components/Step1RestaurantInfo'
import Step2ExcelMenu from '../components/Step2ExcelMenu'
import Step3HallsTables from '../components/Step3HallsTables'
import Step4QrPackage from '../components/Step4QrPackage'
import Step5StaffAccounts from '../components/Step5StaffAccounts'
import Step6Success from '../components/Step6Success'

const WIZARD_STEPS = [
  { id: 1, label: 'Restoran', icon: Building2 },
  { id: 2, label: 'Menyu (Excel)', icon: FileSpreadsheet },
  { id: 3, label: 'Stollar', icon: Grid3X3 },
  { id: 4, label: 'QR Paket', icon: QrCode },
  { id: 5, label: 'Xodimlar', icon: Users },
]

export default function QuickSetupPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [wizardData, setWizardData] = useState({})

  const handleNextStep = (stepData) => {
    setWizardData((prev) => ({ ...prev, ...stepData }))
    setCurrentStep((prev) => prev + 1)
  }

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1))
  }

  const handleReset = () => {
    setWizardData({})
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen bg-[#140a0b] text-gray-100 p-4 sm:p-6 lg:p-8">
      {/* Header Banner */}
      <div className="max-w-4xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center gap-2 bg-[#C89B5E]/15 border border-[#C89B5E]/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-[#C89B5E] mb-3">
          <Sparkles className="w-4 h-4" />
          ABDUGANI — 10 DAQIQADA YANGI RESTORAN (SEHRGAR)
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Restoranni 10 Daqiqada To'liq Ishga Tushirish
        </h1>
        <p className="text-sm text-gray-400 mt-1 max-w-xl mx-auto">
          Qo'lda hech narsa qilmasdan, restoran ma'lumotlari, menyu, stollar, QR paket va xodim akkauntlarini ketma-ket avtomatik sozlang.
        </p>
      </div>

      {/* Wizard Step Progress Indicator */}
      {currentStep <= 5 && (
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 -z-0" />
            
            {WIZARD_STEPS.map((s) => {
              const Icon = s.icon
              const isDone = s.id < currentStep
              const isActive = s.id === currentStep

              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/50'
                        : isActive
                          ? 'bg-[#C89B5E] text-[#1e1112] ring-4 ring-[#C89B5E]/30 shadow-lg'
                          : 'bg-[#221314] text-gray-500 border border-gray-800'
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-2 hidden sm:block ${
                      isActive ? 'text-[#C89B5E]' : isDone ? 'text-emerald-400' : 'text-gray-500'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step Components Render */}
      <div className="transition-all duration-300">
        {currentStep === 1 && (
          <Step1RestaurantInfo data={wizardData} onNext={handleNextStep} />
        )}
        {currentStep === 2 && (
          <Step2ExcelMenu data={wizardData} onNext={handleNextStep} onPrev={handlePrevStep} />
        )}
        {currentStep === 3 && (
          <Step3HallsTables data={wizardData} onNext={handleNextStep} onPrev={handlePrevStep} />
        )}
        {currentStep === 4 && (
          <Step4QrPackage data={wizardData} onNext={handleNextStep} onPrev={handlePrevStep} />
        )}
        {currentStep === 5 && (
          <Step5StaffAccounts data={wizardData} onNext={handleNextStep} onPrev={handlePrevStep} />
        )}
        {currentStep === 6 && (
          <Step6Success wizardData={wizardData} onReset={handleReset} />
        )}
      </div>
    </div>
  )
}
