const variants = {
  primary:
    'bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white hover:from-[#EA580C] hover:to-orange-700 shadow-lg shadow-orange-500/25 active:scale-[0.98]',
  secondary:
    'bg-gray-100 text-[#111827] hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border border-[#E5E7EB] dark:border-gray-700',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/25 active:scale-[0.98]',
  ghost:
    'bg-transparent text-gray-700 hover:bg-orange-500/10 hover:text-[#F97316] dark:text-gray-200 dark:hover:bg-gray-800',
}

export default function Button({
  children,
  variant = 'primary',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? 'Yuklanmoqda...' : children}
    </button>
  )
}