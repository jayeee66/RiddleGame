import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Modal from '../Component/Modal';

// Tests for Modal conditional rendering logic.
// The component gates all output behind isOpen and renders optional
// title / footer slots only when they are provided.
describe('Modal', () => {
  // When isOpen is false the component returns null — nothing should appear in the DOM.
  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <Modal isOpen={false} title="Test" footer={<button>OK</button>}>
        <p>Content</p>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  // When isOpen is true the modal overlay and its inner panel should be present.
  it('renders content when isOpen is true', () => {
    render(
      <Modal isOpen={true}>
        <p>Hello</p>
      </Modal>
    );
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  // A non-empty title string should be displayed inside an h3.
  it('displays the title when provided', () => {
    render(<Modal isOpen={true} title="My Title"><p>x</p></Modal>);
    expect(screen.getByText('My Title')).toBeInTheDocument();
  });

  // When title is omitted the h3 element must not appear at all.
  it('does not render a title element when title is not provided', () => {
    render(<Modal isOpen={true}><p>x</p></Modal>);
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  // Children are always rendered inside the content wrapper when the modal is open.
  it('renders children correctly', () => {
    render(
      <Modal isOpen={true}>
        <span>Child content</span>
      </Modal>
    );
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  // The footer slot renders when a value is passed — typically action buttons.
  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} footer={<button>Confirm</button>}>
        <p>x</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
  });

  // When footer is omitted the footer wrapper div must not be in the DOM.
  it('does not render footer when not provided', () => {
    render(
      <Modal isOpen={true}>
        <p>x</p>
      </Modal>
    );
    // The only button that could exist would be inside a footer — none expected.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
