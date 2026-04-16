import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useQuestionForm } from '../hooks/useQuestionForm';
import Modal from '../Component/Modal';
import QuestionFormFields from '../Component/QuestionFormFields';

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { getStoredGames, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const form = useQuestionForm();

  useEffect(() => {
    const stored = getStoredGames();
    const editable = Object.values(stored).find(g => g.id === parseInt(gameId, 10));
    if (!editable) return navigate('/');
    setGame(editable);
  }, [gameId, navigate]);

  const addQuestion = async () => {
    const err = form.validate();
    if (err) { form.setValidationError(err); return; }
    form.setValidationError(null);
    const newId = game.questions.length > 0
      ? Math.max(...game.questions.map(q => q.id || 0)) + 1
      : 1;
    let answersObject;
    if (form.questionType === 'multiple') {
      answersObject = form.correctAnswers.map(i => form.answers[i]);
    } else if (form.questionType === 'judgement') {
      answersObject = [form.idx === 0 ? 'True' : 'False'];
    } else {
      answersObject = [form.answers[form.idx]];
    }
    const question = {
      id: newId,
      questionText: form.questionText,
      duration: Number(form.duration),
      answers: form.questionType === 'judgement' ? ['True', 'False'] : [...form.answers],
      questionType: form.questionType,
      correctAnswers: answersObject,
      media: form.media,
      mediaType: form.mediaType,
      points: Number(form.points),
    };
    const updatedGame = { ...game, questions: [...game.questions, question] };
    setGame(updatedGame);
    setShowAdd(false);
    form.reset();
    await updateGame(updatedGame);
  };

  const deleteQuestion = async (index) => {
    const updatedGame = { ...game, questions: game.questions.filter((_, i) => i !== index) };
    setGame(updatedGame);
    await updateGame(updatedGame);
  };

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
        error={form.validationError}
        footer={
          <>
            <button
              className="flex-1 py-2 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 text-sm transition"
              onClick={() => { setShowAdd(false); form.reset(); }}
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
        <QuestionFormFields form={form} />
      </Modal>
    </div>
  );
}

export default EditGame;
