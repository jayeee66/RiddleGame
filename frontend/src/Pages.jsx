import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Routes,
  Route,
  useNavigate,
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
      const response = await axios.post('http://localhost:5005/admin/auth/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.status === 200) {
        localStorage.removeItem('token');
        setToken(null);
        navigate('/login');
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const goHome = () => {
    navigate('/dashboard');
  };

  return (
    <>
      {token && (
        <div className="absolute top-6 right-4">
          <button
            onClick={goHome}
            className="p-2 rounded-[0.400rem] bg-blue-600 text-white hover:bg-sky-400 transition duration-300 ease-in-out"
          >
            🏠
          </button>

          <button
            onClick={logout}
            className="p-2 rounded-[0.400rem] bg-gray-600 text-white hover:bg-zinc-400 transition duration-300 ease-in-out"
          >
            Logout
          </button>
        </div>
      )}
      <Routes>
        <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} />} />
        <Route path="/register" element={<Register successJob={successJob} token={token} name="register" />} />
        <Route path="/login" element={<Login successJob={successJob} token={token} name="login" />} />
        <Route
          path="/dashboard"
          element={token ? <Dashboard token={token} name="dashboard" /> : <Navigate to="/login" />}
        />
        <Route path="/results/:sessionId" element={<Result />} />
        <Route path="/game/:gameId" element={<EditGame token={token} name="game:id" />} />
        <Route path="/game/:gameId/question/:questionId" element={<EditQuestion token={token} name="question:id" />} />
        <Route path="/session/join" element={<JoinGame />} />
        <Route path="/play/:playerId" element={<PlayGame />} />
        <Route path="/player/:playerId/result" element={<PlayerResult />} />
      </Routes>
    </>
  );
}

export default Pages;

