import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './index.css';

function Register({ successJob, token }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  let toUnicodeVariant
    ; (async () => {
    ({ string_to_unicode_variant: toUnicodeVariant } =
        await import('string-to-unicode-variant'))
  })()

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  const register = async () => {
    const error = toUnicodeVariant('Error', 'bs');
    if (!email) {
      alert(`${error}\nPlease enter a valid email address`);
      return;
    }
    if (!password) {
      alert(`${error}\nPlease enter a password`);
      return;
    }
    if (!confirmPassword) {
      alert(`${error}\nPlease confirm your password`);
      return;
    }
    if (!name) {
      alert(`${error}\nPlease enter your name`);
      return;
    }
    if (password !== confirmPassword) {
      alert(`${error}\nPasswords do not match`);
      return;
    }

    try {
      const response = await axios.post('http://localhost:5005/admin/auth/register', {
        email,
        password,
        name,
      });
      const authToken = response.data.token;
      successJob(authToken);
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="p-8 w-full rounded-[0.600rem] bg-white max-w-sm">
        <h2 className="my-12 font-[700] text-center text-2xl">Register</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            register();
          }}
        >
          <div className="my-2">
            <label className="my-1 font-[600] text-base flow-root">Email</label>
            <input
              type="email"
              className="w-full p-3 border-1 border-solid rounded-[0.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="z5555555@ad.unsw.edu.au"
            />
          </div>

          <div className="my-2">
            <label className="my-1 font-[600] text-base flow-root">Password</label>
            <input
              type="password"
              className="w-full p-3 border-1 border-solid rounded-[0.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <div className="my-2">
            <label className="my-1 font-[600] text-base flow-root">Confirm Password</label>
            <input
              type="password"
              className="w-full p-3 border-1 border-solid rounded-[0.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••"
            />
          </div>

          <div className="my-2">
            <label className="my-1 font-[600] text-base flow-root">Name</label>
            <input
              type="text"
              className="w-full p-3 border-1 border-solid rounded-[0.400rem] focus:ring-3 focus:ring-sky-400/50"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Firstname Lastname"
            />
          </div>

          <button
            type="submit"
            className="my-6 font-[600] w-full p-3 rounded-[0.400rem] bg-blue-600 hover:bg-sky-400 text-white transition duration-300 ease-in-out"
          >
            Register
          </button>
        </form>

        <div className="my-1 text-center">
          <p className="text-sm text-zinc-600">
            Been here before?{' '}
            <button
              onClick={() => navigate('/login')}
              className="font-[500] text-sky-600 hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}


export default Register;
