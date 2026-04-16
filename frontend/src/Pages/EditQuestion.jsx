import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGames } from '../hooks/useGames';
import { useQuestionForm } from '../hooks/useQuestionForm';
import QuestionFormFields from '../Component/QuestionFormFields';

function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const { getStoredGames, updateGame } = useGames();
  const [game, setGame] = useState(null);
  const form = useQuestionForm();

  useEffect(() => {
    const stored = getStoredGames();
    const foundGame = Object.values(stored).find(g => g.id === parseInt(gameId, 10));
    if (!foundGame) return navigate('/');
    setGame(foundGame);
    const q = foundGame.questions.find(q => q.id === parseInt(questionId, 10));
    form.setQuestionText(q.questionText);
    form.setDuration(q.duration);
    form.setAnswers(q.answers);
    const type = q.questionType || (q.correctAnswers.length > 1 ? 'multiple' : 'single');
    form.setQuestionType(type);
    form.setMedia(q.media || null);
    form.setMediaType(q.mediaType || null);
    form.setPoints(q.points || 1);
    if (type === 'multiple') {
      form.setCorrectAnswers(q.correctAnswers.map(ans => q.answers.indexOf(ans)).filter(i => i >= 0));
    } else if (type === 'judgement') {
      form.setIdx(q.correctAnswers[0] === 'True' ? 0 : 1);
    } else {
      form.setIdx(q.answers.indexOf(q.correctAnswers[0]));
    }
  }, [gameId, questionId, navigate]);

  const saveQuestion = async () => {
    const err = form.validate();
    if (err) { form.setValidationError(err); return; }
    form.setValidationError(null);
    const formattedCorrect =
      form.questionType === 'multiple'
        ? form.correctAnswers.map(i => form.answers[i])
        : form.questionType === 'judgement'
          ? [form.idx === 0 ? 'True' : 'False']
          : [form.answers[form.idx]];
    const updatedQuestion = {
      id: parseInt(questionId, 10),
      questionText: form.questionText,
      duration: Number(form.duration),
      answers: [...form.answers],
      questionType: form.questionType,
      correctAnswers: formattedCorrect,
      media: form.media,
      mediaType: form.mediaType,
      points: Number(form.points),
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

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <QuestionFormFields form={form} />
        </div>

        {form.validationError && (
          <p className="mt-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {form.validationError}
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
