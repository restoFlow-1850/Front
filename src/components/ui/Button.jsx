const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
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
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
            {...props}
        >
            {isLoading ? 'Yuklanmoqda...' : children}
        </button>
    )
}