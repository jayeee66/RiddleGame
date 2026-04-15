import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import MediaInput from '../Component/MediaInput';

function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const { getStoredGames, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState(10);
  const [answers, setAnswers] = useState(['', '', '', '', '', '']);
  const [questionType, setQuestionType] = useState('single');
  const [idx, setIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [points, setPoints] = useState(1);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const stored = getStoredGames();
    const foundGame = Object.values(stored).find(g => g.id === parseInt(gameId, 10));
    if (!foundGame) return navigate('/');
    setGame(foundGame);
    const q = foundGame.questions.find(q => q.id === parseInt(questionId, 10));
    setQuestionText(q.questionText);
    setDuration(q.duration);
    setAnswers(q.answers);
    const type = q.questionType || (q.correctAnswers.length > 1 ? 'multiple' : 'single');
    setQuestionType(type);
    setMedia(q.media || null);
    setMediaType(q.mediaType || null);
    setPoints(q.points || 1);
    if (type === 'multiple') {
      setCorrectAnswers(q.correctAnswers.map(ans => q.answers.indexOf(ans)).filter(i => i >= 0));
    } else if (type === 'judgement') {
      setIdx(q.correctAnswers[0] === 'True' ? 0 : 1);
    } else {
      setIdx(q.answers.indexOf(q.correctAnswers[0]));
    }
  }, [gameId, questionId, navigate]);

  const validate = () => {
    if (!questionText.trim()) return 'Question text is required.';
    if (!duration || Number(duration) < 1) return 'Duration must be at least 1 second.';
    if (!points || Number(points) < 1) return 'Points must be at least 1.';
    if (questionType !== 'judgement') {
      const nonEmpty = answers.filter(a => a.trim() !== '');
      if (nonEmpty.length < 2) return 'At least 2 answers are required.';
      if (questionType === 'single') {
        if (!answers[idx] || answers[idx].trim() === '') return 'The selected correct answer cannot be empty.';
      } else {
        if (correctAnswers.length === 0) return 'Select at least one correct answer.';
        if (correctAnswers.some(i => !answers[i] || answers[i].trim() === '')) return 'Correct answers cannot be empty.';
      }
    }
    return null;
  };

  const saveQuestion = async () => {
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    const formattedCorrect =
      questionType === 'multiple'
        ? correctAnswers.map(i => answers[i])
        : questionType === 'judgement'
          ? [idx === 0 ? 'True' : 'False']
          : [answers[idx]];
    const updatedQuestion = {
      id: parseInt(questionId, 10),
      questionText,
      duration: Number(duration),
      answers: [...answers],
      questionType,
      correctAnswers: formattedCorrect,
      media,
      mediaType,
      points: Number(points),
    };
    const updatedGame = {
      ...game,
      questions: game.questions.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    };
    setGame(updatedGame);
    await updateGame(updatedGame);
    navigate(`/game/${gameId}`);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

  if (!game) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">
      <div className="max-w-2xl mx-auto px-6 py-8">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Question #{questionId}</h1>
            <p className="text-slate-400 text-sm mt-1">{game.name || 'Untitled'}</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">

          <div>
            <p className="text-slate-300 text-sm font-medium mb-2">Type</p>
            <div className="flex gap-2">
              {['single', 'multiple', 'judgement'].map(type => (
                <button
                  key={type}
                  onClick={() => setQuestionType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${questionType === type ? 'bg-indigo-500 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                >
                  {type === 'single' ? 'Single' : type === 'multiple' ? 'Multiple' : 'Judgement'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-300 text-sm font-medium block mb-1.5">Question</label>
            <input
              type="text"
              className={inputCls}
              placeholder="Enter your question"
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
            />
          </div>

          <MediaInput
            media={media}
            mediaType={mediaType}
            onChange={(src, type) => { setMedia(src); setMediaType(type); }}
          />

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Duration (s)</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </div>
            <div className="w-28">
              <label className="text-slate-300 text-sm font-medium block mb-1.5">Points</label>
              <input
                type="number"
                min={1}
                className={inputCls}
                value={points}
                onChange={e => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div>
            <p className="text-slate-300 text-sm font-medium mb-2">
              {questionType === 'multiple'
                ? 'Answers (select all correct)'
                : questionType === 'judgement'
                  ? 'Correct answer'
                  : 'Answers (select correct)'}
            </p>

            {questionType === 'judgement' ? (
              <div className="flex gap-2">
                {['True', 'False'].map((label, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className={`flex-1 py-2 rounded-xl border text-sm font-medium transition ${idx === i ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {answers.map((ans, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (questionType === 'single') {
                          setIdx(i);
                        } else {
                          setCorrectAnswers(prev =>
                            prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                          );
                        }
                      }}
                      className={`w-5 h-5 rounded shrink-0 border-2 flex items-center justify-center transition ${
                        (questionType === 'single' ? idx === i : correctAnswers.includes(i))
                          ? 'bg-indigo-500 border-indigo-500'
                          : 'border-slate-600 hover:border-slate-400'
                      }`}
                    >
                      {(questionType === 'single' ? idx === i : correctAnswers.includes(i)) && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                    <input
                      type="text"
                      placeholder={`Answer ${i + 1}`}
                      value={ans}
                      onChange={e => {
                        const copy = [...answers];
                        copy[i] = e.target.value;
                        setAnswers(copy);
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                    />
                    {answers.length > 2 && (
                      <button
                        onClick={() => {
                          setAnswers(prev => prev.filter((_, j) => j !== i));
                          if (questionType === 'single' && idx >= i) setIdx(Math.max(0, idx - 1));
                          if (questionType === 'multiple') {
                            setCorrectAnswers(prev =>
                              prev.filter(x => x !== i).map(x => x > i ? x - 1 : x)
                            );
                          }
                        }}
                        className="text-slate-600 hover:text-red-400 transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                {answers.length < 6 && (
                  <button
                    onClick={() => setAnswers(prev => [...prev, ''])}
                    className="w-full py-2 rounded-xl border border-dashed border-white/20 text-slate-500 hover:text-slate-300 hover:border-white/40 text-sm transition"
                  >
                    + Add answer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {validationError && (
          <p className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {validationError}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          <button
            className="flex-1 py-2.5 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm font-medium transition"
            onClick={() => navigate(`/game/${gameId}`)}
          >
            Cancel
          </button>
          <button
            className="flex-1 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition"
            onClick={saveQuestion}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
}

export default EditQuestion;
