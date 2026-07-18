import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';
import OrderSummary from './OrderSummary';

const OrderConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  table,
  items,
  total,
  isSubmitting,
}) => {
  const [orderType, setOrderType] = useState('pickup');
  const [customerCount, setCustomerCount] = useState(1);

  const handleSubmit = () => {
    onConfirm({ orderType, customerCount });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Buyurtmani tasdiqlash">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">Stol</p>
          <p className="font-semibold text-gray-900 dark:text-white">{table ? `#${table.number}` : 'Belgilanmagan'}</p>
        </div>

        <div className="grid gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Buyurtma turi</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
          >
            <option value="pickup">Olish</option>
            <option value="delivery">Yetkazib berish</option>
            <option value="dine-in">Hovli ichida</option>
          </select>
        </div>

        <div className="grid gap-3">
          <label className="text-sm text-gray-600 dark:text-gray-300">Mijozlar soni</label>
          <input
            type="number"
            min={1}
            value={customerCount}
            onChange={(e) => setCustomerCount(Number(e.target.value))}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
          />
        </div>

        <OrderSummary total={total} itemsCount={items.length} />

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !table || items.length === 0}
            className="flex-1 rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Yuborilmoqda...' : 'Tasdiqlash'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default OrderConfirmModal;
