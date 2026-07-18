import React from 'react';
import Badge from '../../../components/ui/Badge';
import { TABLE_STATUS_LABELS } from '../../../constants/tableStatus';

const TableCard = ({ table, onClick, isSelected }) => {
  const statusColors = {
    available: 'border-green-500 bg-green-50 dark:bg-green-900/10',
    occupied: 'border-red-500 bg-red-50 dark:bg-red-900/10',
    reserved: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10',
    cleaning: 'border-gray-400 bg-gray-50 dark:bg-gray-800',
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        hover:shadow-xl hover:scale-105
        ${statusColors[table.status] || 'border-gray-300 bg-white dark:bg-gray-800'}
        ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
      `}
    >
      {/* Stol raqami */}
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-800 dark:text-white">
          {table.number}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {table.zone}
        </div>
        <div className="text-xs text-gray-400 dark:text-gray-500">
          {table.capacity} kishi
        </div>
      </div>

      {/* Holat */}
      <div className="absolute top-2 right-2">
        <Badge status={table.status} label={TABLE_STATUS_LABELS[table.status]} />
      </div>

      {/* Buyurtma ID */}
      {table.currentOrderId && (
        <div className="absolute bottom-2 left-2 text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full">
          🧾 #{table.currentOrderId.slice(0, 6)}
        </div>
      )}

      {/* Bron qilgan kishi */}
      {table.reservedBy && (
        <div className="absolute bottom-2 right-2 text-xs bg-black/10 dark:bg-white/10 px-2 py-1 rounded-full">
          👤 {table.reservedBy}
        </div>
      )}
    </div>
  );
};

export default TableCard;