import React, { useState } from 'react';
import Modal from '../../components/ui/Modal';

const NoteModal = ({ isOpen, note, onSave, onClose }) => {
  const [text, setText] = useState(note || '');

  const handleSave = () => {
    if (text.trim()) {
      onSave(text.trim());
    } else {
      onSave('');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="📝 Buyurtmaga izoh">
      <div className="p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Buyurtmaga qo'shimcha izoh qoldiring:
        </p>
        <textarea
          className="w-full px-4 py-3 border rounded-lg dark:bg-gray-800 dark:border-gray-700 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Masalan: Achchiq bo'lmasin, tezroq tayyorlang..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Bekor qilish
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Saqlash
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default NoteModal;