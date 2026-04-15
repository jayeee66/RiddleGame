import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      ),
      title: 'Host Live Games',
      desc: 'Create quizzes and run live sessions with your audience in real time.',
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      ),
      title: 'Instant Play',
      desc: 'Players join with a session code — no account needed, just jump right in.',
    },
    {
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
      title: 'Live Leaderboard',
      desc: 'Track scores, accuracy, and speed across every question as they happen.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 flex flex-col overflow-x-hidden">

      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute top-[40%] right-[15%] w-48 h-48 bg-sky-500/10 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">BigBrain</span>
        </div>
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white text-sm font-semibold transition duration-200 shadow-lg shadow-indigo-500/25"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20 max-w-3xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Live quiz platform
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4">
          Host. Play.{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Compete.
          </span>
        </h1>

        <p className="text-slate-400 text-lg max-w-xl mb-10">
          BigBrain lets you run live quiz games with real-time scoring and leaderboards.
          No setup required — just create a game and share the code.
        </p>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 active:scale-95 text-white font-semibold transition duration-200 shadow-lg shadow-indigo-500/25"
          >
            Create Account
          </button>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto w-full px-6 pb-20 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {features.map(({ icon, title, desc }) => (
          <div
            key={title}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {icon}
              </svg>
            </div>
            <h3 className="text-white font-semibold">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
