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
import ThemeToggle from '../../components/ui/ThemeToggle';

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
    <div className="relative min-h-screen overflow-hidden bg-[#faf7f2] text-slate-900 px-4 py-6 dark:bg-[#03060d] dark:text-slate-100 sm:px-6 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.08),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.06),transparent_30%)] dark:bg-[radial-gradient(circle_at_top,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_30%)]" />
      <div className="relative mx-auto grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-cyan-500/10 dark:bg-[#07101d]/90 dark:shadow-[0_40px_90px_rgba(15,23,42,0.55)] sm:p-6 dark:backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs uppercase tracking-[0.35em] text-orange-600 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300">Operatsiya markazi</span>
                  <div className="lg:hidden">
                    <ThemeToggle />
                  </div>
                </div>
                <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl lg:text-4xl">Zal reja va buyurtma oqimi</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-500 dark:text-slate-400">Har bir stolni noyob ravishda boshqaring, buyurtmalarni to'liq nazorat ostida saqlang va mijozlar oqimini aniq kuzating.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="grid w-full grid-cols-3 gap-2 sm:w-auto sm:gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-cyan-500/15 dark:bg-[#05111d] sm:rounded-3xl sm:p-4">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white sm:text-2xl">{tables.length}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 sm:text-xs sm:tracking-[0.28em]">Stol</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-cyan-500/15 dark:bg-[#05111d] sm:rounded-3xl sm:p-4">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white sm:text-2xl">{items.length}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 sm:text-xs sm:tracking-[0.28em]">Sav. element</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-center dark:border-cyan-500/15 dark:bg-[#05111d] sm:rounded-3xl sm:p-4">
                    <p className="text-lg font-semibold text-slate-900 dark:text-white sm:text-2xl">{total.toLocaleString()}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-500 sm:text-xs sm:tracking-[0.28em]">Jami UZS</p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90 dark:shadow-[0_40px_90px_rgba(15,23,42,0.5)] sm:p-5 dark:backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600 dark:text-cyan-300">Xaritadan tanlash</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Stol xaritasi</h2>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-500 dark:border-cyan-500/20 dark:bg-[#04111a] dark:text-slate-400">{selectedTable ? `Tanlangan: #${selectedTable.number}` : 'Hech kim tanlanmadi'}</div>
            </div>
            {/*
              NOTE: previously there was a second, non-functional row of category-style
              buttons here (Barchasi/Asosiy/Shorva/Ichimlik/Salat) with no onClick handler.
              It duplicated the zone filter that TableMap2D already renders internally
              (zoneNames.map(...) + setZoneFilter), so it has been removed to avoid a
              dead/confusing control. The description text is kept below.
            */}
            <div className="mt-5">
              <p className="text-sm text-slate-500 dark:text-slate-500">Har bir stol uchun real vaqt holati va tezkor boshqaruv.</p>
            </div>
            <div className="mt-6">
              <TableMap2D onTableClick={selectTable} selectedTable={selectedTable} />
            </div>
          </section>

          <section className="rounded-4xl border border-slate-200 bg-white p-4 shadow-sm dark:border-cyan-500/10 dark:bg-[#06121f]/90 dark:shadow-[0_40px_90px_rgba(15,23,42,0.5)] sm:p-5 dark:backdrop-blur-xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-orange-600 dark:text-cyan-300">Inventar nazorati</p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">Menyu</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_4fr]">
              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-3 lg:overflow-visible lg:rounded-[1.75rem] lg:border lg:border-slate-200 lg:bg-slate-50 lg:p-4 lg:pb-4 dark:lg:border-cyan-500/10 dark:lg:bg-[#04111a]/70">
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2.5 text-left text-sm font-semibold transition lg:w-full lg:rounded-3xl lg:py-3 ${category === cat.key ? 'bg-orange-600 text-white dark:bg-cyan-600 dark:text-slate-950 dark:shadow-[0_15px_35px_rgba(20,184,166,0.18)]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-[#021018] dark:text-slate-300 dark:hover:bg-[#071724]'}`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div>
                <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-3 dark:border-cyan-500/10 dark:bg-[#04111a]/70 sm:p-4">
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Qidiruv..."
                    className="w-full rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 dark:border-cyan-500/10 dark:bg-[#020c14] dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20"
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