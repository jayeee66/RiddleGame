import Modal from './Modal';

function CreateGameModal({ isOpen, gameName, onChange, onCreate, onCancel }) {
  return (
    <Modal
      isOpen={isOpen}
      title="New Game"
      footer={
        <>
          <button
            className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition"
            onClick={onCreate}
          >
            Create
          </button>
        </>
      }
    >
      <input
        type="text"
        autoFocus
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition mb-4"
        placeholder="Game name"
        value={gameName}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onCreate()}
      />
    </Modal>
  );
}

export default CreateGameModal;
