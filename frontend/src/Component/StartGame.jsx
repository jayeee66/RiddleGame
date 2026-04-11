import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import EndGameModal from './EndGameModal';
import { useSessionStatus } from '../hooks/useSessionStatus';

function SessionButton({ gameId, active, onRefresh }) {
  const sessionId = active || null;
  const [copied, setCopied] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const navigate = useNavigate();
  const { position, totalQuestions, checkStatus } = useSessionStatus(sessionId);

  const mutation = async (type, onSuccess) => {
    try {
      const response = await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: type },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.status === 200) onSuccess?.();
    } catch (error) {
      console.error(error.response?.data?.error);
    }
  };

  const handleStart = () => {
    mutation("START", () => {
      onRefresh?.();
    });
  };

  const handleStop = () => {
    mutation("END", () => {
      setShowEndModal(true);
      onRefresh?.();
    });
  };

  const handleAdvance = () => {
    mutation("ADVANCE", () => {
      checkStatus(sessionId);
      onRefresh?.();
    });
  };

  return (
    <>
      <EndGameModal
        isOpen={showEndModal}
        onCancel={() => setShowEndModal(false)}
        onConfirm={() => { setShowEndModal(false); navigate(`/results/${sessionId}`); }}
      />

      {sessionId ? (
        <div className="mt-3 space-y-3">
          {/* Session info */}
          <div className="rounded-xl bg-slate-700/50 border border-white/5 px-3 py-2 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400">Session ID</p>
              <p className="text-sm font-mono font-semibold text-white">{sessionId}</p>
            </div>
            <CopyToClipboard
              text={`${window.location.origin}/session/join?sessionId=${sessionId}`}
              onCopy={() => setCopied(true)}
            >
              <button className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 text-xs font-medium transition">
                {copied ? '✓ Copied' : 'Copy Link'}
              </button>
            </CopyToClipboard>
          </div>

          {/* Progress */}
          {position !== null && totalQuestions !== null && (
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${((position + 1) / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {position + 1} / {totalQuestions}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {position !== null && totalQuestions !== null && position < totalQuestions - 1 && (
              <button
                className="flex-1 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition flex items-center justify-center gap-1"
                onClick={handleAdvance}
              >
                Next
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
            <button
              className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm font-medium transition"
              onClick={handleStop}
            >
              End Game
            </button>
          </div>
        </div>
      ) : (
        <button
          className="mt-3 w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-500/20"
          onClick={handleStart}
        >
          Start Game
        </button>
      )}
    </>
  );
}

export default SessionButton;
