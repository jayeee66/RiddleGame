import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeleteGameModal from '../Component/DeleteGameModal';

// Tests for DeleteGameModal confirmation flow.
// The modal displays the target game name and delegates confirm/cancel to the parent.
describe('DeleteGameModal', () => {
  // When isOpen is false the underlying Modal returns null — nothing should be in the DOM.
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <DeleteGameModal isOpen={false} game={{ name: 'Quiz A' }} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // The game name must appear in the confirmation sentence so the user knows exactly what will be deleted.
  it('displays game.name in the confirmation text', () => {
    render(
      <DeleteGameModal isOpen={true} game={{ name: 'Quiz A' }} onConfirm={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByText(/"Quiz A" will be permanently deleted\./)).toBeInTheDocument();
  });

  // game can arrive as null/undefined while isOpen transitions — the component must not throw.
  it('does not crash when game is null', () => {
    expect(() =>
      render(<DeleteGameModal isOpen={true} game={null} onConfirm={() => {}} onCancel={() => {}} />)
    ).not.toThrow();
  });

  it('does not crash when game is undefined', () => {
    expect(() =>
      render(<DeleteGameModal isOpen={true} game={undefined} onConfirm={() => {}} onCancel={() => {}} />)
    ).not.toThrow();
  });

  // Clicking Delete must invoke onConfirm so the parent can proceed with deletion.
  it('calls onConfirm when Delete button is clicked', () => {
    const onConfirm = vi.fn();
    render(
      <DeleteGameModal isOpen={true} game={{ name: 'Quiz A' }} onConfirm={onConfirm} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  // Clicking Cancel must invoke onCancel so the parent can dismiss the modal without deleting.
  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <DeleteGameModal isOpen={true} game={{ name: 'Quiz A' }} onConfirm={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
