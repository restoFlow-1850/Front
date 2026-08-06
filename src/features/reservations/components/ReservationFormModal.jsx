import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const emptyForm = {
  customerName: '',
  phone: '',
  tableNumber: '',
  date: '',
  time: '',
  guests: 2,
  note: '',
};

const ReservationFormModal = ({ reservation, onClose, onSubmit }) => {
  const [form, setForm] = useState(() =>
    reservation
      ? {
          customerName: reservation.customerName || '',
          phone: reservation.phone || '',
          tableNumber: reservation.tableNumber ?? '',
          date: reservation.date || '',
          time: reservation.time || '',
          guests: reservation.guests || 2,
          note: reservation.note || '',
        }
      : emptyForm
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const setField = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validate = () => {
    const next = {};
    if (!form.customerName.trim()) next.customerName = 'Mijoz ismini kiriting';
    if (!form.phone.trim()) next.phone = 'Telefon raqamini kiriting';
    if (!form.date) next.date = 'Sanani tanlang';
    if (!form.time) next.time = 'Vaqtni tanlang';
    if (!form.guests || Number(form.guests) < 1) next.guests = "Mehmonlar soni kamida 1 bo'lishi kerak";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        tableNumber: form.tableNumber === '' ? null : Number(form.tableNumber),
        guests: Number(form.guests),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={reservation ? 'Bronni tahrirlash' : 'Yangi bron'}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Mijoz ismi"
          value={form.customerName}
          onChange={setField('customerName')}
          error={errors.customerName}
          placeholder="Ism Familiya"
        />
        <Input
          label="Telefon"
          value={form.phone}
          onChange={setField('phone')}
          error={errors.phone}
          placeholder="+998 90 123 45 67"
        />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Sana" type="date" value={form.date} onChange={setField('date')} error={errors.date} />
          <Input label="Vaqt" type="time" value={form.time} onChange={setField('time')} error={errors.time} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Mehmonlar soni"
            type="number"
            min="1"
            value={form.guests}
            onChange={setField('guests')}
            error={errors.guests}
          />
          <Input
            label="Stol raqami (ixtiyoriy)"
            type="number"
            min="1"
            value={form.tableNumber}
            onChange={setField('tableNumber')}
          />
        </div>
        <Input label="Izoh (ixtiyoriy)" value={form.note} onChange={setField('note')} placeholder="Qo'shimcha izoh" />

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={submitting}>
            Bekor qilish
          </Button>
          <Button type="submit" className="flex-1" loading={submitting}>
            Saqlash
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReservationFormModal;
