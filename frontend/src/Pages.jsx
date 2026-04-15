import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from 'react-router-dom';

import Home from './Pages/Home';
import Register from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import Result from './Pages/Result';
import EditGame from './Pages/EditGame';
import EditQuestion from './Pages/EditQuestion';
import JoinGame from './Pages/JoinGame';
import PlayGame from './Pages/PlayGame';
import PlayerResult from './Pages/PlayerResult';
import NavBar from './Component/NavBar';

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
  };

  const playerPaths = ['/session/join', '/play/', '/player/'];
  const isPlayerPage = playerPaths.some(p => location.pathname.startsWith(p));
  const showFloatingNav = token && !isPlayerPage && location.pathname !== '/dashboard';

  return (
    <>
      {showFloatingNav && <NavBar variant="floating" onLogout={logout} />}
      <Routes>
        <Route path="/" element={token ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/register" element={<Register successJob={successJob} token={token} />} />
        <Route path="/login" element={<Login successJob={successJob} token={token} />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} logout={logout} /> : <Navigate to="/" />}
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
