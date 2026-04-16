import { useState } from 'react';

export function useQuestionForm() {
  const [questionText, setQuestionText]     = useState('');
  const [duration, setDuration]             = useState(10);
  const [answers, setAnswers]               = useState(['', '']);
  const [questionType, setQuestionType]     = useState('single');
  const [idx, setIdx]                       = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState([]);
  const [media, setMedia]                   = useState(null);
  const [mediaType, setMediaType]           = useState(null);
  const [points, setPoints]                 = useState(1);
  const [validationError, setValidationError] = useState(null);

  const validate = () => {
    if (!questionText.trim()) return 'Question text is required.';
    if (!duration || Number(duration) < 1) return 'Duration must be at least 1 second.';
    if (!points || Number(points) < 1) return 'Points must be at least 1.';
    if (questionType !== 'judgement') {
      const nonEmpty = answers.filter(a => a.trim() !== '');
      if (nonEmpty.length < 2) return 'At least 2 answers are required.';
      if (questionType === 'single') {
        if (!answers[idx] || answers[idx].trim() === '') return 'The selected correct answer cannot be empty.';
      } else {
        if (correctAnswers.length === 0) return 'Select at least one correct answer.';
        if (correctAnswers.some(i => !answers[i] || answers[i].trim() === '')) return 'Correct answers cannot be empty.';
      }
    }
    return null;
  };

  const reset = () => {
    setQuestionText('');
    setDuration(10);
    setAnswers(['', '']);
    setQuestionType('single');
    setIdx(0);
    setCorrectAnswers([]);
    setMedia(null);
    setMediaType(null);
    setPoints(1);
    setValidationError(null);
  };

  return {
    questionText, setQuestionText,
    duration, setDuration,
    answers, setAnswers,
    questionType, setQuestionType,
    idx, setIdx,
    correctAnswers, setCorrectAnswers,
    media, setMedia,
    mediaType, setMediaType,
    points, setPoints,
    validationError, setValidationError,
    validate,
    reset,
  };
}
