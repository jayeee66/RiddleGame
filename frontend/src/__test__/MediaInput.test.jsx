import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MediaInput from '../Component/MediaInput';

// Tests for MediaInput tab switching and media preview logic.
// The component manages its own tab state; media preview is driven by the media/mediaType props.
describe('MediaInput', () => {
  // Both tab buttons must always be present so the user can switch between input modes.
  it('renders Image and Video tab buttons by default', () => {
    render(<MediaInput media={null} mediaType={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Image' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Video' })).toBeInTheDocument();
  });

  // Clicking the Video tab should reveal the URL text input (hidden on the Image tab).
  it('clicking Video tab shows the video URL input', () => {
    render(<MediaInput media={null} mediaType={null} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    expect(screen.getByPlaceholderText('https://...')).toBeInTheDocument();
  });

  // After switching to Video and back to Image, the URL input should no longer be visible.
  it('clicking Image tab hides the video URL input', () => {
    render(<MediaInput media={null} mediaType={null} onChange={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.click(screen.getByRole('button', { name: 'Image' }));
    expect(screen.queryByPlaceholderText('https://...')).not.toBeInTheDocument();
  });

  // When an image is loaded the component should show an <img> element with the correct src.
  // Note: the img has alt="" so its ARIA role is "presentation" — query via DOM directly.
  it('shows an <img> when media is an image', () => {
    const src = 'data:image/png;base64,abc';
    render(<MediaInput media={src} mediaType="image" onChange={() => {}} />);
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', src);
  });

  // A direct (non-embeddable) video URL should render a <video> element.
  it('shows a <video> element for a plain video URL', () => {
    render(<MediaInput media="https://example.com/clip.mp4" mediaType="video" onChange={() => {}} />);
    expect(document.querySelector('video')).toBeInTheDocument();
  });

  // A YouTube URL is embeddable — the component should render an <iframe> instead of <video>.
  it('shows an <iframe> for a YouTube URL', () => {
    render(<MediaInput media="https://www.youtube.com/watch?v=dQw4w9WgXcQ" mediaType="video" onChange={() => {}} />);
    expect(document.querySelector('iframe')).toBeInTheDocument();
  });

  // Clicking the clear (×) button while media is loaded must call onChange(null, null)
  // so the parent can reset both the src and type back to empty.
  it('calls onChange(null, null) when the clear button is clicked', () => {
    const onChange = vi.fn();
    render(<MediaInput media="data:image/png;base64,abc" mediaType="image" onChange={onChange} />);
    // Tab buttons are "Image" and "Video"; the remaining unnamed button is the clear button.
    const allBtns = screen.getAllByRole('button');
    const clearBtn = allBtns.find(b => !b.textContent.trim());
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null, null);
  });

  // Pressing Enter in the video URL field should commit the URL if it is non-empty.
  it('calls onChange with the video URL when Enter is pressed', () => {
    const onChange = vi.fn();
    render(<MediaInput media={null} mediaType={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    const input = screen.getByPlaceholderText('https://...');
    fireEvent.change(input, { target: { value: 'https://example.com/video.mp4' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith('https://example.com/video.mp4', 'video');
  });

  // Clicking the Load button should also commit the entered URL.
  it('calls onChange with the video URL when Load button is clicked', () => {
    const onChange = vi.fn();
    render(<MediaInput media={null} mediaType={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Video' }));
    fireEvent.change(screen.getByPlaceholderText('https://...'), {
      target: { value: 'https://example.com/video.mp4' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Load' }));
    expect(onChange).toHaveBeenCalledWith('https://example.com/video.mp4', 'video');
  });
});
