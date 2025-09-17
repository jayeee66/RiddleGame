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
  // console.log(scoreRate); 
  for (let i = 0; i < totalQuestions; i++) {
    const startTime = new Date(playerResult[i].questionStartedAt);
    const endTime = new Date(playerResult[i].answeredAt);
    const timeDiff = (endTime - startTime) / 1000;
    console.log(timeDiff);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-6">
      <div className="max-w-4xl w-full space-y-6">
        {/* Summary */}
        <h2 className="text-2xl font-bold mb-2 text-center">Your Result</h2>
        <div className="flex justify-center items-center gap-6 flex-wrap text-white mb-4">
          <p className="text-sm">Total Questions: <span className="font-semibold">{totalQuestions}</span></p>
          <p className="text-sm">Total Score: <span className="font-semibold">{score}</span></p>
          <p className="text-sm">Accuracy: <span className="font-semibold">{scoreRate}%</span></p>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="table-auto w-full text-sm text-left border-collapse bg-white text-black rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border-b">#</th>
                <th className="px-4 py-2 border-b">Your Answer</th>
                <th className="px-4 py-2 border-b text-center">Score</th>
                <th className="px-4 py-2 border-b text-center">Answer Time (s)</th>
              </tr>
            </thead>
            <tbody>
              {playerResult.map((ans, i) => {
                const timeSec = ((new Date(ans.answeredAt) - new Date(ans.questionStartedAt)) / 1000).toFixed(1);
                return (
                  <tr key={i} className="even:bg-gray-50 hover:bg-blue-50 transition">
                    <td className="px-4 py-2 border-b">{i + 1}</td>
                    <td className="px-4 py-2 border-b">{ans.answers.join(', ') || '—'}</td>
                    <td className="px-4 py-2 border-b text-center">{ans.correct ? '1' : '0'}</td>
                    <td className="px-4 py-2 border-b text-center">{timeSec}</td>
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
