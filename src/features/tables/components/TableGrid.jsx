import React from 'react';
import TableCard from './TableCard';

const TableGrid = ({ tables, onTableClick, selectedTable }) => {
  if (tables.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-500">
        <span className="text-4xl mb-2">🪑</span>
        <p className="text-lg">Bu zonada stollar mavjud emas</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onClick={() => onTableClick(table)}
          isSelected={selectedTable?.id === table.id}
        />
      ))}
    </div>
  );
};

export default TableGrid;