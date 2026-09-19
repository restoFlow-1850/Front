import React from 'react';

export default function TableQrModal({ isOpen, onClose, table }) {
  if (!isOpen || !table) return null;

  const tableId = table._id || table.id || table.number;
  const qrUrl = `${window.location.origin}/guest?table=${tableId}`;
  const qrImageApi = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrUrl)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl font-bold text-amber-400">Stol #{table.number} QR Kodi</h3>
              <p className="text-xs text-slate-400">Mijozlar menyuni skanerlash va buyurtma berishi uchun</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold">
              &times;
            </button>
          </div>

          <div className="flex flex-col items-center space-y-4 py-4 bg-slate-950/70 border border-slate-800 rounded-xl p-6">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              <img src={qrImageApi} alt={`Stol #${table.number} QR`} className="w-48 h-48 rounded-lg" />
            </div>
            <div className="text-center">
              <span className="text-sm font-semibold text-amber-400">RestoFlow Digital Menu</span>
              <p className="text-xs text-slate-400 mt-1">Stol #{table.number} ({table.capacity || 4} kishilik)</p>
              <p className="text-[11px] text-slate-500 font-mono mt-2 break-all">{qrUrl}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-md transition"
            >
              🖨️ Chop etish / PDF
            </button>
            <button
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl transition"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>

      {/* A4 Chop etish uchun maxsus maket (Faqat print vaqtida ko'rinadi) */}
      <div className="hidden print:flex print:flex-col print:items-center print:justify-center print:min-h-screen print:p-8 text-slate-900 bg-white">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 text-slate-900">RestoFlow</h1>
        <p className="text-2xl font-bold text-amber-600 mb-6">Stol #{table.number}</p>
        <div className="p-4 border-4 border-amber-500 rounded-2xl mb-6 shadow-xl">
          <img src={qrImageApi} alt={`Stol #${table.number} QR`} className="w-64 h-64" />
        </div>
        <p className="text-lg font-semibold text-slate-800 mb-2">Menyuni ko'rish va buyurtma berish uchun QR kodni skanerlang</p>
        <p className="text-sm text-slate-500 font-mono">{qrUrl}</p>
      </div>
    </>
  );
}
