import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { TABLE_STATUS, TABLE_STATUS_LABELS } from '../../../constants/tableStatus';

const EditTableModal = ({ table, onClose, onSave }) => {
  const [status, setStatus] = useState(table.status);

  const handleSave = () => {
    onSave({ ...table, status });
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Stol #${table.number} holatini tahrirlash`}>
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm text-gray-600 dark:text-gray-300 mb-2">Holat</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm text-gray-900 dark:text-white"
          >
            {Object.entries(TABLE_STATUS_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="flex-1 rounded-2xl bg-blue-600 text-white px-4 py-3 text-sm font-semibold hover:bg-blue-700 transition"
          >
            Saqlash
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditTableModal;
