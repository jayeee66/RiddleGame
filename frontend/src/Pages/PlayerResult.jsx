import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function PlayerResult() {
  const { playerId } = useParams();
  const [playerResult, setPlayerResult] = useState([]);
  const getPlayerResult = async () => {
    const response = await axios.get(`http://localhost:5005/play/${playerId}/results`);
    setPlayerResult(response.data);

  }
  useEffect(() => {
    getPlayerResult();
  }, []);
  const totalQuestions = playerResult.length;
  const score = playerResult.filter((a) => a.correct).length;
  const scoreRate = Math.round((score / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-white text-center pt-4">Your Results</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Questions', value: totalQuestions },
            { label: 'Correct', value: score },
            { label: 'Accuracy', value: `${scoreRate || 0}%` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-400 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <table className="table-auto w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-4 py-3 text-slate-400 font-medium">#</th>
                <th className="px-4 py-3 text-slate-400 font-medium">Your Answer</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-center">Score</th>
                <th className="px-4 py-3 text-slate-400 font-medium text-center">Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {playerResult.map((ans, i) => {
                const timeSec = ((new Date(ans.answeredAt) - new Date(ans.questionStartedAt)) / 1000).toFixed(1);
                return (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 text-white">{ans.answers.join(', ') || '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${ans.correct ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-400'}`}>
                        {ans.correct ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 text-center">{timeSec}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default PlayerResult;
