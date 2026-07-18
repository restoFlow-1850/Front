import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useTables } from '../../hooks/useTables';
import { useCart } from '../../hooks/useCart';
import TableMap2D from '../tables/components/TableMap2D';
import CartPanel from './CartPanel';
import TransferModal from '../tables/components/TransferTableModal';
import OrderConfirmModal from './OrderConfirmModal';
import List from './List';
import { createOrder } from '../../services/order.service';
import { TABLE_STATUS } from '../../constants/tableStatus';

const categories = [
  { key: 'all', label: 'Barchasi' },
  { key: 'main', label: 'Asosiy' },
  { key: 'soup', label: 'Shorva' },
  { key: 'drink', label: 'Ichimlik' },
  { key: 'salad', label: 'Salat' },
];

const Waiter = () => {
  const dispatch = useDispatch();
  const { tables, selectedTable, selectTable, updateTableData } = useTables();
  const { items, total, tableNote, clear, setNote, removeItem, updateQuantity, addItem } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOrder = async (orderData) => {
    if (!selectedTable) return;
    setIsSubmitting(true);
    try {
      await dispatch(createOrder({
        tableId: selectedTable.id,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          note: item.note,
        })),
        total,
        note: tableNote,
        type: orderData.orderType,
        customerCount: orderData.customerCount,
      })).unwrap();
      clear();
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Buyurtma yuborishda xatolik:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = (item) => {
    addItem(item);
  };

  const handleTransfer = async (sourceId, targetId) => {
    const fromTable = tables.find((t) => t.id === sourceId);
    const toTable = tables.find((t) => t.id === targetId);
    if (!fromTable || !toTable) {
      throw new Error('Stol topilmadi');
    }

    const freed = await updateTableData(fromTable.id, {
      status: TABLE_STATUS.AVAILABLE,
      currentOrderId: null,
    });
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

    selectTable(toTable);
    setIsTransferOpen(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03060d] text-slate-100 px-4 py-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),transparent_30%)]" />
      <div className="relative mx-auto grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-cyan-500/10 bg-[#07101d]/90 p-6 shadow-[0_40px_90px_rgba(15,23,42,0.55)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs uppercase tracking-[0.35em] text-cyan-300">Operatsiya markazi</span>
                <h1 className="mt-4 text-4xl font-semibold text-white">Zal reja va buyurtma oqimi</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400">Har bir stolni noyob ravishda boshqaring, buyurtmalarni to'liq nazorat ostida saqlang va mijozlar oqimini aniq kuzating.</p>
              </div>
              <div className="grid w-full grid-cols-3 gap-3 sm:w-auto sm:grid-cols-3">
                <div className="rounded-[1.5rem] border border-cyan-500/15 bg-[#05111d] p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{tables.length}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Stol</p>
                </div>
                <div className="rounded-[1.5rem] border border-cyan-500/15 bg-[#05111d] p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{items.length}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Sav. element</p>
                </div>
                <div className="rounded-[1.5rem] border border-cyan-500/15 bg-[#05111d] p-4 text-center">
                  <p className="text-2xl font-semibold text-white">{total.toLocaleString()}</p>
                  <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Jami UZS</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5 shadow-[0_40px_90px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Xaritadan tanlash</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Stol xaritasi</h2>
              </div>
              <div className="rounded-full border border-cyan-500/20 bg-[#04111a] px-4 py-2 text-sm text-slate-400">{selectedTable ? `Tanlangan: #${selectedTable.number}` : 'Hech kim tanlanmadi'}</div>
            </div>
            {/*
              NOTE: previously there was a second, non-functional row of category-style
              buttons here (Barchasi/Asosiy/Shorva/Ichimlik/Salat) with no onClick handler.
              It duplicated the zone filter that TableMap2D already renders internally
              (zoneNames.map(...) + setZoneFilter), so it has been removed to avoid a
              dead/confusing control. The description text is kept below.
            */}
            <div className="mt-5">
              <p className="text-sm text-slate-500">Har bir stol uchun real vaqt holati va tezkor boshqaruv.</p>
            </div>
            <div className="mt-6">
              <TableMap2D onTableClick={selectTable} selectedTable={selectedTable} />
            </div>
          </section>

          <section className="rounded-[2rem] border border-cyan-500/10 bg-[#06121f]/90 p-5 shadow-[0_40px_90px_rgba(15,23,42,0.5)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Inventar nazorati</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Menyu</h2>
              </div>
              <div className="inline-flex rounded-full border border-cyan-500/15 bg-[#04111a] px-4 py-2 text-sm text-slate-300">Qidiruv</div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_4fr]">
              <div className="space-y-3 rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/70 p-4">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`w-full rounded-[1.5rem] px-4 py-3 text-left text-sm font-semibold transition ${category === cat.key ? 'bg-cyan-600 text-slate-950 shadow-[0_15px_35px_rgba(20,184,166,0.18)]' : 'bg-[#021018] text-slate-300 hover:bg-[#071724]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div>
                <div className="rounded-[1.75rem] border border-cyan-500/10 bg-[#04111a]/70 p-4">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Qidiruv..."
                    className="w-full rounded-[1.5rem] border border-cyan-500/10 bg-[#020c14] px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div className="mt-4">
                  <List searchQuery={searchQuery} category={category} onAdd={handleAddToCart} />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <CartPanel
            table={selectedTable}
            items={items}
            total={total}
            note={tableNote}
            onNoteChange={setNote}
            onClearCart={clear}
            onRemoveItem={removeItem}
            onUpdateQuantity={updateQuantity}
            onTransfer={() => setIsTransferOpen(true)}
            onSubmitOrder={() => setIsConfirmOpen(true)}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>

      {isTransferOpen && (
        <TransferModal
          onClose={() => setIsTransferOpen(false)}
          sourceTable={selectedTable}
          onTransfer={handleTransfer}
          tables={tables}
        />
      )}

      <OrderConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleSubmitOrder}
        table={selectedTable}
        items={items}
        total={total}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default Waiter;