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
    try {
      const response = await axios.post(`http://localhost:5005/play/join/${sessionId}`,
        {
          name: name,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (name === '') {
        alert("Please enter your name");
        return;
      }
      if (response.status === 200) {
        const playerId = response.data.playerId;
        console.log("welcome", playerId);
        navigate(`/play/${playerId}`); // Navigate to the game page
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="flex justify-center items-center fixed inset-0 bg-gray-800 bg-opacity-30">
      <div className="p-6 rounded-[.600rem] bg-white w-full max-w-1/6">
        <h3 className="my-2 font-[600] text-center text-lg">Join Game</h3>
        <div className="my-2">
          <label className="my-1 font-[600] text-base flow-root">Please enter your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="my-2 p-2 w-full rounded-[.400rem] border-1 border-solid border-gray-300"
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
          className="my-2 p-3 w-full rounded-[.400rem] bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
        >
          Join Game
        </button>
      </div>
    </div>
  );
}

export default JoinGame;
