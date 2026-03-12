import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useGlitch } from '../useGlitch.ts';

describe('useGlitch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts not glitching', () => {
    const { result } = renderHook(() => useGlitch({ duration: 400 }));

    expect(result.current.isGlitching).toBe(false);
  });

  it('trigger sets isGlitching to true', () => {
    const { result } = renderHook(() => useGlitch({ duration: 400 }));

    act(() => {
      result.current.trigger();
    });

    expect(result.current.isGlitching).toBe(true);
  });

  it('second trigger while glitching is a no-op', () => {
    const { result } = renderHook(() => useGlitch({ duration: 400 }));

    act(() => {
      result.current.trigger();
      result.current.trigger();
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isGlitching).toBe(true);
  });

  it('becomes false after duration ms', () => {
    const { result } = renderHook(() => useGlitch({ duration: 400 }));

    act(() => {
      result.current.trigger();
      vi.advanceTimersByTime(401);
    });

    expect(result.current.isGlitching).toBe(false);
  });
});
