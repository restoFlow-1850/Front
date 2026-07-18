import React, { useState } from 'react';
import TableMap2D from './TableMap2D';
import Waiter from '../../waiter/Waiter';
import { useTables } from '../../../hooks/useTables';
import { TABLE_STATUS } from '../../../constants/tableStatus';

const Tables = () => {
  const { tables, changeStatus } = useTables();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showWaiter, setShowWaiter] = useState(false);

  const handleTableClick = (table) => {
    setSelectedTable(table);

    if (table.status === TABLE_STATUS.AVAILABLE) {
      changeStatus(table.id, TABLE_STATUS.OCCUPIED);
      setShowWaiter(true);
    } else if (table.status === TABLE_STATUS.OCCUPIED || table.status === TABLE_STATUS.RESERVED) {
      setShowWaiter(true);
    } else {
      alert('Bu stol hozir tozalanmoqda');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 2D Stol xaritasi — yuklanish va xatolik holatini o'zi boshqaradi,
          shuningdek har bir stol uchun ko'chirish oynasini ham ichida ochadi */}
      <TableMap2D onTableClick={handleTableClick} selectedTable={selectedTable} />

      {/* Tezkor tugmalar */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => {
            const available = tables.find((t) => t.status === TABLE_STATUS.AVAILABLE);
            if (available) {
              handleTableClick(available);
            } else {
              alert("Bo'sh stollar mavjud emas");
            }
          }}
          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
        >
          ➕ Yangi buyurtma
        </button>
      </div>

      {/* Modal */}
      {showWaiter && selectedTable && (
        <Waiter
          table={selectedTable}
          onClose={() => {
            setShowWaiter(false);
            setSelectedTable(null);
          }}
        />
      )}
    </div>
  );
};

export default Tables;