import { forwardRef } from 'react'

const Input = forwardRef(function Input({ label, error, className = '', ...props }, ref) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full rounded-md border px-3 py-2 text-sm outline-none transition
          border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500
          dark:border-gray-600 dark:bg-gray-700 dark:text-white
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
        </div>
    )
})

export default Input