import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import SessionButton from './StartGame';

function Dashboard() {
  const [games, setGames] = useState([]);
  const [createForm, setCreateForm] = useState(false);
  const [destroyForm, setDestroyForm] = useState(false);
  const [newGame, setNewGame] = useState('');

  const navigate = useNavigate();

  const fetchGames = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/admin/games', {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setGames(Object.values(data.games));
        localStorage.setItem('games', JSON.stringify(data.games));
      } else {
        alert(data.error);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  useEffect(() => {
    fetchGames();
  }, []);

  const putGames = async (gamesObject) => {
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.stringify({ games: gamesObject });
      const response = await fetch('http://localhost:5005/admin/games', {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: payload
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error);
      }
    } catch (e) {
      alert(e.message);
    }
  };

  const createGame = async () => {
    const token = localStorage.getItem('token');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const owner = payload.email || 'unknown';
    const games = localStorage.getItem('games');
    const data = JSON.parse(games || '[]');
    const gameId = data.length > 0
      ? Math.max(...data.map(game => game.id)) + 1
      : 56513315;
    const newObject = {
      id: gameId,
      owner: owner,
      active: null,
      questions: [],
      name: newGame,
    };
    const updatedGames = [...data, newObject];
    localStorage.setItem('games', JSON.stringify(updatedGames));
    setGames(updatedGames);
    await putGames(updatedGames);
    setNewGame('');
  };

  const destroyGame = async (gameID) => {
    const games = localStorage.getItem('games');
    const data = JSON.parse(games);
    let updatedGames = data.filter(game => game.id !== gameID);
    localStorage.setItem('games', JSON.stringify(updatedGames));
    setGames(updatedGames);
    await putGames(updatedGames);
  };

  const totalDuration = (questions) => questions.reduce((acc, q) => acc + q.duration, 0);
  console.log(games)
  return (
    <div className="p-4">
      <button
        className="my-2 p-3 rounded-[.400rem] bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
        onClick={() => setCreateForm(true)}
      >
        Create Game
      </button>
      {createForm && (
        <div className="flex justify-center items-center fixed inset-0 bg-gray-800 bg-opacity-30 z-999">
          <div className="p-6 rounded-[.600rem] bg-white w-full max-w-sm">
            <h3 className="my-2 font-[600] text-center text-lg">Create Game</h3>
            <input
              type="text"
              className="my-2 p-2 w-full rounded-[.400rem] border-1 border-solid"
              placeholder="Name your new game"
              value={newGame}
              onChange={(e) => setNewGame(e.target.value)}
            />
            <div className="flex justify-center w-full gap-2">
              <button
                className="flex-1 my-2 p-3 rounded-[.400rem] bg-gray-600 text-white  hover:bg-zinc-400 transition duration-300 ease-in-out"
                onClick={() => setCreateForm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 my-2 p-3 rounded-[.400rem] bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
                onClick={() => {
                  createGame();
                  setCreateForm(false);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className="my-2 p-3 rounded-[.400rem] bg-red-600 hover:bg-fuchsia-400 text-white transition duration-300 ease-in-out"
        onClick={() => setDestroyForm(true)}
      >
        Destroy Game
      </button>
      {destroyForm && (
        <div className="flex justify-center items-center fixed inset-0 bg-gray-800 bg-opacity-30 z-999">
          <div className="p-6 rounded-[0.600rem] bg-white w-full max-w-sm">
            <h3 className="my-2 font-[600] text-center text-lg">Destroy Game</h3>
            <input
              type="text"
              className="my-2 p-2 w-full rounded-[.400rem] border-1 border-solid"
              placeholder="Select a gameID to destroy"
              value={newGame}
              onChange={(e) => setNewGame(e.target.value)}
            />
            <div className="flex justify-center w-full gap-2">
              <button
                className="flex-1 my-2 p-3 rounded-[0.400rem] bg-gray-600 text-white hover:bg-zinc-400 transition duration-300 ease-in-out"
                onClick={() => setDestroyForm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 my-2 p-3 rounded-[0.400rem] bg-red-600 hover:bg-fuchsia-400 text-white transition duration-300 ease-in-out"
                onClick={() => {
                  destroyGame(parseInt(newGame, 10));
                  setDestroyForm(false);
                }}
              >
                Destroy
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {games.map((game) => (
          <div key={game.id} className="relative border-1 border-solid p-4 rounded-[1rem] bg-white">
            <h2 className="my-2 font-[700] mb-2">Game ID: {game.id}</h2>
            <p><strong>Name:</strong> {game.name}</p>
            <p><strong>Owner:</strong> {game.owner}</p>
            <p><strong>Number of Questions:</strong> {game.questions.length}</p>
            <p><strong>Total Duration:</strong> {totalDuration(game.questions)} sec</p>
            <img
              className="my-2 w-full h-32 object-cover rounded-[.400rem]"
              src="https://heatherrobertsart.com/cdn/shop/products/1_84c051d7-0b22-4f5e-aee8-af8d7644cefd_1024x1024.png?v=1663394121"
              alt="Thumbnail"
              style={{ height: 150, width: 150 }}
              onClick={() => navigate(`/game/${game.id}`)}
            />
            <SessionButton gameId={game.id} active={game.active} onRefresh={fetchGames} />
          </div>

        ))}
      </div>
    </div>
  );
}

export default Dashboard;
