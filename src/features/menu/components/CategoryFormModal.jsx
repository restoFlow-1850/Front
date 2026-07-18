import { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

const CategoryFormModal = ({ category, onClose, onSubmit }) => {
  const [name, setName] = useState(category?.name || '');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Kategoriya nomini kiriting');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}>
      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Input
          label="Nomi"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError('');
          }}
          error={error}
          placeholder="Masalan: Ichimliklar"
          autoFocus
        />
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

export default CategoryFormModal;
