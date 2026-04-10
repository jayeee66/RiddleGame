import { useState, useEffect } from 'react';

const API = 'http://localhost:5005';

function getToken() {
  return localStorage.getItem('token');
}

export function useGames() {
  const [games, setGames] = useState([]);

  const fetchGames = async () => {
    try {
      const res = await fetch(`${API}/admin/games`, {
        headers: { accept: 'application/json', Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      if (res.ok) {
        const list = Object.values(data.games);
        setGames(list);
        localStorage.setItem('games', JSON.stringify(data.games));
      }
    } catch (_) {}
  };

  const putGames = async (gamesObject) => {
    await fetch(`${API}/admin/games`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ games: gamesObject })
    });
  };

  // Read games from localStorage (for EditGame / EditQuestion where we don't need to fetch)
  const getStoredGames = () => JSON.parse(localStorage.getItem('games') || '{}');

  // Update a single game in localStorage + backend
  const updateGame = async (updatedGame) => {
    const stored = getStoredGames();
    const updated = { ...stored, [updatedGame.id]: updatedGame };
    localStorage.setItem('games', JSON.stringify(updated));
    await putGames(updated);
  };

  useEffect(() => { fetchGames(); }, []);

  return { games, setGames, fetchGames, putGames, getStoredGames, updateGame };
}
