import { useState } from 'react';
import { useReservations } from '../../../hooks/useReservations';
import { RESERVATION_STATUS } from '../../../constants/reservationStatus';
import ReservationCard from '../components/ReservationCard';
import ReservationFormModal from '../components/ReservationFormModal';
import Pagination from '../../../components/ui/Pagination';
import Button from '../../../components/ui/Button';
import { Plus, Calendar } from '../../../lib/Icons';

const PAGE_LIMIT = 20;

const ReservationsPage = () => {
  const [page, setPage] = useState(1);
  const { reservations, pagination, loading, error, addReservation, editReservation, changeStatus, removeReservation, refetch } =
    useReservations({ page, limit: PAGE_LIMIT });

  const [modalState, setModalState] = useState(null); // null | { mode: 'create' } | { mode: 'edit', reservation }

  const totalPages = pagination?.totalPages || (pagination?.total ? Math.ceil(pagination.total / PAGE_LIMIT) : 1);

  const handleSubmit = async (data) => {
    const result =
      modalState?.mode === 'edit'
        ? await editReservation(modalState.reservation.id, data)
        : await addReservation(data);

    if (result.success) {
      setModalState(null);
    } else {
      alert("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    }
  };

  const handleConfirm = async (reservation) => {
    const result = await changeStatus(reservation.id, RESERVATION_STATUS.CONFIRMED);
    if (!result.success) alert('Holatni yangilashda xatolik yuz berdi.');
  };

  const handleCancel = async (reservation) => {
    if (!confirm(`"${reservation.customerName}" bronini bekor qilmoqchimisiz?`)) return;
    const result = await removeReservation(reservation.id);
    if (!result.success) alert('Bekor qilishda xatolik yuz berdi.');
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Bronlar</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Stol bronlarini boshqarish</p>
        </div>
        <Button onClick={() => setModalState({ mode: 'create' })} className="!w-auto">
          <Plus size={16} /> Yangi bron
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-red-300 dark:border-red-900/50">
          <p className="text-red-500 mb-3">Bronlarni yuklashda xatolik: {error}</p>
          <Button variant="secondary" className="!w-auto mx-auto" onClick={refetch}>
            Qayta urinish
          </Button>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="text-center py-16 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400">
          <Calendar size={32} className="mx-auto mb-3 opacity-50" />
          <p>Hozircha bronlar yo'q</p>
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              onEdit={(r) => setModalState({ mode: 'edit', reservation: r })}
              onConfirm={handleConfirm}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {modalState && (
        <ReservationFormModal
          reservation={modalState.mode === 'edit' ? modalState.reservation : null}
          onClose={() => setModalState(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
};

export default ReservationsPage;
