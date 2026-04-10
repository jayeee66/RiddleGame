function AnswerButton({ answer, selected, correct, disabled, onClick }) {
  let style = 'bg-white/5 border-white/10 text-white hover:bg-white/10';

  if (disabled) {
    if (correct) {
      style = 'bg-green-500/20 border-green-500/50 text-green-300';
    } else if (selected) {
      style = 'bg-red-500/20 border-red-500/50 text-red-300';
    } else {
      style = 'bg-white/5 border-white/10 text-slate-500';
    }
  } else if (selected) {
    style = 'bg-indigo-500/30 border-indigo-400 text-white';
  }

  return (
    <button
      className={`w-full px-4 py-3 rounded-xl border text-left font-medium transition ${style} ${disabled ? 'cursor-default' : 'cursor-pointer active:scale-95'}`}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
    >
      {answer}
    </button>
  );
}

export default AnswerButton;
