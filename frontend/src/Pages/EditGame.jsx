import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import Modal from '../Component/Modal';
import MediaInput from '../Component/MediaInput';

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { getStoredGames, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState(10);
  const [answers, setAnswers] = useState(['', '']);
  const [questionType, setQuestionType] = useState('single');
  const [idx, setIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [points, setPoints] = useState(1);
  const [validationError, setValidationError] = useState(null);

  useEffect(() => {
    const stored = getStoredGames();
    const editable = Object.values(stored).find(g => g.id === parseInt(gameId, 10));
    if (!editable) return navigate('/');
    setGame(editable);
  }, [gameId, navigate]);

  const resetForm = () => {
    setQuestionText('');
    setDuration(10);
    setAnswers(['', '']);
    setQuestionType('single');
    setIdx(0);
    setCorrectAnswers([]);
    setMedia(null);
    setMediaType(null);
    setPoints(1);
    setValidationError(null);
  };

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

  const addQuestion = async () => {
    const err = validate();
    if (err) { setValidationError(err); return; }
    setValidationError(null);
    const newId = game.questions.length > 0
      ? Math.max(...game.questions.map(q => q.id || 0)) + 1
      : 1;
    let answersObject;
    if (questionType === 'multiple') {
      answersObject = correctAnswers.map(i => answers[i]);
    } else if (questionType === 'judgement') {
      answersObject = [idx === 0 ? 'True' : 'False'];
    } else {
      answersObject = [answers[idx]];
    }
    const question = {
      id: newId,
      questionText,
      duration: Number(duration),
      answers: questionType === 'judgement' ? ['True', 'False'] : [...answers],
      questionType,
      correctAnswers: answersObject,
      media,
      mediaType,
      points: Number(points),
    };
    const updatedGame = { ...game, questions: [...game.questions, question] };
    setGame(updatedGame);
    setShowAdd(false);
    resetForm();
    await updateGame(updatedGame);
  };

  const deleteQuestion = async (index) => {
    const updatedGame = { ...game, questions: game.questions.filter((_, i) => i !== index) };
    setGame(updatedGame);
    await updateGame(updatedGame);
  };

  const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

  if (!game) return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 flex items-center justify-center">
      <p className="text-slate-400">Loading…</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">{game.name || 'Untitled'}</h1>
            <p className="text-slate-400 text-sm mt-1">{game.questions.length} question{game.questions.length !== 1 ? 's' : ''}</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold text-sm transition shadow-lg shadow-indigo-500/25"
            onClick={() => setShowAdd(true)}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Question
          </button>
        </div>

        {/* Empty state */}
        {game.questions.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No questions yet. Add your first one!</p>
          </div>
        )}

        {/* Question list */}
        <div className="space-y-3">
          {game.questions.map((q, i) => (
            <div
              key={q.id}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-white/8 transition"
            >
              <div
                className="flex-1 cursor-pointer"
                onClick={() => navigate(`/game/${game.id}/question/${q.id}`)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                    Q{i + 1}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700 text-slate-400">
                    {q.questionType === 'single' ? 'Single' : q.questionType === 'multiple' ? 'Multiple' : 'Judgement'}
                  </span>
                  <span className="text-xs text-slate-500">{q.duration}s</span>
                  <span className="text-xs text-slate-500">{q.points || 1}pt</span>
                </div>
                <p className="text-white font-medium hover:text-indigo-300 transition">
                  {q.questionText || 'Untitled question'}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  {q.answers?.filter(a => a).length} answers · Correct: {q.correctAnswers?.join(', ')}
                </p>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
                  onClick={() => navigate(`/game/${game.id}/question/${q.id}`)}
                  aria-label="Edit question"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                  onClick={() => deleteQuestion(i)}
                  aria-label="Delete question"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Question Modal */}
      <Modal
        isOpen={showAdd}
        title="New Question"
        error={validationError}
        footer={
          <>
            <button
              className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition"
              onClick={() => { setShowAdd(false); resetForm(); }}
            >
              Cancel
            </button>
            <button
              className="flex-1 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-semibold transition"
              onClick={addQuestion}
            >
              Add
            </button>
          </>
        }
      >
        {/* Question type */}
        <div className="mb-4">
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

        {/* Question text */}
        <div className="mb-3">
          <label className="text-slate-300 text-sm font-medium block mb-1.5">Question</label>
          <input
            type="text"
            className={inputCls}
            placeholder="Enter your question"
            value={questionText}
            onChange={e => setQuestionText(e.target.value)}
          />
        </div>

        {/* Duration + Points */}
        <div className="mb-4 flex gap-3">
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

        {/* Media */}
        <div className="mb-4">
          <MediaInput
            media={media}
            mediaType={mediaType}
            onChange={(src, type) => { setMedia(src); setMediaType(type); }}
          />
        </div>

        {/* Answers */}
        <div className="mb-2">
          <p className="text-slate-300 text-sm font-medium mb-2">
            {questionType === 'multiple' ? 'Answers (select all correct)' : questionType === 'judgement' ? 'Correct answer' : 'Answers (select correct)'}
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
                        if (questionType === 'multiple') setCorrectAnswers(prev => prev.filter(x => x !== i).map(x => x > i ? x - 1 : x));
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
      </Modal>
    </div>
  );
}

export default EditGame;
