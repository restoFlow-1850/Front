import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowHHMM = () => new Date().toTimeString().slice(0, 5);

const OccupyTableModal = ({ table, onClose, onConfirm }) => {
  const [customerName, setCustomerName] = useState('');
  const [guestCount, setGuestCount] = useState(table?.capacity || 2);
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState(nowHHMM());
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!table) return null;

  const validate = () => {
    const next = {};
    if (!customerName.trim()) next.customerName = 'Mijoz ismini kiriting';
    if (!guestCount || Number(guestCount) < 1) next.guestCount = "Odamlar soni kamida 1 bo'lishi kerak";
    if (!date) next.date = 'Sanani tanlang';
    if (!time) next.time = 'Vaqtni tanlang';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onConfirm({
        customerName: customerName.trim(),
        guestCount: Number(guestCount),
        date,
        time,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={`Stol #${table.number} — band qilish`}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Mijoz ismi familiyasi"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          error={errors.customerName}
          placeholder="Ism Familiya"
          autoFocus
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Necha kishi"
            type="number"
            min="1"
            value={guestCount}
            onChange={(e) => setGuestCount(e.target.value)}
            error={errors.guestCount}
          />
          <Input label="Soat" type="time" value={time} onChange={(e) => setTime(e.target.value)} error={errors.time} />
        </div>
        <Input label="Qaysi kunga" type="date" value={date} onChange={(e) => setDate(e.target.value)} error={errors.date} />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" className="flex-1" loading={submitting}>
            Band qilish
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default OccupyTableModal;
