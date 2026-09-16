import Modal from '../../../components/ui/Modal'

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, isLoading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <p className="confirm-message">{message}</p>
      <div className="menu-form-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          Отмена
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'Удаление...' : 'Удалить'}
        </button>
      </div>
    </Modal>
  )
}
