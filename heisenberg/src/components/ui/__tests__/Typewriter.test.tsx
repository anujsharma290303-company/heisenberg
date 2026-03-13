import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Typewriter } from '../Typewriter';

describe('Typewriter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders empty output initially before first tick', () => {
    render(<Typewriter text="HEISENBERG" />);

    expect(screen.queryByText('HEISENBERG')).not.toBeInTheDocument();
  });

  it('reveals text character by character over time', () => {
    render(<Typewriter text="ABC" />);

    act(() => {
      vi.advanceTimersByTime(95);
    });
    expect(screen.getByText('A')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(95);
    });
    expect(screen.getByText('AB')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(95);
    });
    expect(screen.getByText('ABC')).toBeInTheDocument();
  });

  it('uses randomized character delay between 70ms and 120ms', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.5);
    render(<Typewriter text="A" />);

    act(() => {
      vi.advanceTimersByTime(94);
    });
    expect(screen.queryByText('A')).not.toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(randomSpy).toHaveBeenCalled();
  });

  it('calls onComplete exactly once when typing finishes', () => {
    const onComplete = vi.fn();

    render(<Typewriter text="HI" onComplete={onComplete} />);

    act(() => {
      vi.advanceTimersByTime(190);
    });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('applies external className to root element', () => {
    render(<Typewriter text="HELLO" className="custom-typewriter" />);

    const root = screen.getByTestId('typewriter-root');
    expect(root).toHaveClass('custom-typewriter');
  });

  it('shows cursor while typing and hides after complete', () => {
    render(<Typewriter text="A" />);

    const root = screen.getByTestId('typewriter-root');
    expect(root).toHaveAttribute('data-state', 'typing');
    expect(screen.getByTestId('typewriter-cursor')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(95);
    });

    expect(root).toHaveAttribute('data-state', 'complete');
    expect(screen.queryByTestId('typewriter-cursor')).not.toBeInTheDocument();
  });

  it('renders cursor character as |', () => {
    render(<Typewriter text="AB" />);

    expect(screen.getByTestId('typewriter-cursor')).toHaveTextContent('|');
  });

  it('restarts typing when text prop changes', () => {
    const { rerender } = render(<Typewriter text="AB" />);

    act(() => {
      vi.advanceTimersByTime(190);
    });
    expect(screen.getByText('AB')).toBeInTheDocument();

    rerender(<Typewriter text="XYZ" />);

    expect(screen.queryByText('XYZ')).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(285);
    });
    expect(screen.getByText('XYZ')).toBeInTheDocument();
  });

  it('cleans up pending timers on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    const { unmount } = render(<Typewriter text="LONG" />);

    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
