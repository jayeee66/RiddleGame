import MediaInput from './MediaInput';

const inputCls = 'w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition';

function QuestionFormFields({ form }) {
  const {
    questionText, setQuestionText,
    duration, setDuration,
    answers, setAnswers,
    questionType, setQuestionType,
    idx, setIdx,
    correctAnswers, setCorrectAnswers,
    media, setMedia,
    mediaType, setMediaType,
    points, setPoints,
  } = form;

  return (
    <>
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
    </>
  );
}

export default QuestionFormFields;
