import { useNavigate } from 'react-router-dom';

function NavBar({ onLogout, variant = 'full' }) {
  const navigate = useNavigate();

  if (variant === 'floating') {
    return (
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate('/dashboard')}
          className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 text-sm transition"
        >
          ← Dashboard
        </button>
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 text-sm transition"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur border-b border-white/5 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <span className="text-white font-bold text-lg">BigBrain</span>
      </div>
      <button
        onClick={onLogout}
        className="px-4 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/10 transition"
      >
        Logout
      </button>
    </nav>
  );
}

export default NavBar;
