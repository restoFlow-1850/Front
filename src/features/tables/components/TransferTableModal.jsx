import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import { TRANSFERABLE_TARGET_STATUSES } from '../../../constants/tableStatus';

const TransferTableModal = ({ sourceTable, tables, onTransfer, onClose }) => {
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!sourceTable) {
    return null;
  }

  const availableTables = (tables || []).filter(
    (t) => t.id !== sourceTable.id && TRANSFERABLE_TARGET_STATUSES.includes(t.status)
  );

  const handleTransfer = async () => {
    if (!selectedTarget) {
      alert('Iltimos, maqsadli stolni tanlang');
      return;
    }

    setLoading(true);
    try {
      await onTransfer(sourceTable.id, selectedTarget.id);
      alert(`✅ Stol #${sourceTable.number} → Stol #${selectedTarget.number} ko'chirildi`);
      onClose();
    } catch (error) {
      console.error('Stol ko\'chirishda xatolik:', error);
      alert('❌ Stol ko\'chirishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title="🔄 Stolni ko'chirish">
      <div className="p-4">
        {/* Manba stol */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-gray-700 dark:text-gray-300">
            <strong>Stol #{sourceTable.number ?? '?'}</strong> dan ko'chirish
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Zona: {sourceTable.zone || "yo'q"} · {sourceTable.capacity ?? '?'} kishi
          </p>
        </div>

        {/* Maqsad stol */}
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Maqsadli stolni tanlang:
        </p>

        {availableTables.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-2xl mb-2">😕</p>
            <p>Bo'sh stollar mavjud emas</p>
            <p className="text-sm mt-1">Iltimos, boshqa stolni bo'shating</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
            {availableTables.map(table => (
              <button
                key={table.id}
                type="button"
                onClick={() => setSelectedTarget(table)}
                disabled={loading}
                className={`
                  p-3 rounded-lg border-2 text-left transition-all
                  ${selectedTarget?.id === table.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                  }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                <div className="font-semibold text-gray-800 dark:text-white">
                  Stol #{table.number ?? '?'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {table.zone || "Zona yo'q"} · {table.capacity ?? '?'} kishi
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Tugmalar */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={!selectedTarget || availableTables.length === 0 || loading}
            className={`
              flex-1 px-4 py-2 rounded-lg text-white transition-colors flex items-center justify-center gap-2
              ${selectedTarget && availableTables.length > 0 && !loading
                ? 'bg-blue-500 hover:bg-blue-600'
                : 'bg-gray-400 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                Ko'chirilmoqda...
              </>
            ) : (
              'Ko\'chirish'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TransferTableModal;