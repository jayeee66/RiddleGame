import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CreateGameModal from '../Component/CreateGameModal';

// Tests for CreateGameModal form interaction logic.
// The modal wraps a controlled text input and two action buttons.
// All state is owned by the parent — the component only delegates through callbacks.
describe('CreateGameModal', () => {
  // When isOpen is false the underlying Modal returns null, so no DOM node should exist.
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <CreateGameModal isOpen={false} gameName="" onChange={() => {}} onCreate={() => {}} onCancel={() => {}} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  // The input is a controlled component — its displayed value must mirror the gameName prop.
  it('input reflects the gameName prop', () => {
    render(
      <CreateGameModal isOpen={true} gameName="My Quiz" onChange={() => {}} onCreate={() => {}} onCancel={() => {}} />
    );
    expect(screen.getByPlaceholderText('Game name')).toHaveValue('My Quiz');
  });

  // Typing into the input should forward the new value to the parent via onChange.
  it('calls onChange with the new value when input changes', () => {
    const onChange = vi.fn();
    render(
      <CreateGameModal isOpen={true} gameName="" onChange={onChange} onCreate={() => {}} onCancel={() => {}} />
    );
    fireEvent.change(screen.getByPlaceholderText('Game name'), { target: { value: 'New Game' } });
    expect(onChange).toHaveBeenCalledWith('New Game');
  });

  // Clicking the Create button must invoke onCreate exactly once.
  it('calls onCreate when Create button is clicked', () => {
    const onCreate = vi.fn();
    render(
      <CreateGameModal isOpen={true} gameName="Test" onChange={() => {}} onCreate={onCreate} onCancel={() => {}} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  // Clicking the Cancel button must invoke onCancel exactly once.
  it('calls onCancel when Cancel button is clicked', () => {
    const onCancel = vi.fn();
    render(
      <CreateGameModal isOpen={true} gameName="" onChange={() => {}} onCreate={() => {}} onCancel={onCancel} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  // Pressing Enter inside the input is a keyboard shortcut for Create — must trigger onCreate.
  it('calls onCreate when Enter is pressed in the input', () => {
    const onCreate = vi.fn();
    render(
      <CreateGameModal isOpen={true} gameName="Test" onChange={() => {}} onCreate={onCreate} onCancel={() => {}} />
    );
    fireEvent.keyDown(screen.getByPlaceholderText('Game name'), { key: 'Enter' });
    expect(onCreate).toHaveBeenCalledTimes(1);
  });
});
