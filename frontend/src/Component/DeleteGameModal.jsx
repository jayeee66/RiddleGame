import Modal from './Modal';

function DeleteGameModal({ isOpen, game, onConfirm, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      footer={
        <>
          <button
            className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white text-sm font-semibold transition"
            onClick={onConfirm}
          >
            Delete
          </button>
        </>
      }
    >
      <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">Delete Game?</h3>
      <p className="text-slate-400 text-sm text-center mb-2">
        &quot;{game?.name}&quot; will be permanently deleted.
      </p>
    </Modal>
  );
}

export default DeleteGameModal;
