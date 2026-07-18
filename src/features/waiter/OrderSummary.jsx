import React from 'react';

const OrderSummary = ({ total, itemsCount }) => {
  return (
    <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Taomlar soni:</span>
        <span className="font-medium">{itemsCount} ta</span>
      </div>
      <div className="flex justify-between font-bold text-lg text-gray-800 dark:text-white mt-1">
        <span>Jami:</span>
        <span className="text-blue-600 dark:text-blue-400">
          {total.toLocaleString()} UZS
        </span>
      </div>
    </div>
  );
};

export default OrderSummary;