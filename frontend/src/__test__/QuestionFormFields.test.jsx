import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import QuestionFormFields from '../Component/QuestionFormFields';

// Build a minimal mock form object so each test controls exactly what the
// component receives, without depending on useQuestionForm's internal state.
function makeForm(overrides = {}) {
  return {
    questionText: '',
    setQuestionText: vi.fn(),
    duration: 10,
    setDuration: vi.fn(),
    answers: ['', ''],
    setAnswers: vi.fn(),
    questionType: 'single',
    setQuestionType: vi.fn(),
    idx: 0,
    setIdx: vi.fn(),
    correctAnswers: [],
    setCorrectAnswers: vi.fn(),
    media: null,
    setMedia: vi.fn(),
    mediaType: null,
    setMediaType: vi.fn(),
    points: 1,
    setPoints: vi.fn(),
    validationError: null,
    setValidationError: vi.fn(),
    validate: vi.fn(),
    reset: vi.fn(),
    ...overrides,
  };
}

describe('QuestionFormFields', () => {

  // ── Static structure ───────────────────────────────────────────────────────

  it('renders the three type selector buttons', () => {
    render(<QuestionFormFields form={makeForm()} />);
    expect(screen.getByRole('button', { name: 'Single' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Multiple' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Judgement' })).toBeInTheDocument();
  });

  it('renders the question text input', () => {
    render(<QuestionFormFields form={makeForm()} />);
    expect(screen.getByPlaceholderText('Enter your question')).toBeInTheDocument();
  });

  it('renders Duration and Points inputs', () => {
    render(<QuestionFormFields form={makeForm()} />);
    // Labels have no htmlFor so query by role (number inputs = spinbutton)
    const spinbuttons = screen.getAllByRole('spinbutton');
    expect(spinbuttons).toHaveLength(2);
  });

  it('duration and points inputs reflect the form values', () => {
    render(<QuestionFormFields form={makeForm({ duration: 30, points: 5 })} />);
    expect(screen.getByDisplayValue(30)).toBeInTheDocument();
    expect(screen.getByDisplayValue(5)).toBeInTheDocument();
  });

  // ── Type selector interactions ─────────────────────────────────────────────

  it('clicking a type button calls setQuestionType with the correct type', () => {
    const form = makeForm();
    render(<QuestionFormFields form={form} />);
    fireEvent.click(screen.getByRole('button', { name: 'Multiple' }));
    expect(form.setQuestionType).toHaveBeenCalledWith('multiple');
  });

  it('active type button has the indigo highlight class', () => {
    render(<QuestionFormFields form={makeForm({ questionType: 'judgement' })} />);
    expect(screen.getByRole('button', { name: 'Judgement' }))
      .toHaveClass('bg-indigo-500');
    expect(screen.getByRole('button', { name: 'Single' }))
      .not.toHaveClass('bg-indigo-500');
  });

  // ── Judgement mode ─────────────────────────────────────────────────────────

  it('judgement type renders True and False buttons', () => {
    render(<QuestionFormFields form={makeForm({ questionType: 'judgement' })} />);
    expect(screen.getByRole('button', { name: 'True' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'False' })).toBeInTheDocument();
  });

  it('judgement: clicking True calls setIdx(0)', () => {
    const form = makeForm({ questionType: 'judgement', idx: 1 });
    render(<QuestionFormFields form={form} />);
    fireEvent.click(screen.getByRole('button', { name: 'True' }));
    expect(form.setIdx).toHaveBeenCalledWith(0);
  });

  it('judgement: clicking False calls setIdx(1)', () => {
    const form = makeForm({ questionType: 'judgement', idx: 0 });
    render(<QuestionFormFields form={form} />);
    fireEvent.click(screen.getByRole('button', { name: 'False' }));
    expect(form.setIdx).toHaveBeenCalledWith(1);
  });

  it('judgement: selected button (idx=0 → True) has green style', () => {
    render(<QuestionFormFields form={makeForm({ questionType: 'judgement', idx: 0 })} />);
    expect(screen.getByRole('button', { name: 'True' }))
      .toHaveClass('bg-green-500/20');
    expect(screen.getByRole('button', { name: 'False' }))
      .not.toHaveClass('bg-green-500/20');
  });

  // ── Single / Multiple mode ─────────────────────────────────────────────────

  it('single type: renders an input for each answer', () => {
    render(<QuestionFormFields form={makeForm({ answers: ['A', 'B'] })} />);
    expect(screen.getByPlaceholderText('Answer 1')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Answer 2')).toBeInTheDocument();
  });

  it('single type: typing in an answer input calls setAnswers', () => {
    const form = makeForm({ answers: ['', ''] });
    render(<QuestionFormFields form={form} />);
    fireEvent.change(screen.getByPlaceholderText('Answer 1'), {
      target: { value: 'Paris' },
    });
    expect(form.setAnswers).toHaveBeenCalledWith(['Paris', '']);
  });

  it('single type: + Add answer button appends an empty string to answers', () => {
    const form = makeForm({ answers: ['A', 'B'] });
    render(<QuestionFormFields form={form} />);
    fireEvent.click(screen.getByRole('button', { name: '+ Add answer' }));
    // Component calls setAnswers(prev => [...prev, '']) — verify via the updater
    expect(form.setAnswers).toHaveBeenCalledTimes(1);
    const updater = form.setAnswers.mock.calls[0][0];
    expect(updater(['A', 'B'])).toEqual(['A', 'B', '']);
  });

  it('+ Add answer button is hidden when there are already 6 answers', () => {
    const form = makeForm({ answers: ['A', 'B', 'C', 'D', 'E', 'F'] });
    render(<QuestionFormFields form={form} />);
    expect(screen.queryByRole('button', { name: '+ Add answer' }))
      .not.toBeInTheDocument();
  });

  it('delete answer button is absent when there are exactly 2 answers', () => {
    render(<QuestionFormFields form={makeForm({ answers: ['A', 'B'] })} />);
    // The delete button has no accessible name — check by aria-label absence
    // The component renders no delete buttons when answers.length <= 2
    const deleteButtons = screen.queryAllByRole('button').filter(
      btn => btn.classList.contains('hover:text-red-400') && !btn.textContent.trim()
    );
    expect(deleteButtons).toHaveLength(0);
  });

  it('delete answer button appears for each answer when there are 3+', () => {
    render(<QuestionFormFields form={makeForm({ answers: ['A', 'B', 'C'] })} />);
    // Each delete button is an icon-only button; find by the SVG path inside them.
    // The "× remove" SVG path is unique to delete buttons.
    const svgs = document.querySelectorAll('path[d="M6 18L18 6M6 6l12 12"]');
    expect(svgs.length).toBe(3);
  });

  it('answers section is not rendered in judgement mode', () => {
    render(<QuestionFormFields form={makeForm({ questionType: 'judgement' })} />);
    expect(screen.queryByPlaceholderText('Answer 1')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '+ Add answer' })).not.toBeInTheDocument();
  });
});
