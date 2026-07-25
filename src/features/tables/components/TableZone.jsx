import TableGrid from './TableGrid';

const TableZone = ({ zone, tables, onTableClick, selectedTable }) => {
  if (tables.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
          {zone}
        </h2>
        <span className="text-sm text-gray-400">({tables.length} ta stol)</span>
      </div>
      <TableGrid
        tables={tables}
        onTableClick={onTableClick}
        selectedTable={selectedTable}
      />
    </div>
  );
};

export default TableZone;