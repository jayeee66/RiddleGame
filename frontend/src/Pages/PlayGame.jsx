import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AnswerButton from '../Component/AnswerButton';

const getEmbedUrl = (url) => {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}?autoplay=0`;
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return null;
};

function VideoPlayer({ src }) {
  const embed = getEmbedUrl(src);
  if (embed) {
    return (
      <iframe
        src={embed}
        className="w-full max-h-64 aspect-video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }
  return <video src={src} controls className="w-full max-h-64" />;
}

function PlayGame() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [started, setStarted] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const isMulti = question?.type === 'multiple';
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const startTimeRef = useRef(null);
  const durationRef = useRef(0);
  const lastIsoRef = useRef(null);
  const answeredRef = useRef(false);

  // 1. Poll until game starts
  useEffect(() => {
    if (started) return;
    const interval = setInterval(async () => {
      const res = await axios.get(`http://localhost:5005/play/${playerId}/status`);
      setStarted(res.data.started);
    }, 500);
    return () => clearInterval(interval);
  }, [started, playerId]);

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/question`);
      const q = response.data.question;
      if (q.isoTimeLastQuestionStarted === lastIsoRef.current) return;
      lastIsoRef.current = q.isoTimeLastQuestionStarted;
      startTimeRef.current = new Date(q.isoTimeLastQuestionStarted);
      durationRef.current = q.duration;
      answeredRef.current = false;
      const answers = q.answers.filter(a => a && a.trim() !== '');
      setQuestion({
        questionText: q.questionText,
        duration: q.duration,
        answers,
        correctAnswers: q.correctAnswers,
        media: q.media || null,
        mediaType: q.mediaType || null,
      });
      setTimer(q.duration);
      setSelectedAnswer([]);
    } catch (error) {
      if (error) navigate(`/player/${playerId}/result`);
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswers(response.data.answers);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  // 2. Poll for new questions
  useEffect(() => {
    if (!started) return;
    const interval = setInterval(fetchQuestion, 500);
    return () => clearInterval(interval);
  }, [started]);

  // 3. Countdown timer + trigger fetchAnswers once when time runs out
  useEffect(() => {
    if (!started) return;
    const countdown = setInterval(() => {
      if (!startTimeRef.current) return;
      const now = new Date();
      const end = new Date(startTimeRef.current.getTime() + durationRef.current * 1000);
      const timeLeft = Math.max(Math.ceil((end - now) / 1000), 0);
      setTimer(timeLeft);
      if (timeLeft === 0 && !answeredRef.current) {
        answeredRef.current = true;
        fetchAnswers();
      }
    }, 500);
    return () => clearInterval(countdown);
  }, [started]);

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
          {question?.media && (
            <div className="mb-3 rounded-xl overflow-hidden">
              {question.mediaType === 'image' ? (
                <img src={question.media} alt="" className="w-full max-h-64 object-contain" />
              ) : (
                <VideoPlayer src={question.media} />
              )}
            </div>
          )}
          <h1 className="my-2 font-[700] text-xl">{question?.questionText}</h1>
          <p className="my-2 text-sm">Time remaining: {timer} seconds</p>

          <div className="grid gap-2">
            {question?.answers.map((answer, i) => (
              <AnswerButton
                key={i}
                answer={answer}
                selected={selectedAnswer.includes(answer)}
                correct={timer === 0 && correctAnswers.includes(answer)}
                disabled={timer === 0}
                onClick={() => putAnswers(answer)}
              />
            ))}
          </div>

          {timer === 0 && question && correctAnswers.length > 0 && (
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
