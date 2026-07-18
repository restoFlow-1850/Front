const Input = ({ label, error, className = '', ...rest }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">{label}</label>
      )}
      <input
        className={`w-full rounded-2xl border px-4 py-3 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'} ${className}`}
        {...rest}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;
