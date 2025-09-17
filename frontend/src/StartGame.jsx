import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CopyToClipboard } from 'react-copy-to-clipboard';

// Session button component
function SessionButton({ gameId, active, onRefresh }) {
  const sessionId = active || null;
  const [sessionActive, setSessionActive] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(null);

  // Check if session is active and light up
  const checkStatus = async (sessionId) => {
    try {
      const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      if (response.status === 200) {
        setPosition(response.data.results.position);
        setTotalQuestions(response.data.results.questions.length);
        setSessionActive(true);
      }
    } catch (error) {
      alert("Error fetching session:", error);
    }
  };

  useEffect(() => {
    if (!sessionId) return;
    // Poll the status of the session every 2 seconds
    const interval = setInterval(() => {
      checkStatus(sessionId);
    }, 2000);
    return () => clearInterval(interval);
  }, [sessionId]);


  // Mutation function
  const mutation = async (type, successJob) => {
    try {
      const response = await axios.post(`http://localhost:5005/admin/game/${gameId}/mutate`,
        {
          "mutationType": type
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          }
        }
      );
      if (response.status === 200) {
        successJob && successJob();
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleStart = () => {
    mutation("START", () => {
      setSessionActive(true);
      onRefresh?.();
    });
  }

  const handleStop = async () => {
    mutation("END", () => {
      const goToResult = window.confirm("Would you like to view the results?");
      if (goToResult) {
        navigate(`/results/${sessionId}`);
      } else {
        onRefresh?.();
      }
    });
  }

  const handleAdvance = () => {
    mutation("ADVANCE", () => {
      checkStatus(sessionId);
      onRefresh?.();
    });
  }

  return (
    <div>

      {/* active light, red or green */}
      <div className="flex items-center absolute top-2 right-2 space-x-1">
        <div
          className={`w-3 h-3 rounded-full ${sessionActive ? 'bg-green-500' : 'bg-red-500'
          }`}
          title={sessionActive ? 'Active' : 'Inactive'}
        ></div>
        <span className="text-xs">
          {sessionActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* start/stop button */}
      {sessionId ? (
        <>
          {/* Loading status, only show if loading */}

          <p className="my-1 absolute bottom-15 right-33 text-sm text-zinc-600">
            Question {position + 1} / {totalQuestions}
          </p>

          {/* Skip button, only show if not at the end of the game */}
          {position !== null && totalQuestions !== null && position < totalQuestions - 1 && (
            <button
              className="my-2 p-2 rounded-[.400rem] absolute bottom-0 right-40 cursor-pointer bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
              onClick={handleAdvance}
            >
              Skip
            </button>
          )}

          {/* Stop button, only show if game is active */}
          <button
            className="my-2 p-2 rounded-[.400rem] absolute bottom-0 right-10 bg-red-600 hover:bg-fuchsia-400 text-white transition duration-300 ease-in-out"
            onClick={handleStop}
          >
            Stop Game
          </button>
          <div className="absolute right-10 z-10 p-4 bg-white border border-gray-300 shadow-md rounded-md top-14 w-[250px]">
            <p className="my-2 text-sm">Session started!</p>
            <p className="my-2 break-normal text-xs">
              ID: <strong>{sessionId}</strong>
            </p>
            <CopyToClipboard text={`${window.location.origin}/session/join?sessionId=${sessionId}`}
              onCopy={() => setCopied(true)}
            >
              <button className="my-2 p-2 w-full rounded-[.400rem] cursor-pointer bg-blue-600 hover:bg-sky-400 text-xs text-white transition duration-300 ease-in-out">
                {copied ? 'Copied' : 'Copy Link'}
              </button>
            </CopyToClipboard>
          </div>
        </>
      ) : (
        <button
          className="my-2 p-2 rounded-[.400rem] absolute bottom-0 right-10 cursor-pointer bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
          onClick={handleStart}
        >
          Start Game
        </button>
      )}

    </div>

  );
}
export default SessionButton;
