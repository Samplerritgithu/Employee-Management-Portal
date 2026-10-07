import Modal from './Modal';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, loading }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm'} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
