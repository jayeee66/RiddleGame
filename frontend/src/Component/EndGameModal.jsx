import Modal from './Modal';

function EndGameModal({ isOpen, onConfirm, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      footer={
        <>
          <button
            className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition"
            onClick={onCancel}
          >
            Not now
          </button>
          <button
            className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition"
            onClick={onConfirm}
          >
            View Results
          </button>
        </>
      }
    >
      <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
        <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-white font-bold text-lg text-center mb-1">Game Ended</h3>
      <p className="text-slate-400 text-sm text-center mb-2">Would you like to view the results?</p>
    </Modal>
  );
}

export default EndGameModal;
