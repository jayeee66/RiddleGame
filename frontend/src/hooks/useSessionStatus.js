import { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5005';

export function useSessionStatus(sessionId) {
  const [position, setPosition] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(null);

  const checkStatus = async (id) => {
    try {
      const res = await axios.get(`${API}/admin/session/${id}/status`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setPosition(res.data.results.position);
      setTotalQuestions(res.data.results.questions.length);
    } catch (_) { /* ignore polling errors */ }
  };

  useEffect(() => {
    if (!sessionId) return;
    checkStatus(sessionId);
    const interval = setInterval(() => checkStatus(sessionId), 2000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return { position, totalQuestions, checkStatus };
}
