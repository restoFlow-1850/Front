import React, { useState, useMemo } from 'react';
import { ArrowRightLeft, Pencil } from '../../../lib/Icons';
import { useTables } from '../../../hooks/useTables';
import { TABLE_STATUS, TABLE_STATUS_LABELS, TABLE_STATUS_COLORS } from '../../../constants/tableStatus';
import EditTableModal from './EditTableModal';
import TransferTableModal from './TransferTableModal';
import OccupyTableModal from './OccupyTableModal';

const ZONE_FILTER_ALL = 'Barchasi';

const TableMap2D = ({ onTableClick, onOrderTransferred, selectedTable: externalSelected }) => {
  const { tables, loading, error, updateTableData, selectTable } = useTables();
  const [hoveredTable, setHoveredTable] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [transferringTable, setTransferringTable] = useState(null);
  const [occupyingTable, setOccupyingTable] = useState(null);
  const [zoneFilter, setZoneFilter] = useState(ZONE_FILTER_ALL);

  const selected = externalSelected || null;

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
    if (table.status === TABLE_STATUS.AVAILABLE) {
      setOccupyingTable(table);
      return;
    }
    selectTable(table);
    onTableClick?.(table);
  };

  const handleOccupyConfirm = async (details) => {
    if (!occupyingTable) return;

    const result = await updateTableData(occupyingTable.id, {
      status: TABLE_STATUS.OCCUPIED,
      ...details,
    });

    if (!result.success) {
      alert('Stolni band qilishda xatolik yuz berdi');
      return;
    }

    const updated = { ...occupyingTable, status: TABLE_STATUS.OCCUPIED, ...details };
    setOccupyingTable(null);
    selectTable(updated);
    onTableClick?.(updated);
  };

  const handleTransferConfirm = async (sourceTableId, targetTableId) => {
    const fromTable = tables.find((t) => t.id === sourceTableId);
    const toTable = tables.find((t) => t.id === targetTableId);
    if (!fromTable || !toTable) {
      throw new Error('Stol topilmadi');
    }

    const freed = await updateTableData(fromTable.id, { status: TABLE_STATUS.AVAILABLE, currentOrderId: null });
    if (!freed.success) {
      throw freed.error || new Error('Manba stolni bo\'shatishda xatolik');
    }

    const occupied = await updateTableData(toTable.id, {
      status: TABLE_STATUS.OCCUPIED,
      currentOrderId: fromTable.currentOrderId,
    });
    if (!occupied.success) {
      throw occupied.error || new Error('Maqsadli stolni band qilishda xatolik');
    }

    onOrderTransferred?.(fromTable, toTable);
    setTransferringTable(null);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500/30 border-t-cyan-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center rounded-[1.75rem] border border-rose-500/10 bg-[#04111a] text-rose-300">
        <p>Xatolik: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-cyan-500/10 bg-[#05111d]/90 p-5 shadow-[0_40px_90px_rgba(15,23,42,0.4)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.12),transparent_55%)]" />
      <div className="relative space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">Zonalar</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Hududiy reja</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {zoneNames.map((z) => (
              <button
                key={z}
                onClick={() => setZoneFilter(z)}
                className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition ${zoneFilter === z ? 'bg-cyan-500 text-slate-950' : 'bg-[#04111a] text-slate-300 hover:bg-[#071f30]'}`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {zones.map((zone) => (
            <section key={zone.name} className="rounded-[1.75rem] border border-cyan-500/10 bg-[#061721]/80 p-4">
              <div className="flex items-center justify-between gap-3 border-b border-cyan-500/10 pb-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">{zone.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{zone.tables.length} stol</p>
                </div>
                <div className="rounded-full bg-[#08141f] px-3 py-1 text-xs text-cyan-300">Reja</div>
              </div>

              {/* Real 2D floor: tiled floor texture + tables laid out like an actual room */}
              <div
                className="relative mt-4 grid grid-cols-2 gap-6 rounded-[1.25rem] p-6 sm:grid-cols-3"
                style={{
                  backgroundColor: '#071923',
                  backgroundImage:
                    'linear-gradient(rgba(20,184,166,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.06) 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                  boxShadow: 'inset 0 0 40px rgba(0,0,0,0.45)',
                }}
              >
                {zone.tables.map((table) => (
                  <TableSeat
                    key={table.id}
                    table={table}
                    onClick={() => handleTableClick(table)}
                    onEdit={() => setEditingTable(table)}
                    onTransfer={() => setTransferringTable(table)}
                    isSelected={selected?.id === table.id}
                    isHovered={hoveredTable?.id === table.id}
                    onHover={setHoveredTable}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {editingTable && (
        <EditTableModal
          table={editingTable}
          onClose={() => setEditingTable(null)}
          onSave={(updated) => {
            updateTableData(updated.id, updated);
            setEditingTable(null);
          }}
        />
      )}

      {transferringTable && (
        <TransferTableModal
          sourceTable={transferringTable}
          tables={tables}
          onTransfer={handleTransferConfirm}
          onClose={() => setTransferringTable(null)}
        />
      )}

      {occupyingTable && (
        <OccupyTableModal
          table={occupyingTable}
          onClose={() => setOccupyingTable(null)}
          onConfirm={handleOccupyConfirm}
        />
      )}
    </div>
  );
};

// Builds evenly spaced chair positions around a table shape.
// 'round' -> chairs on a circle. 'rect' -> chairs split across the two long sides.
function getChairLayout(shape, capacity) {
  const count = Math.max(1, Math.min(capacity || 4, 10));
  const chairs = [];

  if (shape === 'round') {
    const radius = 46;
    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      chairs.push({
        x: 60 + radius * Math.cos(angle),
        y: 60 + radius * Math.sin(angle),
        rotation: (angle * 180) / Math.PI + 90,
      });
    }
  } else {
    const perSide = Math.ceil(count / 2);
    const spacing = 84 / (perSide + 1);
    for (let i = 0; i < count; i += 1) {
      const side = i < perSide ? 'top' : 'bottom';
      const idxOnSide = side === 'top' ? i : i - perSide;
      const x = 18 + spacing * (idxOnSide + 1);
      chairs.push({
        x,
        y: side === 'top' ? 12 : 108,
        rotation: side === 'top' ? 0 : 180,
      });
    }
  }
  return chairs;
}

const TableSeat = ({ table, onClick, onEdit, onTransfer, isSelected, isHovered, onHover }) => {
  const color = TABLE_STATUS_COLORS[table.status];
  const canTransfer = table.status === TABLE_STATUS.OCCUPIED;
  const capacity = table.capacity || 4;
  const shape = capacity > 4 ? 'rect' : 'round';
  const chairs = useMemo(() => getChairLayout(shape, capacity), [shape, capacity]);

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
        className="relative h-[120px] w-[120px] outline-none"
      >
        <svg viewBox="0 0 120 120" className="h-full w-full overflow-visible">
          {/* chairs */}
          {chairs.map((c, i) => (
            <rect
              key={i}
              x={c.x - 7}
              y={c.y - 7}
              width={14}
              height={14}
              rx={4}
              transform={`rotate(${c.rotation} ${c.x} ${c.y})`}
              fill="#0d2433"
              stroke="rgba(20,184,166,0.25)"
              strokeWidth={1}
            />
          ))}

          {/* table top */}
          {shape === 'round' ? (
            <circle
              cx={60}
              cy={60}
              r={28}
              fill={isSelected ? '#0c2334' : '#0a1c29'}
              stroke={color}
              strokeWidth={isSelected ? 3 : 2}
            />
          ) : (
            <rect
              x={18}
              y={38}
              width={84}
              height={44}
              rx={8}
              fill={isSelected ? '#0c2334' : '#0a1c29'}
              stroke={color}
              strokeWidth={isSelected ? 3 : 2}
            />
          )}

          <text
            x={60}
            y={64}
            textAnchor="middle"
            fontSize={18}
            fontWeight={700}
            fill="#e2e8f0"
          >
            {table.number}
          </text>

          {isHovered && (
            <circle cx={60} cy={60} r={shape === 'round' ? 34 : 0} fill="none" />
          )}
        </svg>

        <span
          className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-[#061721]"
          style={{ backgroundColor: color }}
        />
      </button>

      <div className="mt-2 flex flex-col items-center gap-1 text-center">
        <span className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
          {TABLE_STATUS_LABELS[table.status]}
        </span>
        <span className="text-[10px] text-slate-500">{capacity} joy</span>
        {table.customerName && (
          <span className="max-w-[110px] truncate text-[10px] text-cyan-300" title={table.customerName}>
            {table.customerName}
          </span>
        )}
        {(table.time || table.date) && (
          <span className="text-[9px] text-slate-500">
            {table.date ? `${table.date} · ` : ''}
            {table.time}
            {table.guestCount ? ` · ${table.guestCount} kishi` : ''}
          </span>
        )}
      </div>

      <div className="mt-2 flex gap-1.5">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="inline-flex items-center gap-1 rounded-full border border-cyan-500/10 bg-[#08111f] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-400 hover:text-white"
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
            className="inline-flex items-center gap-1 rounded-full border border-cyan-500/10 bg-[#08111f] px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-200 transition hover:border-cyan-400 hover:text-white"
          >
            <ArrowRightLeft className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TableMap2D;