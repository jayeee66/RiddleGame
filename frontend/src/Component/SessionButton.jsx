import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import EndGameModal from './EndGameModal';
import { useSessionStatus } from '../hooks/useSessionStatus';

function SessionButton({ gameId, active, onRefresh, questionCount = 0 }) {
  const [localSessionId, setLocalSessionId] = useState(null);
  const sessionId = localSessionId || active || null;
  const [copied, setCopied] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endedSessionId, setEndedSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { position, totalQuestions, checkStatus } = useSessionStatus(sessionId);

  const mutation = async (type, onSuccess) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:5005/admin/game/${gameId}/mutate`,
        { mutationType: type },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (response.status === 200) onSuccess?.(response.data?.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
      onRefresh?.();
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (questionCount === 0) {
      setError('Add at least one question before starting the game.');
      return;
    }
    mutation("START", (data) => {
      if (data?.sessionId) setLocalSessionId(data.sessionId);
      onRefresh?.();
    });
  };

  const handleStop = () => {
    const currentSessionId = sessionId;
    mutation("END", () => {
      setEndedSessionId(currentSessionId);
      setShowEndModal(true);
      setLocalSessionId(null);
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
        onConfirm={() => { setShowEndModal(false); navigate(`/results/${endedSessionId}`); }}
      />

      {error && (
        <p className="text-xs text-red-400 mt-1">{error}</p>
      )}

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
                  style={{ width: `${totalQuestions > 0 ? ((position + 1) / totalQuestions) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {position === -1 ? 'Not started' : `${position + 1} / ${totalQuestions}`}
              </span>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {position === null || totalQuestions === null ? (
              <p className="text-slate-500 text-xs w-full text-center py-2">Loading…</p>
            ) : position < totalQuestions - 1 ? (
              <button
                className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition flex items-center justify-center gap-1 disabled:opacity-50"
                onClick={handleAdvance}
                disabled={loading}
              >
                {position === -1 ? 'Start First Question' : 'Next Question'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                className="flex-1 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-400 text-sm font-medium transition disabled:opacity-50"
                onClick={handleStop}
                disabled={loading}
              >
                End Game
              </button>
            )}
          </div>
        </div>
      ) : (
        <button
          className="mt-3 w-full py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? 'Starting…' : 'Start Game'}
        </button>
      )}
    </>
  );
}

export default SessionButton;
