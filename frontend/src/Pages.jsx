import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Result from './Result';
import EditGame from './EditGame';
import EditQuestion from './EditQuestion';
import JoinGame from './JoinGame';
import PlayGame from './PlayGame';
import PlayerResult from './PlayerResult';

function Pages() {
  const [token, setToken] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, []);

  const successJob = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
    navigate('/dashboard');
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (_) {
      // ignore logout errors, clear token anyway
    }
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login');
  };

  // Dashboard has its own navbar, don't show floating buttons there
  const showFloatingNav = token && location.pathname !== '/dashboard';

  return (
    <>
      {showFloatingNav && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 text-sm transition"
          >
            ← Dashboard
          </button>
          <button
            onClick={logout}
            className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 text-sm transition"
          >
            Logout
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={<Register successJob={successJob} token={token} />} />
        <Route path="/login" element={<Login successJob={successJob} token={token} />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/login" />}
        />
        <Route path="/results/:sessionId" element={<Result />} />
        <Route path="/game/:gameId" element={<EditGame token={token} />} />
        <Route path="/game/:gameId/question/:questionId" element={<EditQuestion token={token} />} />
        <Route path="/session/join" element={<JoinGame />} />
        <Route path="/play/:playerId" element={<PlayGame />} />
        <Route path="/player/:playerId/result" element={<PlayerResult />} />
      </Routes>
    </>
  );
}

export default Pages;
