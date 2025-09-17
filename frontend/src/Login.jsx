import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css';

function Login({ successJob, token }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5005/admin/auth/login', {
        email: email,
        password: password,
      });
      const token = response.data.token;
      console.log(token);
      successJob(token);
    } catch (error) {
      alert(error.response.data.error);
    }
  }
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="p-8 w-full rounded-[0.600rem] bg-white max-w-sm">
        <h2 className="my-12 font-[700] text-center text-2xl">Login</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <div className="my-2">
            <label className="my-1 font-[600] text-base flow-root">Email</label>
            <input
              type="email"
              className="w-full p-3 border-1 border-solid rounded-[.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="z5555555@ad.unsw.edu.au"
            />
          </div>
          <div className="my-3">
            <label className="my-1 font-[600] text-base flow-root">Password</label>
            <input
              type="password"
              className="w-full p-3 border-1 border-solid rounded-[0.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>
          <button
            type="submit"
            className="my-6 font-[600] w-full p-3 rounded-[.400rem] bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
          >
            Log In
          </button>
        </form>
        <div className="my-1 text-center">
          <p className="text-sm text-zinc-600">
            First time here?{" "}
            <button
              onClick={() => navigate('/register')}
              className="font-[500] text-sky-600 hover:underline"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
export default Login;
