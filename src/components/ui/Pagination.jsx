import { ChevronLeft, ChevronRight } from '../../lib/Icons';

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Oldingi sahifa"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        aria-label="Keyingi sahifa"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
