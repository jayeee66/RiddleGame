import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from 'recharts';

function Result() {
  const { sessionId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [top5, setTop5] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [maxTime, setMaxTime] = useState(0);

  // Fetch results
  const fetchResults = async (sessionId) => {
    try {

      const response = await axios.get(`http://localhost:5005/admin/session/${sessionId}/results`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      alert("Error fetching result:", error);
    }
  };

  useEffect(() => {
    const getResults = async () => {
      const [stats, pointsList] = await Promise.all([
        fetchResults(sessionId),
        fetchPointsList(sessionId),
      ]);
      setResult(stats);
      setLoading(false);
      const scores = getScore(stats.results, pointsList);
      const top5 = scores.sort((a, b) => b.score - a.score).slice(0, 5);
      setTop5(top5);
      const { data, maxAnswerTime } = getChartData(stats.results);
      setChartData(data);
      setMaxTime(maxAnswerTime);
    };
    getResults();
  }, []);

  // Fetch points per question by finding which game owns this session
  const fetchPointsList = async (sid) => {
    try {
      const res = await axios.get('http://localhost:5005/admin/games', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const games = Array.isArray(res.data.games) ? res.data.games : Object.values(res.data.games || {});
      const game = games.find(g =>
        String(g.active) === String(sid) ||
        (Array.isArray(g.oldSessions) && g.oldSessions.map(String).includes(String(sid)))
      );
      return game ? game.questions.map(q => q.points || 1) : [];
    } catch (_) {
      return [];
    }
  };

  //Get score (weighted by points)
  const getScore = (results, pointsList) => {
    return results.map((player) => {
      const score = player.answers.reduce((sum, a, i) => sum + (a.correct ? (pointsList[i] || 1) : 0), 0);
      return {
        name: player.name,
        score: score,
      };
    });
  };

  //Get chart data
  const getChartData = (results) => {
    const numQuestions = results[0]?.answers.length;
    const data = [];
    let maxAnswerTime = 0;
    for (let i = 0; i < numQuestions; i++) {
      let total = 0; //number of players who answered the question
      let correct = 0; //number of correct answers
      let totalTime = 0; //total time taken to answer the question
      for (const player of results) {
        const answer = player.answers[i];
        total++;
        if (answer.correct) correct++;

        const start = new Date(answer.questionStartedAt); //Start answering time
        const end = new Date(answer.answeredAt); //End answering time
        const diffSec = (end - start) / 1000; //Time taken to answer the question
        totalTime += diffSec; //Total time taken to answer the question
        if (diffSec > maxAnswerTime) maxAnswerTime = diffSec; //Determine the maximum time taken to answer the question
      }

      data.push({
        question: i + 1,
        correctRate: Math.round((correct / total) * 1000) / 10,
        avgTime: Math.round((totalTime / total) * 10) / 10,
      });
    }
    return { data, maxAnswerTime: Math.ceil(maxAnswerTime) };

  }

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Loading results...</p>
        </div>
      </div>
    );
  }
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">
        <p className="text-slate-400 text-lg">No results found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-white text-center pt-4">Game Results</h1>

        {/* Top 5 leaderboard */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/10">
            <h2 className="text-white font-semibold">Top Players</h2>
          </div>
          <table className="table-auto w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-5 py-3 text-slate-400 font-medium text-left">Rank</th>
                <th className="px-5 py-3 text-slate-400 font-medium text-left">Name</th>
                <th className="px-5 py-3 text-slate-400 font-medium text-center">Score</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((player, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-5 py-3 text-slate-400">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </td>
                  <td className="px-5 py-3 text-white font-medium">{player.name}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-block px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 text-xs font-semibold">
                      {player.score}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          {/* Correct Rate Bar Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Correct Rate per Question (%)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData}>
                <XAxis dataKey="question" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value) => [`${value}%`, 'Correct Rate']}
                />
                <Bar dataKey="correctRate" fill="#6366f1" radius={[4, 4, 0, 0]} unit="%" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Average Time Line Chart */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-semibold mb-4">Average Answer Time per Question (s)</h2>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="question" stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <YAxis domain={[0, maxTime]} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.75rem', color: '#fff' }}
                  formatter={(value) => [`${value}s`, 'Average Time']}
                />
                <Line dataKey="avgTime" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8' }} unit="s" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
