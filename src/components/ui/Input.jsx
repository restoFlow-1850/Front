import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-gray-200">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full rounded-xl border border-[#E5E7EB] bg-[#FFFDF9] px-3.5 py-2.5 text-sm font-medium text-[#111827] placeholder:text-gray-400 outline-none transition-all
          focus:border-[#F97316] focus:ring-2 focus:ring-orange-100
          dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-orange-400 dark:focus:ring-orange-950
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : ''}
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-500">{error}</p>}
    </div>
  )
})

export default Input