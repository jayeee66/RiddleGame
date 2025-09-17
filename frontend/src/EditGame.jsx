import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.css';

function EditGame() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [duration, setDuration] = useState(10);
  const [answers, setAnswers] = useState(['', '', '', '', '', '']);
  const [questionType, setQuestionType] = useState('single');
  const [idx, setIdx] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);

  useEffect(() => {
    const games = localStorage.getItem('games');
    if (!games) return navigate('/');
    const data = JSON.parse(games);
    const editable = data.find(g => g.id === parseInt(gameId, 10));
    if (!editable) return navigate('/');
    setGame(editable);
  }, [gameId, navigate]);

  if (!game) return <div className="p-6">Loading…</div>;
  const putGames = async (gamesObject) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5005/admin/games', {
        method: 'PUT',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ games: gamesObject }),
      });
      const data = await response.json();
      if (!response.ok) alert(data.error);
    } catch (e) {
      alert(e.message);
    }
  };

  const resetForm = () => {
    setQuestionText('');
    setDuration(10);
    setAnswers(['', '', '', '', '', '']);
    setQuestionType('single');
    setIdx(0);
    setCorrectAnswers([]);
  };

  const addQuestion = async () => {
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
      answers: [...answers],
      questionType,
      correctAnswers: answersObject,
    };

    const updatedGame = {
      ...game,
      questions: [...game.questions, question],
    };
    setGame(updatedGame);
    const allGames = JSON.parse(localStorage.getItem('games'));
    const updatedAll = allGames.map(g =>
      g.id === updatedGame.id ? updatedGame : g
    );
    localStorage.setItem('games', JSON.stringify(updatedAll));
    await putGames(updatedAll);
    setShowAdd(false);
    resetForm();
  };

  const deleteQuestion = async (index) => {
    const updatedQuestions = game.questions.filter((_, i) => i !== index);
    const updatedGame = { ...game, questions: updatedQuestions };
    setGame(updatedGame);
    const allGames = JSON.parse(localStorage.getItem('games'));
    const updatedAll = allGames.map(g =>
      g.id === updatedGame.id ? updatedGame : g
    );
    localStorage.setItem('games', JSON.stringify(updatedAll));
    await putGames(updatedAll);
  };

  return (
    <div className="p-6">
      <h1 className="my-2 font-[700] text-2xl">Edit Game</h1>
      <h2 className="my-2 font-[700] text-xl">Game #{game.id}</h2>

      <button
        className="my-2 p-3 rounded bg-green-600 hover:bg-lime-400 text-white"
        onClick={() => setShowAdd(true)}
      >
        Add Question
      </button>

      {showAdd && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-800 bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded w-full max-w-md">
            <h3 className="text-center text-lg font-[600] mb-4">New Question</h3>

            <div className="mb-4">
              <span className="font-[500]">Type</span>
              <div className="flex gap-4 mt-1">
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
                    {type === 'single' ? 'Single Choice' : type === 'multiple' ? 'Multiple Choice' : 'Judgement'}
                  </label>
                ))}
              </div>
            </div>

            <label className="block mb-2">
              <span className="font-[500]">Question</span>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
              />
            </label>

            <label className="block mb-4">
              <span className="font-[500]">Duration (s)</span>
              <input
                type="number"
                min={1}
                className="w-full p-2 border rounded"
                value={duration}
                onChange={e => setDuration(e.target.value)}
              />
            </label>

            <div className="mb-4">
              <span className="font-[500]">
                {questionType === 'multiple' ? 'Select correct answers' : questionType === 'judgement' ? 'Select correct answer' : 'Select correct answer'}
              </span>

              {questionType === 'judgement' ? (
                <div className="flex gap-4 mt-2">
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
              ) : (
                answers.map((ans, i) => (
                  <div key={i} className="flex items-center my-1">
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
                            prev.includes(i)
                              ? prev.filter(x => x !== i)
                              : [...prev, i]
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
                ))
              )}
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="p-2 rounded bg-gray-600 text-white hover:bg-zinc-400"
                onClick={() => { setShowAdd(false); resetForm(); }}
              >
                Cancel
              </button>
              <button
                className="p-2 rounded bg-green-600 text-white hover:bg-lime-400"
                onClick={addQuestion}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {game.questions.map((q, i) => (
          <div
            key={q.id}
            className="relative mb-3 p-4 border-1 border-solid rounded bg-white flex items-center justify-between"
          >
            <div>
              <p className="font-[600]">Question #{i + 1}</p>
              <p><strong>Text:</strong> {q.questionText}</p>
              <p><strong>Duration:</strong> {q.duration}s</p>
              <p><strong>Answers:</strong> {q.answers.join(', ')}</p>
              <p><strong>Correct:</strong> {q.correctAnswers.join(', ')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <img
                src="https://heatherrobertsart.com/cdn/shop/products/1_84c051d7-0b22-4f5e-aee8-af8d7644cefd_1024x1024.png?v=1663394121"
                className="w-6 h-6 cursor-pointer hover:opacity-75"
                alt="Thumbnail"
                style={{ height: 150, width: 150 }}
                onClick={() => navigate(`/game/${game.id}/question/${q.id}`)}
              />
              <button
                className="p-2 rounded bg-red-600 text-white hover:bg-fuchsia-400"
                onClick={() => deleteQuestion(i)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EditGame;

