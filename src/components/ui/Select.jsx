import { forwardRef } from 'react'

const Select = forwardRef(function Select(
    { label, error, options = [], placeholder, className = '', ...props },
    ref,
) {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    {label}
                </label>
            )}
            <select
                ref={ref}
                className={`w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition
          focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500
          dark:border-slate-700 dark:bg-slate-800 dark:text-white
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500' : ''}
          ${className}`}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
        </div>
    )
})

export default Select
