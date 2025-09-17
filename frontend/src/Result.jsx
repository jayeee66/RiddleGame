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
      const stats = await fetchResults(sessionId);
      setResult(stats);
      setLoading(false);
      const scores = getScore(stats.results);
      const top5 = scores.sort((a, b) => b.score - a.score).slice(0, 5);
      setTop5(top5);
      const { data, maxAnswerTime } = getChartData(stats.results);
      setChartData(data);
      setMaxTime(maxAnswerTime);
    };
    getResults();
  }, []);

  //Get score
  const getScore = (results) => {
    return results.map((player) => {
      const score = player.answers.filter((a) => a.correct).length;
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
    return <p className="p-4">Loading...</p>;
  }
  if (!result) {
    return <p className="p-4">No results found</p>;
  }

  return (
    <div className="p-6">

      {/* Top 5 players table*/}
      <table>
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">Name</th>
            <th className="p-2">Score</th>
          </tr>
        </thead>
        <tbody>
          {top5.map((player, i) => (
            <tr key={i}>
              <td className="p-2">{player.name}</td>
              <td className="p-2">{player.score}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Charts */}
      <div className="my-8 space-y-10">
        {/* Correct Rate Bar Chart */}
        <div>
          <h2 className="my-2 font-[600] font-lg">Correct Rate for answering per Question (%)</h2>
          <ResponsiveContainer width="40%" height={500}>
            <BarChart data={chartData}>
              <XAxis dataKey="question" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}`, 'Correct Rate']}  // [value, name]
              />
              <Bar dataKey="correctRate" fill="#8884d8" unit="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Average Time Line Chart */}
        <div>
          <h2 className="my-2 font-[600] font-lg">Average Time for answering per Question (s)</h2>
          <ResponsiveContainer width="40%" height={500}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="question" />
              <YAxis domain={[0, maxTime]} />
              <Tooltip
                formatter={(value) => [`${value}`, 'Average Time']}  // [value, name]
              />
              <Line dataKey="avgTime" stroke="#8884d8" unit="s" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>


  )
}

export default Result;
