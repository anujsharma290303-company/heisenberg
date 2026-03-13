import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { GlitchText } from '../GlitchText';

describe('GlitchText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders children text correctly', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);
    expect(screen.getByText('HEISENBERG')).toBeInTheDocument();
  });

  it('has data-text attribute matching children', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);
    expect(screen.getByText('HEISENBERG')).toHaveAttribute('data-text', 'HEISENBERG');
  });

  it('does not have active class when not glitching', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);
    expect(screen.getByText('HEISENBERG')).not.toHaveClass('active');
  });

  it('applies active class when isGlitching is true', () => {
    render(<GlitchText>HEISENBERG</GlitchText>);
    const el = screen.getByText('HEISENBERG');
    fireEvent.mouseEnter(el);
    expect(el).toHaveClass('active');
  });

  it('triggers glitch on mouse enter when always is false', () => {
    render(<GlitchText always={false}>HEISENBERG</GlitchText>);
    const el = screen.getByText('HEISENBERG');
    expect(el).not.toHaveClass('active');
    fireEvent.mouseEnter(el);
    expect(el).toHaveClass('active');
  });

  it('does not trigger second glitch while already glitching', () => {
    // duration=400 so we can probe at t=300ms (still active) and t=401ms (ended)
    render(<GlitchText duration={400}>HEISENBERG</GlitchText>);
    const el = screen.getByText('HEISENBERG');

    // First mouseEnter starts the glitch — timer ends at t=400ms
    fireEvent.mouseEnter(el);
    expect(el).toHaveClass('active');

    // t=300ms: still glitching
    act(() => vi.advanceTimersByTime(300));
    expect(el).toHaveClass('active');

    // Second mouseEnter during the active window — hook lockout blocks re-trigger
    // so the end-timer is NOT reset to t=300+400=700ms
    fireEvent.mouseLeave(el);
    fireEvent.mouseEnter(el);

    // Advance 101ms more (total 401ms): original timer fires, glitch ends.
    // If lockout had failed the class would still be active here (timer reset to ~700ms).
    act(() => vi.advanceTimersByTime(101));
    expect(el).not.toHaveClass('active');
  });

  it('auto fires glitch when always is true', () => {
    // intervalMs=500 + duration=400: fires at t=500ms, ends at t=900ms
    // Advancing 501ms lands inside the active window
    render(<GlitchText always intervalMs={500} duration={400}>HEISENBERG</GlitchText>);
    const el = screen.getByText('HEISENBERG');
    act(() => {
      vi.advanceTimersByTime(501);
    });
    expect(el).toHaveClass('active');
  });

  it('accepts optional className prop', () => {
    render(<GlitchText className="custom-class">HEISENBERG</GlitchText>);
    expect(screen.getByText('HEISENBERG')).toHaveClass('custom-class');
  });
});
