import { Calendar, Clock, Phone, Users, Pencil, Trash2, Check } from '../../../lib/Icons';
import ReservationStatusBadge from './ReservationStatusBadge';
import { RESERVATION_STATUS } from '../../../constants/reservationStatus';

const ReservationCard = ({ reservation, onEdit, onCancel, onConfirm }) => {
  return (
    <div className="p-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-semibold text-gray-800 dark:text-white">{reservation.customerName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
            <Phone size={13} /> {reservation.phone}
          </p>
        </div>
        <ReservationStatusBadge status={reservation.status} />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
        <span className="flex items-center gap-1">
          <Calendar size={14} /> {reservation.date}
        </span>
        <span className="flex items-center gap-1">
          <Clock size={14} /> {reservation.time}
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} /> {reservation.guests}
        </span>
        {reservation.tableNumber && (
          <span className="flex items-center gap-1">🍽️ Stol #{reservation.tableNumber}</span>
        )}
      </div>

      {reservation.note && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">{reservation.note}</p>
      )}

      <div className="flex gap-2 pt-1">
        {reservation.status === RESERVATION_STATUS.PENDING && (
          <button
            type="button"
            onClick={() => onConfirm(reservation)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
          >
            <Check size={12} /> Tasdiqlash
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(reservation)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Pencil size={12} /> Tahrirlash
        </button>
        <button
          type="button"
          onClick={() => onCancel(reservation)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition"
        >
          <Trash2 size={12} /> Bekor qilish
        </button>
      </div>
    </div>
  );
};

export default ReservationCard;
