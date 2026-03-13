import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GlitchText } from '../GlitchText';

describe('GlitchText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders children text', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);

    expect(screen.getByText('HEISENBERG')).toBeInTheDocument();
  });

  it('has data-text attribute matching children', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);

    const text = screen.getByText('HEISENBERG');
    expect(text).toHaveAttribute('data-text', 'HEISENBERG');
  });

  it('applies active class when isGlitching is true', () => {
    render(<GlitchText always={false}>HEISENBERG</GlitchText>);

    const text = screen.getByText('HEISENBERG');
    fireEvent.mouseEnter(text);

    expect(text).toHaveClass('active');
  });

  it('triggers glitch on mouse enter when always is false', () => {
    render(<GlitchText always={false}>HEISENBERG</GlitchText>);

    const text = screen.getByText('HEISENBERG');
    expect(text).not.toHaveClass('active');

    fireEvent.mouseEnter(text);

    expect(text).toHaveClass('active');
  });

  it('does not trigger second glitch while already glitching', () => {
    render(
      <GlitchText always={false} duration={400}>
        HEISENBERG
      </GlitchText>
    );

    const text = screen.getByText('HEISENBERG');

    fireEvent.mouseEnter(text);
    expect(text).toHaveClass('active');

    fireEvent.mouseEnter(text);

    vi.advanceTimersByTime(300);
    expect(text).toHaveClass('active');
  });
});
