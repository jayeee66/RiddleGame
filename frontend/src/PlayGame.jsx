import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

function PlayGame() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [started, setStarted] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [lastQuestion, setLastQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const isMulti = question?.type === 'multiple';
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (started) return;
    const interval = setInterval(async () => {
      const getStarted = await axios.get(`http://localhost:5005/play/${playerId}/status`);
      setStarted(getStarted.data.started);
    }, 500);
    return () => clearInterval(interval);
  }, [playerId, started]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/question`);
      const q = response.data.question;
      const answers = q.answers.filter(a => a && a.trim() !== '');
      if (!lastQuestion || lastQuestion !== q.questionText) {
        setQuestion({
          questionText: q.questionText,
          duration: q.duration,
          answers,
          correctAnswers: q.correctAnswers
        });
        setTimer(q.duration);
        setStartTime(new Date(q.isoTimeLastQuestionStarted));
        setLastQuestion(q.questionText);
        setSelectedAnswer([]);
      }
    } catch (error) {
      if (error) navigate(`/player/${playerId}/result`);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (started) fetchQuestion();
    }, 500);
    return () => clearInterval(interval);
  }, [playerId, question, started]);

  useEffect(() => {
    const countdown = setInterval(() => {
      const now = new Date();
      const end = new Date(startTime.getTime() + question.duration * 1000);
      const timeLeft = Math.max(Math.ceil((end - now) / 1000), 0);
      setTimer(timeLeft);
    }, 1000);
    return () => clearInterval(countdown);
  }, [question, startTime, started]);

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswers(response.data.answers);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  useEffect(() => {
    if (timer === 0) fetchAnswers();
  }, [timer]);

  const putAnswers = async (answer) => {
    const updatedAnswers = isMulti
      ? selectedAnswer.includes(answer)
        ? selectedAnswer.filter((a) => a !== answer)
        : [...selectedAnswer, answer]
      : [answer];
    setSelectedAnswer(updatedAnswers);
    try {
      await axios.put(`http://localhost:5005/play/${playerId}/answer`, { answers: updatedAnswers });
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center bg-gray-100">
      {!started ? (
        <h1 className="my-2 font-[700] text-xl">Waiting for game to start...</h1>
      ) : !question ? (
        <h1 className="my-2 font-[700] text-xl">Loading...</h1>
      ) : (
        <div>
          <h1 className="my-2 font-[700] text-xl">{question?.questionText}</h1>
          <p className="my-2 text-sm">Time remaining: {timer} seconds</p>

          <div className="grid gap-2">
            {question?.answers.map((answer, i) => (
              <button
                key={i}
                className={`p-3 w-full border-1 border-solid rounded text-left hover:bg-gray-300 ${selectedAnswer.includes(answer) ? 'bg-gray-300' : ''}`}
                onClick={() => putAnswers(answer)}
                disabled={timer === 0}
              >
                {answer}
              </button>
            ))}
          </div>

          {timer === 0 && (
            <div className="absolute inset-0 bg-gray bg-opacity-40 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transform scale-95">
                <p className="text-green-800 font-[600] mb-2 text-lg">Correct answers</p>
                <ul>
                  {correctAnswers.map((ans, index) => (
                    <li key={index}>{ans}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PlayGame;
