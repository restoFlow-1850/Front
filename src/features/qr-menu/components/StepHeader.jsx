import { FiCheck } from 'react-icons/fi'

const STEPS = [
  { key: 'hall', label: 'Zal' },
  { key: 'menu', label: 'Menyu' },
  { key: 'confirm', label: 'Tasdiqlash' },
]

export default function StepHeader({ current }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current)

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-between px-2">
      {STEPS.map((step, i) => {
        const done = i < currentIndex
        const active = i === currentIndex
        return (
          <div key={step.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  done
                    ? 'bg-[#C89B5E] text-[#2a0e10]'
                    : active
                      ? 'bg-[#C89B5E] text-[#2a0e10] ring-4 ring-[#C89B5E]/20'
                      : 'bg-[#3a1a1c] text-[#8a7373]'
                }`}
              >
                {done ? <FiCheck /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${active ? 'text-[#D9A968]' : 'text-[#8a7373]'}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-2 mb-4 h-0.5 flex-1 rounded transition-colors ${
                  done ? 'bg-[#C89B5E]' : 'bg-[#3a1a1c]'
                }`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
