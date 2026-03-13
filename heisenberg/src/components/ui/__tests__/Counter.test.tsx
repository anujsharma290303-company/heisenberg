import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Counter } from '../Counter';

describe('Counter', () => {
  let observerCallback: IntersectionObserverCallback | null = null;
  let observerOptions: IntersectionObserverInit | undefined;
  let observedElement: Element | null = null;
  let rafCallback: FrameRequestCallback | null = null;
  let nextFrameId = 0;
  let disconnectSpy: ReturnType<typeof vi.fn>;

  const triggerVisibility = (isIntersecting: boolean) => {
    if (observerCallback === null || observedElement === null) {
      throw new Error('IntersectionObserver has not been initialized');
    }

    const callback = observerCallback;
    const target = observedElement;

    act(() => {
      callback(
        [
          {
            isIntersecting,
            target,
          } as IntersectionObserverEntry,
        ],
        {} as IntersectionObserver
      );
    });
  };

  const runFrame = (timestamp: number) => {
    if (rafCallback === null) {
      throw new Error('requestAnimationFrame callback was not scheduled');
    }

    const callback = rafCallback;
    rafCallback = null;

    act(() => {
      callback(timestamp);
    });
  };

  beforeEach(() => {
    vi.useFakeTimers();
    disconnectSpy = vi.fn();
    observerCallback = null;
    observerOptions = undefined;
    observedElement = null;
    rafCallback = null;
    nextFrameId = 0;

    class IntersectionObserverMock {
      observe = vi.fn((element: Element) => {
        observedElement = element;
      });

      unobserve = vi.fn();
      disconnect = disconnectSpy;

      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        observerCallback = callback;
        observerOptions = options;
      }
    }

    vi.stubGlobal('IntersectionObserver', IntersectionObserverMock as unknown as typeof IntersectionObserver);
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback) => {
      rafCallback = callback;
      nextFrameId += 1;
      return nextFrameId;
    });
    vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders label text', () => {
    render(<Counter to={5} label="SEASONS" />);

    expect(screen.getByText('SEASONS')).toBeInTheDocument();
  });

  it('renders 0 before the counter becomes visible', () => {
    render(<Counter to={5} label="SEASONS" />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('starts counting only after IntersectionObserver reports the element visible', () => {
    render(<Counter to={100} label="EPISODES" />);

    expect(globalThis.requestAnimationFrame).not.toHaveBeenCalled();
    expect(observerOptions).toEqual({ threshold: 0.45 });

    triggerVisibility(true);

    expect(globalThis.requestAnimationFrame).toHaveBeenCalled();
  });

  it('uses the default duration of 1200ms when duration is not provided', () => {
    render(<Counter to={100} label="EPISODES" />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(1000);
    expect(screen.queryByText('100')).not.toBeInTheDocument();

    runFrame(1200);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('reaches the target value after the animation duration completes', () => {
    render(<Counter to={62} label="EPISODES" duration={500} />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(500);

    expect(screen.getByText('62')).toBeInTheDocument();
  });

  it('uses easeInOutCubic progression instead of linear progression', () => {
    render(<Counter to={100} label="EPISODES" duration={1200} />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(300);

    expect(screen.getByText('6')).toBeInTheDocument();
    expect(screen.queryByText('25')).not.toBeInTheDocument();
  });

  it('renders the suffix when provided', () => {
    render(<Counter to={5} label="SEASONS" suffix="+" />);

    expect(screen.getByText('0+')).toBeInTheDocument();
  });

  it('renders the final target value with suffix when counting completes', () => {
    render(<Counter to={5} label="SEASONS" suffix="+" duration={400} />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(400);

    expect(screen.getByText('5+')).toBeInTheDocument();
  });

  it('does not restart counting if the element re-enters the viewport after completion', () => {
    render(<Counter to={10} label="SEASONS" duration={400} />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(400);

    const callsAfterComplete = vi.mocked(globalThis.requestAnimationFrame).mock.calls.length;

    triggerVisibility(false);
    triggerVisibility(true);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(globalThis.requestAnimationFrame).toHaveBeenCalledTimes(callsAfterComplete);
  });

  it('cancels requestAnimationFrame on unmount', () => {
    const { unmount } = render(<Counter to={10} label="SEASONS" />);

    triggerVisibility(true);
    runFrame(0);
    unmount();

    expect(globalThis.cancelAnimationFrame).toHaveBeenCalled();
  });

  it('disconnects IntersectionObserver on unmount', () => {
    const { unmount } = render(<Counter to={10} label="SEASONS" />);

    unmount();

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it('handles a target value of 0 without animating past 0', () => {
    render(<Counter to={0} label="SEASONS" duration={500} />);

    triggerVisibility(true);
    runFrame(0);
    runFrame(500);

    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.queryByText('-0')).not.toBeInTheDocument();
  });
});