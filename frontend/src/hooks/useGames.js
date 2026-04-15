import { useState, useEffect } from 'react';

const API = 'http://localhost:5005';

function getToken() {
  return localStorage.getItem('token');
}

// Normalize to object keyed by game id, handles both legacy array and object formats
function normalizeGames(raw) {
  if (!raw) return {};
  if (Array.isArray(raw)) {
    return raw.reduce((acc, g) => { acc[g.id] = g; return acc; }, {});
  }
  return raw;
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
        const normalized = normalizeGames(data.games);
        setGames(Object.values(normalized));
        localStorage.setItem('games', JSON.stringify(normalized));
        return;
      }
    } catch (_) { /* fall through to localStorage fallback */ }
    // fallback to localStorage — strip active/oldSessions since sessions are server-only
    const stored = normalizeGames(JSON.parse(localStorage.getItem('games') || '{}'));
    setGames(Object.values(stored).map(g => ({ ...g, active: null, oldSessions: [] })));
  };

  const putGames = async (gamesObject) => {
    const gamesArray = Array.isArray(gamesObject)
      ? gamesObject
      : Object.values(gamesObject);
    const res = await fetch(`${API}/admin/games`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ games: gamesArray })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('putGames failed:', res.status, err);
    }
  };

  const getStoredGames = () => {
    const raw = JSON.parse(localStorage.getItem('games') || '{}');
    return normalizeGames(raw);
  };

  const updateGame = async (updatedGame) => {
    const stored = getStoredGames();
    // Find the correct key (might differ from id in corrupted data)
    const existingKey = Object.keys(stored).find(k => stored[k].id === updatedGame.id) || updatedGame.id;
    const updated = { ...stored, [existingKey]: updatedGame };
    localStorage.setItem('games', JSON.stringify(updated));
    await putGames(updated);
  };

  useEffect(() => { fetchGames(); }, []);

  return { games, setGames, fetchGames, putGames, getStoredGames, updateGame };
}
