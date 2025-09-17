import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

function EditQuestion() {
  const { gameId, questionId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState(10);
  const [answers, setAnswers] = useState(['', '', '', '', '', '']);
  const [questionType, setQuestionType] = useState('single');
  const [idx, setIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  useEffect(() => {
    const stored = localStorage.getItem('games');
    if (!stored) return navigate('/');
    const games = JSON.parse(stored);
    const foundGame = games.find(g => g.id === parseInt(gameId, 10));
    if (!foundGame) return navigate('/');
    setGame(foundGame);
    const q = foundGame.questions.find(q => q.id === parseInt(questionId, 10));
    setQuestionText(q.questionText);
    setDuration(q.duration);
    setAnswers(q.answers);
    const type = q.questionType || (q.correctAnswers.length > 1 ? 'multiple' : 'single');
    setQuestionType(type);
    if (type === 'multiple') {
      const idxs = q.correctAnswers.map(ans => q.answers.indexOf(ans)).filter(i => i >= 0);
      setCorrectAnswers(idxs);
    } else if (type === 'judgement') {
      setIdx(q.correctAnswers[0] === 'True' ? 0 : 1);
    } else {
      setIdx(q.answers.indexOf(q.correctAnswers[0]));
    }
  }, [gameId, questionId, navigate]);
  const putGames = async (gamesObject) => {
    try {
      const token = localStorage.getItem('token');
      const payload = JSON.stringify({ games: gamesObject });
      const res = await fetch('http://localhost:5005/admin/games', {
        method: 'PUT',
        headers: {
          Accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: payload,
      });
      const data = await res.json();
      if (!res.ok) alert(data.error);
    } catch (e) {
      alert(e.message);
    }
  };
  const saveQuestion = async () => {
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
    };
    const updatedGame = {
      ...game,
      questions: game.questions.map(q =>
        q.id === updatedQuestion.id ? updatedQuestion : q
      ),
    };
    setGame(updatedGame);
    const allGames = JSON.parse(localStorage.getItem('games'));
    const updatedAll = allGames.map(g =>
      g.id === updatedGame.id ? updatedGame : g
    );
    localStorage.setItem('games', JSON.stringify(updatedAll));
    await putGames(updatedAll);
    navigate(`/game/${gameId}`);
  };
  if (!game) return <div className="p-6">Loading…</div>;
  return (
    <div className="p-6">
      <h1 className="my-2 font-[700] text-2xl">Edit Question #{questionId}</h1>
      <div>
        <span className="font-[500]">Type</span>
        <div className="my-1 flex gap-4">
          {['single', 'multiple', 'judgement'].map(type => (
            <label key={type} className="flex items-center">
              <input
                type="radio"
                name="questionType"
                value={type}
                checked={questionType === type}
                onChange={() => setQuestionType(type)}
                className="mx-1"
              />
              {type === 'single' && 'Single Choice'}
              {type === 'multiple' && 'Multiple Choice'}
              {type === 'judgement' && 'Judgement'}
            </label>
          ))}
        </div>
      </div>
      <label className="my-2 block">
        <span className="font-[500]">Question</span>
        <input
          type="text"
          className="p-2 rounded border w-full"
          value={questionText}
          onChange={e => setQuestionText(e.target.value)}
        />
      </label>
      <label className="my-2 block">
        <span className="font-[500]">Duration (s)</span>
        <input
          type="number"
          className="p-2 rounded border w-full"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          min={1}
        />
      </label>
      {questionType === 'judgement' ? (
        <div>
          <span className="font-[500]">Correct Answer</span>
          <div className="my-2 flex gap-4">
            {['True', 'False'].map((label, i) => (
              <label key={i} className="flex items-center">
                <input
                  type="radio"
                  name="judgement"
                  checked={idx === i}
                  onChange={() => setIdx(i)}
                  className="mx-1"
                />
                {label}
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <span className="font-[500]">
            {questionType === 'single' ? 'Select correct answer' : 'Select correct answers'}
          </span>
          {answers.map((ans, i) => (
            <div key={i} className="my-1 flex items-center">
              {questionType === 'single' ? (
                <input
                  type="radio"
                  name="correctSingle"
                  checked={idx === i}
                  onChange={() => setIdx(i)}
                  className="mx-2"
                />
              ) : (
                <input
                  type="checkbox"
                  name="correctMultiple"
                  checked={correctAnswers.includes(i)}
                  onChange={() =>
                    setCorrectAnswers(prev =>
                      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
                    )
                  }
                  className="mx-2"
                />
              )}
              <input
                type="text"
                placeholder={`Answer ${i + 1}`}
                value={ans}
                onChange={e => {
                  const copy = [...answers];
                  copy[i] = e.target.value;
                  setAnswers(copy);
                }}
                className="flex-1 p-1 border rounded"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="p-3 rounded bg-gray-600 text-white hover:bg-zinc-400"
          onClick={() => navigate(`/game/${gameId}`)}
        >
          Cancel
        </button>
        <button
          className="p-3 rounded bg-green-600 text-white hover:bg-lime-400"
          onClick={saveQuestion}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default EditQuestion;
