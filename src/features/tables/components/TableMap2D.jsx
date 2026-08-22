import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowRightLeft, Pencil } from '../../../lib/Icons';
import { getTables, updateTable } from '../api';
import { unwrapList } from '../../../lib/api';
import { TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_COLORS } from '../../../constants/tableStatus';
import EditTableModal from './EditTableModal';
import TransferTableModal from './TransferTableModal';
import OccupyTableModal from './OccupyTableModal';

const ZONE_FILTER_ALL = 'Barchasi';

const LEGEND = [
  TABLE_STATUS.AVAILABLE,
  TABLE_STATUS.OCCUPIED,
  TABLE_STATUS.RESERVED,
  TABLE_STATUS.CLEANING,
].map((status) => ({ status, label: TABLE_STATUS_LABELS[status], color: TABLE_STATUS_COLORS[status] }));

const TableMap2D = ({
  onTableClick,
  onOrderTransferred,
  selectedTable: externalSelected,
  tables: externalTables,
  pickerMode = false,
}) => {
  const queryClient = useQueryClient();

  const tablesQuery = useQuery({
    queryKey: ['tables'],
    queryFn: async () => unwrapList(await getTables({ page: 1, limit: 100 }), 'tables'),
    enabled: !pickerMode,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTable(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const loading = pickerMode ? false : tablesQuery.isLoading;
  const error = pickerMode ? null : (tablesQuery.error ? (tablesQuery.error?.response?.data?.message || tablesQuery.error.message || 'Xatolik') : null);
  const tables = externalTables ?? (tablesQuery.data ?? []);

  const [hoveredTable, setHoveredTable] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [transferringTable, setTransferringTable] = useState(null);
  const [occupyingTable, setOccupyingTable] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(ZONE_FILTER_ALL);

  const selected = externalSelected ?? selectedLocal ?? null;

  const zoneNames = useMemo(() => {
    const set = new Set(tables.map((t) => t.zone || 'Boshqa'));
    return [ZONE_FILTER_ALL, ...Array.from(set)];
  }, [tables]);

  const zones = useMemo(() => {
    const filtered = zoneFilter === ZONE_FILTER_ALL ? tables : tables.filter((t) => (t.zone || 'Boshqa') === zoneFilter);
    const zoneMap = new Map();
    filtered.forEach((t) => {
      const zone = t.zone || 'Boshqa';
      if (!zoneMap.has(zone)) zoneMap.set(zone, []);
      zoneMap.get(zone).push(t);
    });
    return Array.from(zoneMap.entries()).map(([name, list]) => ({
      name,
      tables: list.sort((a, b) => a.number - b.number),
    }));
  }, [tables, zoneFilter]);

  const handleTableClick = (table) => {
    if (pickerMode) {
      onTableClick?.(table);
      return;
    }
    if (table.status === TABLE_STATUS.AVAILABLE) {
      setOccupyingTable(table);
      return;
    }
    setSelectedLocal(table);
    onTableClick?.(table);
  };

  const handleOccupyConfirm = async (details) => {
    if (!occupyingTable) return;

    try {
      await updateMutation.mutateAsync({
        id: occupyingTable._id ?? occupyingTable.id,
        data: { status: TABLE_STATUS.OCCUPIED, ...details },
      });
      const updated = { ...occupyingTable, status: TABLE_STATUS.OCCUPIED, ...details };
      setOccupyingTable(null);
      setSelectedLocal(updated);
      onTableClick?.(updated);
    } catch {
      alert('Stolni band qilishda xatolik yuz berdi');
    }
  };

  const handleTransferConfirm = async (sourceTableId, targetTableId) => {
    const fromTable = tables.find((t) => (t._id ?? t.id) === sourceTableId);
    const toTable = tables.find((t) => (t._id ?? t.id) === targetTableId);
    if (!fromTable || !toTable) {
      throw new Error('Stol topilmadi');
    }

    try {
      await updateMutation.mutateAsync({
        id: fromTable._id ?? fromTable.id,
        data: { status: TABLE_STATUS.AVAILABLE, currentOrderId: null },
      });
      await updateMutation.mutateAsync({
        id: toTable._id ?? toTable.id,
        data: { status: TABLE_STATUS.OCCUPIED, currentOrderId: fromTable.currentOrderId },
      });
      onOrderTransferred?.(fromTable, toTable);
      setTransferringTable(null);
    } catch (err) {
      throw err || new Error("Stolni ko'chirishda xatolik");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[1.75rem] border border-slate-200 bg-slate-50 dark:border-cyan-500/10 dark:bg-[#04111a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-500 dark:border-t-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[1.75rem] border border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/10 dark:bg-[#04111a] dark:text-rose-300">
        <p>Xatolik: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#05111d]/90 dark:shadow-[0_40px_90px_rgba(15,23,42,0.4)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.12),transparent_55%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-orange-600 dark:text-cyan-300">Zonalar</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">Hududiy reja</h2>
          </div>
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 sm:pb-0">
            {zoneNames.map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${zoneFilter === z ? 'bg-orange-600 text-white dark:bg-cyan-500 dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#04111a] dark:text-slate-300 dark:hover:bg-[#071f30]'}`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {zones.map((zone) => (
            <section key={zone.name} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-3 dark:border-cyan-500/10 dark:bg-[#061721]/80 sm:p-4">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-cyan-500/10">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500 dark:text-slate-500">{zone.name}</p>
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-400">{zone.tables.length} stol</p>
                </div>
                <div className="rounded-full bg-orange-50 px-3 py-1 text-xs text-orange-600 dark:bg-[#08141f] dark:text-cyan-300">Reja</div>
              </div>

              {/* Real 2D floor: tiled floor texture + tables laid out like an actual room */}
              <div
                className="relative mt-4 grid grid-cols-2 gap-3 rounded-[1.25rem] p-3 sm:grid-cols-3 sm:gap-6 sm:p-6 [--floor-bg:#f6f1ea] [--floor-grid:rgba(234,88,12,0.06)] dark:[--floor-bg:#071923] dark:[--floor-grid:rgba(20,184,166,0.06)]"
                style={{
                  backgroundColor: 'var(--floor-bg)',
                  backgroundImage:
                    'linear-gradient(var(--floor-grid) 1px, transparent 1px), linear-gradient(90deg, var(--floor-grid) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.08)',
                }}
              >
                {zone.tables.map((table) => (
                  <TableSeat
                    key={table._id ?? table.id}
                    table={table}
                    onClick={() => handleTableClick(table)}
                    onEdit={() => setEditingTable(table)}
                    onTransfer={() => setTransferringTable(table)}
                    isSelected={(selected?.id ?? selected?._id) === (table.id ?? table._id)}
                    isHovered={(hoveredTable?.id ?? hoveredTable?._id) === (table.id ?? table._id)}
                    onHover={setHoveredTable}
                    pickerMode={pickerMode}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-cyan-500/10 dark:text-slate-400">
          {LEGEND.map((item) => (
            <span key={item.status} className="flex items-center gap-1.5">
              <i className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {!pickerMode && editingTable && (
        <EditTableModal
          table={editingTable}
          onClose={() => setEditingTable(null)}
          onSave={(updated) => {
            updateMutation.mutate({ id: updated._id ?? updated.id, data: updated });
            setEditingTable(null);
          }}
        />
      )}

      {!pickerMode && transferringTable && (
        <TransferTableModal
          sourceTable={transferringTable}
          tables={tables}
          onTransfer={handleTransferConfirm}
          onClose={() => setTransferringTable(null)}
        />
      )}

      {!pickerMode && occupyingTable && (
        <OccupyTableModal
          table={occupyingTable}
          onClose={() => setOccupyingTable(null)}
          onConfirm={handleOccupyConfirm}
        />
      )}
    </div>
  );
};

const TableSeat = ({ table, onClick, onEdit, onTransfer, isSelected, isHovered, onHover, pickerMode }) => {
  const color = TABLE_STATUS_COLORS[table.status];
  const canTransfer = table.status === TABLE_STATUS.OCCUPIED;
  const capacity = table.capacity || 4;
  const isRound = capacity <= 4;
  const active = isSelected || isHovered;

  return (
    <div
      className="relative flex flex-col items-center"
      onMouseEnter={() => onHover(table)}
      onMouseLeave={() => onHover(null)}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Stol #${table.number}, ${TABLE_STATUS_LABELS[table.status]}`}
        style={{
          backgroundColor: `${color}1A`,
          borderColor: color,
          color,
          borderWidth: isSelected ? 3 : 2,
        }}
        className={`flex h-18 w-18 items-center justify-center text-xl font-bold shadow-sm outline-none transition-transform sm:h-22 sm:w-22 sm:text-2xl ${isRound ? 'rounded-full' : 'rounded-2xl'} ${active ? 'scale-105 shadow-md' : ''}`}
      >
        {table.number}
      </button>

      <div className="mt-2 flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {TABLE_STATUS_LABELS[table.status]}
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">{capacity} joy</span>
        {table.customerName && (
          <span className="max-w-27.5 truncate text-[10px] text-orange-600 dark:text-cyan-300" title={table.customerName}>
            {table.customerName}
          </span>
        )}
        {(table.time || table.date) && (
          <span className="text-[9px] text-slate-400 dark:text-slate-500">
            {table.date ? `${table.date} · ` : ''}
            {table.time}
            {table.guestCount ? ` · ${table.guestCount} kishi` : ''}
          </span>
        )}
      </div>

      {!pickerMode && <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500 transition hover:border-orange-300 hover:text-orange-600 dark:border-cyan-500/10 dark:bg-[#08111f] dark:text-cyan-200 dark:hover:border-cyan-400 dark:hover:text-white"
        >
          <Pencil className="h-3 w-3" />
        </button>
        {canTransfer && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTransfer();
            }}
            className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500 transition hover:border-orange-300 hover:text-orange-600 dark:border-cyan-500/10 dark:bg-[#08111f] dark:text-cyan-200 dark:hover:border-cyan-400 dark:hover:text-white"
          >
            <ArrowRightLeft className="h-3 w-3" />
          </button>
        )}
      </div>}
    </div>
  );
};

export default TableMap2D;
