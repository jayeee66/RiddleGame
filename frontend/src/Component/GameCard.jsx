import SessionButton from '../StartGame';

function GameCard({ game, onDelete, onRefresh }) {
  const totalDuration = (questions) =>
    questions.reduce((acc, q) => acc + (q.duration || 0), 0);

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/8 transition">
      {/* Card header */}
      <div className="flex items-start justify-between">
        <a
          href={`/game/${game.id}`}
          className="flex-1"
        >
          <h2 className="text-white font-bold text-base leading-tight hover:text-indigo-300 transition">
            {game.name || 'Untitled'}
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">ID: {game.id}</p>
        </a>
        <button
          className="ml-2 p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
          onClick={() => onDelete(game)}
          aria-label="Delete game"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Stats */}
      <div className="flex gap-3">
        <div className="flex-1 bg-slate-700/40 rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-lg">{game.questions.length}</p>
          <p className="text-slate-400 text-xs">Questions</p>
        </div>
        <div className="flex-1 bg-slate-700/40 rounded-xl px-3 py-2 text-center">
          <p className="text-white font-bold text-lg">{totalDuration(game.questions)}s</p>
          <p className="text-slate-400 text-xs">Duration</p>
        </div>
      </div>

      {/* Session controls */}
      <SessionButton gameId={game.id} active={game.active} onRefresh={onRefresh} />
    </div>
  );
}

export default GameCard;
