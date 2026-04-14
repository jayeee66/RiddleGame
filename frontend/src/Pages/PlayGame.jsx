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

const WAITING_MSGS = [
  'Waiting for the host to start...',
  'Get ready to answer!',
  'Sharpen your mind...',
  'The host is preparing the game...',
  'Challenge accepted? Stay sharp!',
];

function PlayGame() {
  const navigate = useNavigate();
  const { playerId } = useParams();
  const [started, setStarted] = useState(null);
  const [question, setQuestion] = useState(null);
  const [timer, setTimer] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState([]);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [waitingMsgIdx, setWaitingMsgIdx] = useState(0);

  useEffect(() => {
    if (started) return;
    const id = setInterval(() => setWaitingMsgIdx(i => (i + 1) % WAITING_MSGS.length), 3000);
    return () => clearInterval(id);
  }, [started]);
  const startTimeRef = useRef(null);
  const durationRef = useRef(0);
  const lastIsoRef = useRef(null);
  const answeredRef = useRef(false);
  const pointsRef = useRef([]);

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
      pointsRef.current = [...pointsRef.current, q.points || 1];
      const answers = q.answers.filter(a => a && a.trim() !== '');
      setQuestion({
        questionText: q.questionText,
        questionType: q.questionType,
        duration: q.duration,
        answers,
        correctAnswers: q.correctAnswers,
        media: q.media || null,
        mediaType: q.mediaType || null,
      });
      setTimer(q.duration);
      selectedAnswerRef.current = [];
      setSelectedAnswer([]);
      setCorrectAnswers([]);
    } catch (error) {
      if (error.response?.status === 400) navigate(`/player/${playerId}/result`, { state: { points: pointsRef.current } });
    }
  };

  const fetchAnswers = async () => {
    try {
      const response = await axios.get(`http://localhost:5005/play/${playerId}/answer`);
      setCorrectAnswers(response.data.answers);
    } catch (_) {
      answeredRef.current = false;
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

  const selectedAnswerRef = useRef([]);

  const putAnswers = async (answer) => {
    const isMulti = question?.questionType === 'multiple';
    const prev = selectedAnswerRef.current;
    const updatedAnswers = isMulti
      ? prev.includes(answer)
        ? prev.filter((a) => a !== answer)
        : [...prev, answer]
      : [answer];
    selectedAnswerRef.current = updatedAnswers;
    setSelectedAnswer(updatedAnswers);
    try {
      await axios.put(`http://localhost:5005/play/${playerId}/answer`, { answers: updatedAnswers });
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 p-4">
      {!started ? (
        <div className="text-center flex flex-col items-center gap-6">
          {/* Pulsing rings + icon */}
          <div className="relative w-28 h-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
            <div className="absolute inset-3 rounded-full bg-indigo-400/20 animate-ping" style={{ animationDelay: '0.4s' }} />
            <div className="relative w-20 h-20 rounded-full bg-indigo-900/60 border-2 border-indigo-400/50 flex items-center justify-center text-4xl select-none">
              🧠
            </div>
          </div>

          {/* Cycling message */}
          <p
            key={waitingMsgIdx}
            className="text-slate-200 text-lg font-medium"
            style={{ animation: 'fadeSlideIn 0.5s ease' }}
          >
            {WAITING_MSGS[waitingMsgIdx]}
          </p>

          {/* Bouncing dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>

          <style>{`
            @keyframes fadeSlideIn {
              from { opacity: 0; transform: translateY(6px); }
              to   { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      ) : !question ? (
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg font-medium">Loading...</p>
        </div>
      ) : (
        <div className="w-full max-w-xl">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
            {question?.media && (
              <div className="rounded-xl overflow-hidden">
                {question.mediaType === 'image' ? (
                  <img src={question.media} alt="" className="w-full max-h-64 object-contain" />
                ) : (
                  <VideoPlayer src={question.media} />
                )}
              </div>
            )}

            <div className="flex items-start justify-between gap-4">
              <h1 className="text-white font-semibold text-lg leading-snug">{question?.questionText}</h1>
              <div className={`shrink-0 text-2xl font-bold tabular-nums px-3 py-1 rounded-xl border ${timer <= 5 ? 'text-red-400 border-red-500/40 bg-red-500/10' : 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10'}`}>
                {timer}s
              </div>
            </div>

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
          </div>

        </div>
      )}
    </div>
  );
}

export default PlayGame;
