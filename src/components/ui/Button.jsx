const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  ghost: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
};

const Button = ({ variant = 'primary', loading = false, disabled = false, className = '', children, ...rest }) => {
  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant] || VARIANTS.primary} ${className}`}
      {...rest}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;
