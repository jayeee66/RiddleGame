import { useState } from 'react';
import GameCard from './Component/GameCard';
import CreateGameModal from './Component/CreateGameModal';
import DeleteGameModal from './Component/DeleteGameModal';
import NavBar from './Component/NavBar';
import { useGames } from './hooks/useGames';

function Dashboard({ logout }) {
  const { games, fetchGames, putGames, getStoredGames } = useGames();
  const [createForm, setCreateForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [newGameName, setNewGameName] = useState('');

  const createGame = async () => {
    if (!newGameName.trim()) return;
    const token = localStorage.getItem('token');
    const owner = JSON.parse(atob(token.split('.')[1])).email || 'unknown';
    const stored = getStoredGames();
    const ids = Object.values(stored).map(g => g.id);
    const gameId = ids.length > 0 ? Math.max(...ids) + 1 : 56513315;
    const newGame = { id: gameId, owner, active: null, questions: [], name: newGameName.trim() };
    const updated = { ...stored, [gameId]: newGame };
    localStorage.setItem('games', JSON.stringify(updated));
    await putGames(updated);
    await fetchGames();
    setNewGameName('');
    setCreateForm(false);
  };

  const destroyGame = async (gameId) => {
    const stored = getStoredGames();
    const { [gameId]: _, ...updated } = stored;
    localStorage.setItem('games', JSON.stringify(updated));
    await putGames(updated);
    await fetchGames();
    setDeleteTarget(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">

      <NavBar onLogout={logout} />

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Games</h1>
            <p className="text-slate-400 text-sm mt-1">{games.length} game{games.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/25"
            onClick={() => setCreateForm(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Game
          </button>
        </div>

        {games.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No games yet. Create your first one!</p>
          </div>
        )}

        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onDelete={setDeleteTarget}
              onRefresh={fetchGames}
            />
          ))}
        </div>
      </div>

      <CreateGameModal
        isOpen={createForm}
        gameName={newGameName}
        onChange={setNewGameName}
        onCreate={createGame}
        onCancel={() => { setCreateForm(false); setNewGameName(''); }}
      />

      <DeleteGameModal
        isOpen={!!deleteTarget}
        game={deleteTarget}
        onConfirm={() => destroyGame(deleteTarget.id)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

export default Dashboard;
