import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

function JoinGame() {
  const [searchParams] = useSearchParams();
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const sessionId = searchParams.get('sessionId');


  // Join game
  const handleJoin = async () => {
    if (name === '') {
      alert("Please enter your name");
      return;
    }
    try {
      const response = await axios.post(`http://localhost:5005/play/join/${sessionId}`,
        { name: name },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.status === 200) {
        navigate(`/play/${response.data.playerId}`);
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">
      <div className="w-full max-w-sm mx-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
        <h3 className="text-2xl font-bold text-white text-center mb-6">Join Game</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Your name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Enter your name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleJoin();
                }
              }}
            />
          </div>
          <button
            onClick={handleJoin}
            className="w-full py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold transition duration-200 shadow-lg shadow-indigo-500/20"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default JoinGame;
