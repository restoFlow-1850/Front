const Badge = ({ status, label, color }) => {
  const colors = {
    available: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    occupied: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    reserved: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    cleaning: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };

  // `color` (hex) is for statuses outside the built-in table-status palette above,
  // e.g. reservation statuses — rendered as a tinted badge instead of a Tailwind class.
  if (color) {
    return (
      <span
        className="px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: `${color}1A`, color }}
      >
        {label || status}
      </span>
    );
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.available}`}>
      {label || status}
    </span>
  );
};

export default Badge;