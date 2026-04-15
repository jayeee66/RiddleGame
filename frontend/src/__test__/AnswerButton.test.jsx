import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AnswerButton from '../Component/AnswerButton';

// Tests for AnswerButton visual state logic.
// The component applies different CSS classes based on the combination of
// selected / correct / disabled props. Each test targets one distinct state.
describe('AnswerButton', () => {
  // Idle state — no answer selected yet, question still open.
  // Expects hover affordance so users know the button is clickable.
  it('default state: has hover style, no selected or result styles', () => {
    render(<AnswerButton answer="Option A" selected={false} correct={false} disabled={false} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Option A' });
    expect(btn).toHaveClass('hover:bg-white/10');
    expect(btn).not.toHaveClass('bg-indigo-500/30');
    expect(btn).not.toHaveClass('bg-green-500/20');
    expect(btn).not.toHaveClass('bg-red-500/20');
  });

  // Player has tapped this answer but the question timer is still running.
  // Highlights the choice in indigo to confirm the selection without revealing correctness.
  it('selected but not disabled: shows indigo selected style', () => {
    render(<AnswerButton answer="Option A" selected={true} correct={false} disabled={false} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Option A' });
    expect(btn).toHaveClass('bg-indigo-500/30');
    expect(btn).toHaveClass('border-indigo-400');
  });

  // Time is up and this answer is correct — show green to reward the player.
  // Applies regardless of whether the player actually selected it.
  it('disabled + correct: shows green style', () => {
    render(<AnswerButton answer="Option A" selected={false} correct={true} disabled={true} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Option A' });
    expect(btn).toHaveClass('bg-green-500/20');
    expect(btn).toHaveClass('border-green-500/50');
    expect(btn).toHaveClass('text-green-300');
  });

  // Time is up, the player chose this answer, but it is wrong — show red as negative feedback.
  it('disabled + selected + not correct: shows red style', () => {
    render(<AnswerButton answer="Option A" selected={true} correct={false} disabled={true} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Option A' });
    expect(btn).toHaveClass('bg-red-500/20');
    expect(btn).toHaveClass('border-red-500/50');
    expect(btn).toHaveClass('text-red-300');
  });

  // Time is up, not selected, not correct — neutral dim state so it fades into the background.
  it('disabled + not selected + not correct: shows dimmed grey style', () => {
    render(<AnswerButton answer="Option A" selected={false} correct={false} disabled={true} onClick={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Option A' });
    expect(btn).toHaveClass('text-slate-500');
    expect(btn).not.toHaveClass('bg-green-500/20');
    expect(btn).not.toHaveClass('bg-red-500/20');
    expect(btn).not.toHaveClass('bg-indigo-500/30');
  });

  // Once the question closes (disabled=true) the button must be inert —
  // onClick should never fire even if the user clicks it.
  it('does not fire onClick when disabled', () => {
    const onClick = vi.fn();
    render(<AnswerButton answer="Option A" selected={false} correct={false} disabled={true} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  // Normal interactive state — clicking must delegate to the parent handler exactly once.
  it('fires onClick when not disabled', () => {
    const onClick = vi.fn();
    render(<AnswerButton answer="Option A" selected={false} correct={false} disabled={false} onClick={onClick} />);
    fireEvent.click(screen.getByRole('button', { name: 'Option A' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
