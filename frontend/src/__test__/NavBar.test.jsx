import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import NavBar from '../Component/NavBar';

// Mock useNavigate so we can assert which route was navigated to
// without needing a real router context.
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('NavBar', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  // --- variant="full" (default) ---

  // The full navbar is the primary site header; it must display the brand name.
  it('variant=full: displays BigBrain text', () => {
    render(<NavBar onLogout={() => {}} />);
    expect(screen.getByText('BigBrain')).toBeInTheDocument();
  });

  // The full navbar must offer a Logout button so the admin can end their session.
  it('variant=full: displays Logout button', () => {
    render(<NavBar onLogout={() => {}} />);
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  // --- variant="floating" ---

  // The floating variant sits over editor pages and shows both navigation shortcuts.
  it('variant=floating: displays Dashboard and Logout buttons', () => {
    render(<NavBar variant="floating" onLogout={() => {}} />);
    expect(screen.getByRole('button', { name: '← Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Logout' })).toBeInTheDocument();
  });

  // The floating variant has no brand header — it should not render the BigBrain logo text.
  it('variant=floating: does not display the BigBrain logo text', () => {
    render(<NavBar variant="floating" onLogout={() => {}} />);
    expect(screen.queryByText('BigBrain')).not.toBeInTheDocument();
  });

  // Clicking Logout must delegate to the parent's onLogout handler (both variants).
  it('calls onLogout when Logout is clicked (full variant)', () => {
    const onLogout = vi.fn();
    render(<NavBar onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  it('calls onLogout when Logout is clicked (floating variant)', () => {
    const onLogout = vi.fn();
    render(<NavBar variant="floating" onLogout={onLogout} />);
    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  // Clicking ← Dashboard in floating mode must navigate to /dashboard.
  it('variant=floating: navigates to /dashboard when Dashboard button is clicked', () => {
    render(<NavBar variant="floating" onLogout={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: '← Dashboard' }));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
