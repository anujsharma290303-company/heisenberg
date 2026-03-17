import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FilmGrain } from '../FilmGrain';

describe('FilmGrain', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('renders canvas', () => {
    const { container } = render(<FilmGrain />);
    const canvas = container.querySelector('canvas');

    expect(canvas).not.toBeNull();
  });

  it('calls getContext 2d on mount', () => {
    const getContextSpy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation(
        ((contextId: string) => (contextId === '2d' ? ({} as CanvasRenderingContext2D) : null)) as unknown as
          HTMLCanvasElement['getContext']
      );

    render(<FilmGrain />);

    expect(getContextSpy).toHaveBeenCalledWith('2d', { willReadFrequently: true });
  });

  it('cancels animation frame on unmount', () => {
    const cancelSpy = vi.spyOn(globalThis, 'cancelAnimationFrame');

    const { unmount } = render(<FilmGrain />);
    unmount();

    expect(cancelSpy).toHaveBeenCalled();
  });

  it('disconnects ResizeObserver on unmount', () => {
    const disconnect = vi.fn();

    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = disconnect;
    }

    vi.stubGlobal('ResizeObserver', ResizeObserverMock);

    const { unmount } = render(<FilmGrain />);
    unmount();

    expect(disconnect).toHaveBeenCalled();
  });
});